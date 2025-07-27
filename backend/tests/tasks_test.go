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
	"github.com/gofiber/fiber/v2/middleware/cors"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"testing"
)

func setupTestApp() *fiber.App {
	// Initialize in-memory SQLite database
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}
	database.DB = db
	db.AutoMigrate(&models.Task{}, &models.Subtask{})

	// Initialize Fiber app
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH",
		AllowHeaders: "Content-Type",
	}))

	// Register task routes
	app.Post("/tasks", handlers.CreateTask)
	app.Get("/tasks", handlers.GetTasks)
	app.Get("/tasks/:id", handlers.GetTaskByID)
	app.Put("/tasks/:id", handlers.UpdateTask)
	app.Delete("/tasks/:id", handlers.DeleteTask)
	app.Patch("/tasks/:id/done", handlers.UpdateTaskDone)

	return app
}

func TestCreateTask(t *testing.T) {
	app := setupTestApp()

	tests := []struct {
		name           string
		body           string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Valid task",
			body:           `{"title":"Test Task","priority":"High","due_date":"2025-12-31"}`,
			expectedStatus: http.StatusCreated,
			expectedError:  "",
		},
		{
			name:           "Invalid priority",
			body:           `{"title":"Test Task","priority":"Invalid"}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Key: 'Task.Priority' Error:Field validation for 'Priority' failed on the 'oneof' tag",
		},
		{
			name:           "Missing title",
			body:           `{"priority":"High"}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Key: 'Task.Title' Error:Field validation for 'Title' failed on the 'required' tag",
		},
		{
			name:           "Invalid JSON",
			body:           `{invalid}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Cannot parse JSON",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/tasks", bytes.NewBuffer([]byte(tt.body)))
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

func TestGetTasks(t *testing.T) {
	app := setupTestApp()

	// Create a task for testing
	task := models.Task{Title: "Test Task", Priority: "Medium"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/tasks", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}

	var tasks []models.Task
	if err := json.NewDecoder(resp.Body).Decode(&tasks); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if len(tasks) != 1 {
		t.Errorf("Expected 1 task, got %d", len(tasks))
	}
	if len(tasks) > 0 && tasks[0].Title != "Test Task" {
		t.Errorf("Expected task title %q, got %q", "Test Task", tasks[0].Title)
	}
}

func TestGetTaskByID(t *testing.T) {
	app := setupTestApp()

	// Create a task for testing
	task := models.Task{Title: "Test Task", Priority: "High"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
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
			expectedStatus: http.StatusOK,
			expectedError:  "",
		},
		{
			name:           "Invalid ID",
			id:             "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Invalid task ID",
		},
		{
			name:           "Non-existent ID",
			id:             "999",
			expectedStatus: http.StatusNotFound,
			expectedError:  "Task not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/tasks/"+tt.id, nil)
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

func TestUpdateTask(t *testing.T) {
	app := setupTestApp()

	// Create a task for testing
	task := models.Task{Title: "Old Task", Priority: "Low"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
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
			body:           `{"title":"Updated Task","priority":"High","due_date":"2025-12-31"}`,
			expectedStatus: http.StatusOK,
			expectedError:  "",
		},
		{
			name:           "Invalid ID",
			id:             "invalid",
			body:           `{"title":"Updated Task"}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Invalid task ID",
		},
		{
			name:           "Non-existent ID",
			id:             "999",
			body:           `{"title":"Updated Task"}`,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Task not found",
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
			req := httptest.NewRequest(http.MethodPut, "/tasks/"+tt.id, bytes.NewBuffer([]byte(tt.body)))
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

func TestDeleteTask(t *testing.T) {
	app := setupTestApp()

	// Create a task for testing
	task := models.Task{Title: "Test Task", Priority: "Medium"}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
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
			expectedError:  "Invalid task ID",
		},
		{
			name:           "Non-existent ID",
			id:             "999",
			expectedStatus: http.StatusInternalServerError,
			expectedError:  "Could not delete task",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodDelete, "/tasks/"+tt.id, nil)
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

func TestUpdateTaskDone(t *testing.T) {
	app := setupTestApp()

	// Create a task for testing
	task := models.Task{Title: "Test Task", Priority: "Medium", Done: false}
	if err := database.DB.Create(&task).Error; err != nil {
		t.Fatalf("Failed to create test task: %v", err)
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
			expectedError:  "Invalid task ID",
		},
		{
			name:           "Non-existent ID",
			id:             "999",
			body:           `{"done":true}`,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Task not found",
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
			req := httptest.NewRequest(http.MethodPatch, "/tasks/"+tt.id+"/done", bytes.NewBuffer([]byte(tt.body)))
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