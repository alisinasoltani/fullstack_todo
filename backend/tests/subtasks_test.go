package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"todo/internal/database"
	"todo/internal/handlers"
	"todo/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"testing"
)

func setupSubtaskTestApp() *fiber.App {
	// Initialize in-memory SQLite database
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}
	database.DB = db
	db.AutoMigrate(&models.Task{}, &models.Subtask{})

	// Initialize Fiber app
	app := fiber.New()

	// Register subtask routes
	app.Post("/tasks/:id/subtasks", handlers.CreateSubtask)
	app.Get("/tasks/:id/subtasks", handlers.GetSubtasks)
	app.Put("/subtasks/:id", handlers.UpdateSubtask)
	app.Delete("/subtasks/:id", handlers.DeleteSubtask)
	app.Patch("/subtasks/:id/done", handlers.UpdateSubtaskDone)

	return app
}

func TestCreateSubtask(t *testing.T) {
	app := setupSubtaskTestApp()

	// Create a task for testing
	task := models.Task{Title: "Test Task", Priority: "Medium"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
	}

	tests := []struct {
		name           string
		taskID         string
		body           string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Valid subtask",
			taskID:         "1",
			body:           `{"title":"Test Subtask"}`,
			expectedStatus: http.StatusCreated,
			expectedError:  "",
		},
		{
			name:           "Invalid task ID",
			taskID:         "invalid",
			body:           `{"title":"Test Subtask"}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Invalid task ID",
		},
		{
			name:           "Missing title",
			taskID:         "1",
			body:           `{}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Key: 'Subtask.Title' Error:Field validation for 'Title' failed on the 'required' tag",
		},
		{
			name:           "Invalid JSON",
			taskID:         "1",
			body:           `{invalid}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Cannot parse JSON",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/tasks/"+tt.taskID+"/subtasks", bytes.NewBuffer([]byte(tt.body)))
			req.Header.Set("Content-Type", "application/json")
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Failed to execute request: %v", err)
			}
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
			if tt.expectedError != "" {
				var result map[string]string
				if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}
				if result["error"] != tt.expectedError {
					t.Errorf("Expected error %q, got %q", tt.expectedError, result["error"])
				}
			}
		})
	}
}

func TestGetSubtasks(t *testing.T) {
	app := setupSubtaskTestApp()

	// Create a task and subtask for testing
	task := models.Task{Title: "Test Task", Priority: "Medium"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
	}
	subtask := models.Subtask{TaskID: task.ID, Title: "Test Subtask"}
	if err := database.DB.Create(&subtask).Error; err != nil {
		t.Fatalf("Failed to create test subtask: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/tasks/1/subtasks", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}

	var subtasks []models.Subtask
	if err := json.NewDecoder(resp.Body).Decode(&subtasks); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if len(subtasks) != 1 {
		t.Errorf("Expected 1 subtask, got %d", len(subtasks))
	}
	if len(subtasks) > 0 && subtasks[0].Title != "Test Subtask" {
		t.Errorf("Expected subtask title %q, got %q", "Test Subtask", subtasks[0].Title)
	}
}

func TestUpdateSubtask(t *testing.T) {
	app := setupSubtaskTestApp()

	// Create a task and subtask for testing
	task := models.Task{Title: "Test Task", Priority: "Medium"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
	}
	subtask := models.Subtask{TaskID: task.ID, Title: "Old Subtask"}
	if err := database.DB.Create(&subtask).Error; err != nil {
		t.Fatalf("Failed to create test subtask: %v", err)
	}

	tests := []struct {
		name           string
		id             string
		body           string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Valid update",
			id:             "1",
			body:           `{"title":"Updated Subtask"}`,
			expectedStatus: http.StatusOK,
			expectedError:  "",
		},
		{
			name:           "Invalid ID",
			id:             "invalid",
			body:           `{"title":"Updated Subtask"}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Invalid subtask ID",
		},
		{
			name:           "Non-existent ID",
			id:             "999",
			body:           `{"title":"Updated Subtask"}`,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Subtask not found",
		},
		{
			name:           "Invalid JSON",
			id:             "1",
			body:           `{invalid}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Cannot parse JSON",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, "/subtasks/"+tt.id, bytes.NewBuffer([]byte(tt.body)))
			req.Header.Set("Content-Type", "application/json")
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Failed to execute request: %v", err)
			}
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
			if tt.expectedError != "" {
				var result map[string]string
				if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}
				if result["error"] != tt.expectedError {
					t.Errorf("Expected error %q, got %q", tt.expectedError, result["error"])
				}
			}
		})
	}
}

func TestDeleteSubtask(t *testing.T) {
	app := setupSubtaskTestApp()

	// Create a task and subtask for testing
	task := models.Task{Title: "Test Task", Priority: "Medium"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
	}
	subtask := models.Subtask{TaskID: task.ID, Title: "Test Subtask"}
	if err := database.DB.Create(&subtask).Error; err != nil {
		t.Fatalf("Failed to create test subtask: %v", err)
	}

	tests := []struct {
		name           string
		id             string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Valid ID",
			id:             "1",
			expectedStatus: http.StatusNoContent,
			expectedError:  "",
		},
		{
			name:           "Invalid ID",
			id:             "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Invalid subtask ID",
		},
		{
			name:           "Non-existent ID",
			id:             "999",
			expectedStatus: http.StatusInternalServerError,
			expectedError:  "Could not delete subtask",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodDelete, "/subtasks/"+tt.id, nil)
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Failed to execute request: %v", err)
			}
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
			if tt.expectedError != "" {
				var result map[string]string
				if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}
				if result["error"] != tt.expectedError {
					t.Errorf("Expected error %q, got %q", tt.expectedError, result["error"])
				}
			}
		})
	}
}

func TestUpdateSubtaskDone(t *testing.T) {
	app := setupSubtaskTestApp()

	// Create a task and subtask for testing
	task := models.Task{Title: "Test Task", Priority: "Medium"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
	}
	subtask := models.Subtask{TaskID: task.ID, Title: "Test Subtask", Done: false}
	if err := database.DB.Create(&subtask).Error; err != nil {
		t.Fatalf("Failed to create test subtask: %v", err)
	}

	tests := []struct {
		name           string
		id             string
		body           string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Mark as done",
			id:             "1",
			body:           `{"done":true}`,
			expectedStatus: http.StatusOK,
			expectedError:  "",
		},
		{
			name:           "Invalid ID",
			id:             "invalid",
			body:           `{"done":true}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Invalid subtask ID",
		},
		{
			name:           "Non-existent ID",
			id:             "999",
			body:           `{"done":true}`,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Subtask not found",
		},
		{
			name:           "Invalid JSON",
			id:             "1",
			body:           `{invalid}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Cannot parse JSON",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPatch, "/subtasks/"+tt.id+"/done", bytes.NewBuffer([]byte(tt.body)))
			req.Header.Set("Content-Type", "application/json")
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Failed to execute request: %v", err)
			}
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
			if tt.expectedError != "" {
				var result map[string]string
				if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}
				if result["error"] != tt.expectedError {
					t.Errorf("Expected error %q, got %q", tt.expectedError, result["error"])
				}
			}
		})
	}
}