package handlers

import (
	"strconv"
	"todo/internal/database"
	"todo/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func CreateSubtask(c *fiber.Ctx) error {
	taskID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid task ID"})
	}
	var subtask models.Subtask
	if err := c.BodyParser(&subtask); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	subtask.TaskID = uint(taskID)
	if err := validate.Struct(&subtask); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if err := database.DB.Create(&subtask).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create subtask"})
	}
	return c.Status(fiber.StatusCreated).JSON(subtask)
}

func GetSubtasks(c *fiber.Ctx) error {
	taskID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid task ID"})
	}
	var subtasks []models.Subtask
	if err := database.DB.Where("task_id = ?", taskID).Find(&subtasks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not retrieve subtasks"})
	}
	return c.JSON(subtasks)
}

func UpdateSubtask(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid subtask ID"})
	}
	var subtask models.Subtask
	if err := database.DB.First(&subtask, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Subtask not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not retrieve subtask"})
	}
	var updateSubtask models.Subtask
	if err := c.BodyParser(&updateSubtask); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	if err := validate.Struct(&updateSubtask); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	subtask.Title = updateSubtask.Title
	if err := database.DB.Save(&subtask).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not update subtask"})
	}
	return c.JSON(subtask)
}

func DeleteSubtask(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid subtask ID"})
	}
	if err := database.DB.Delete(&models.Subtask{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not delete subtask"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func UpdateSubtaskDone(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid subtask ID"})
	}
	var input struct {
		Done bool `json:"done"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	var subtask models.Subtask
	if err := database.DB.First(&subtask, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Subtask not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not retrieve subtask"})
	}
	subtask.Done = input.Done
	if err := database.DB.Save(&subtask).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not update subtask"})
	}
	return c.JSON(subtask)
}