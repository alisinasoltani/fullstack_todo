package models

import (
    "time"
)

type Subtask struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    TaskID    uint      `json:"task_id"`
    Title     string    `gorm:"not null" json:"title" validate:"required"`
    Done      bool      `json:"done"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}