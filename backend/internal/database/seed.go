// backend/internal/database/seed.go
package database

import (
    "time"
    "log"
    "fmt"

	"gorm.io/gorm"
    "todo/internal/models"
)

func SampleTasks() []models.Task {
	now := time.Now()
	tasks := []models.Task{
		{
			Title:       "Setup Development Environment",
			Description: "Install required tools and dependencies",
			Priority:    "High",
			Assignee:    "Alice",
			DueDate:     now.AddDate(0, 0, 3),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Install Go", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Setup Fiber project", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Create DB schema", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Design Landing Page",
			Description: "Create the frontend design layout",
			Priority:    "Medium",
			Assignee:    "Bob",
			DueDate:     now.AddDate(0, 0, 5),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Header layout", Done: true, CreatedAt: now, UpdatedAt: now},
				{Title: "Hero section", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Footer section", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Implement Authentication",
			Description: "Add login and signup features",
			Priority:    "High",
			Assignee:    "Charlie",
			DueDate:     now.AddDate(0, 0, 7),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Signup endpoint", Done: true, CreatedAt: now, UpdatedAt: now},
				{Title: "Login endpoint", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "JWT middleware", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Setup CI/CD",
			Description: "Automate the deployment process",
			Priority:    "Medium",
			Assignee:    "Dana",
			DueDate:     now.AddDate(0, 0, 10),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Setup GitHub Actions", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Write Dockerfile", Done: true, CreatedAt: now, UpdatedAt: now},
				{Title: "Create deployment script", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Database Optimization",
			Description: "Index important fields for faster querying",
			Priority:    "High",
			Assignee:    "Eve",
			DueDate:     now.AddDate(0, 0, 2),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Add index on task title", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Analyze slow queries", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Normalize schema", Done: true, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "User Profile Page",
			Description: "Build user profile section with editable fields",
			Priority:    "Low",
			Assignee:    "Frank",
			DueDate:     now.AddDate(0, 0, 9),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Display user data", Done: true, CreatedAt: now, UpdatedAt: now},
				{Title: "Edit profile form", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Upload profile picture", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Create API Documentation",
			Description: "Write Swagger/OpenAPI docs for endpoints",
			Priority:    "Medium",
			Assignee:    "Grace",
			DueDate:     now.AddDate(0, 0, 6),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Add comments to routes", Done: true, CreatedAt: now, UpdatedAt: now},
				{Title: "Generate Swagger file", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Host docs on /docs", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Unit Testing",
			Description: "Add tests for service logic and handlers",
			Priority:    "High",
			Assignee:    "Hannah",
			DueDate:     now.AddDate(0, 0, 4),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Write task handler tests", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Write subtask model tests", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Test middleware functions", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Fix Bug in Task Deletion",
			Description: "Tasks not deleting related subtasks",
			Priority:    "High",
			Assignee:    "Ivan",
			DueDate:     now.AddDate(0, 0, 1),
			Done:        true,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Reproduce bug", Done: true, CreatedAt: now, UpdatedAt: now},
				{Title: "Fix cascade delete", Done: true, CreatedAt: now, UpdatedAt: now},
				{Title: "Write regression test", Done: true, CreatedAt: now, UpdatedAt: now},
			},
		},
		{
			Title:       "Add Filtering & Sorting",
			Description: "Enable users to filter/sort tasks by status and due date",
			Priority:    "Medium",
			Assignee:    "Jasmine",
			DueDate:     now.AddDate(0, 0, 8),
			Done:        false,
			CreatedAt:   now,
			UpdatedAt:   now,
			Subtasks: []models.Subtask{
				{Title: "Add filter by priority", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Sort by due date", Done: false, CreatedAt: now, UpdatedAt: now},
				{Title: "Toggle show completed", Done: false, CreatedAt: now, UpdatedAt: now},
			},
		},
	}

	return tasks
}

func SeedDatabase(db *gorm.DB) {
    // Auto migrate
    db.AutoMigrate(&models.Task{}, &models.Subtask{})

    for _, task := range SampleTasks() {
        if err := db.Create(&task).Error; err != nil {
            log.Printf("Error inserting '%s': %v", task.Title, err)
        } else {
            fmt.Printf("Inserted task: %s\n", task.Title)
        }
    }
}