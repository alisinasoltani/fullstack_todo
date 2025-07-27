package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    app := fiber.New()

    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173",
        AllowMethods: "GET,POST,PUT,DELETE,PATCH",
        AllowHeaders: "Content-Type",
    }))

	app.Get("/", func (c *fiber.Ctx) error {
        return c.SendString("Server is up and running!")
    })

    port := os.Getenv("PORT")
    if port == "" {
        port = "3000"
    }
    log.Fatal(app.Listen(":" + port))
}