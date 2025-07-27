package models

import (
    "time"
)

type Task struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Title       string    `gorm:"not null" json:"title" validate:"required"`
    Description string    `json:"description"`
    Priority    string    `gorm:"type:enum('Low','Medium','High');default:'Medium'" json:"priority" validate:"oneof=Low Medium High"`
    Assignee    string    `json:"assignee"`
    DueDate     time.Time `json:"due_date"`
    Done        bool      `json:"done"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    Subtasks    []Subtask `json:"subtasks"`
}