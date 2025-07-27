package main

import (
	"log"
	"os"

	"todo/internal/database"
	"todo/internal/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    database.InitDB()

    app := fiber.New()

    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173",
        AllowMethods: "GET,POST,PUT,DELETE,PATCH",
        AllowHeaders: "Content-Type",
    }))


	app.Get("/", func (c *fiber.Ctx) error {
        return c.SendString("Server is up and running!")
    })

    app.Post("/tasks", handlers.CreateTask)
    app.Get("/tasks", handlers.GetTasks)
    app.Get("/tasks/:id", handlers.GetTaskByID)
    app.Put("/tasks/:id", handlers.UpdateTask)
    app.Delete("/tasks/:id", handlers.DeleteTask)
    app.Patch("/tasks/:id/done", handlers.UpdateTaskDone)

    app.Post("/tasks/:id/subtasks", handlers.CreateSubtask)
    app.Get("/tasks/:id/subtasks", handlers.GetSubtasks)
    app.Put("/subtasks/:id", handlers.UpdateSubtask)
    app.Delete("/subtasks/:id", handlers.DeleteSubtask)
    app.Patch("/subtasks/:id/done", handlers.UpdateSubtaskDone)

    port := os.Getenv("PORT")
    if port == "" {
        port = "3000"
    }
    log.Fatal(app.Listen(":" + port))
}