package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"shopping-cart/models"
	"shopping-cart/routes"
)

func main() {
	db, err := gorm.Open(sqlite.Open("shop.db"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	db.AutoMigrate(&models.User{}, &models.Item{}, &models.Cart{}, &models.CartItem{}, &models.Order{})

	seedAdminUser(db)

	r := gin.Default()

	r.Static("/uploads", "./uploads")

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r, db)

	r.Run(":8080")
}

func seedAdminUser(db *gorm.DB) {
	var admin models.User
	err := db.Where("username = ?", "admin").First(&admin).Error

	if err == gorm.ErrRecordNotFound {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)

		admin = models.User{
			Username: "admin",
			Password: string(hashedPassword),
			Role:     "admin",
			Token:    nil,
		}

		if err := db.Create(&admin).Error; err != nil {
			fmt.Println("❌ Error creating admin user:", err)
		} else {
			fmt.Println("✅ Admin user created")
		}
	} else {
		fmt.Println("ℹ️ Admin user already exists.")
	}
}
