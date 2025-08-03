package routes

import (
    "shopping-cart/controllers"
    "shopping-cart/middleware"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {

    r.POST("/users", func(c *gin.Context) {
        controllers.RegisterUser(c, db)
    })

    r.POST("/users/login", func(c *gin.Context) {
        controllers.LoginUser(c, db)
    })

    r.GET("/items", func(c *gin.Context) {
        controllers.GetItems(c, db)
    })

    admin := r.Group("/admin")
    admin.Use(middleware.AuthMiddleware(db), middleware.AdminOnly())

    admin.POST("/items", func(c *gin.Context) {
        controllers.AddItem(c, db)
    })

    admin.PUT("/items/:id", func(c *gin.Context) {
        controllers.UpdateItem(c, db)
    })

    admin.DELETE("/items/:id", func(c *gin.Context) {
        controllers.DeleteItem(c, db)
    })

    auth := r.Group("/")
    auth.Use(middleware.AuthMiddleware(db))

    auth.POST("/cart", func(c *gin.Context) {
        userID := c.GetUint("userID")
        controllers.AddToCart(c, db, userID)
    })

    auth.GET("/cart", func(c *gin.Context) {
        userID := c.GetUint("userID")
        controllers.GetCart(c, db, userID)
    })

    auth.POST("/orders", func(c *gin.Context) {
        userID := c.GetUint("userID")
        controllers.CreateOrder(c, db, userID)
    })

    auth.GET("/orders", func(c *gin.Context) {
        userID := c.GetUint("userID")
        controllers.GetOrders(c, db, userID)
    })
}
