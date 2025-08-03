package controllers

import (
    "net/http"
    "shopping-cart/models"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func CreateOrder(c *gin.Context, db *gorm.DB, userID uint) {
    var cart models.Cart
    db.Where("user_id = ?", userID).First(&cart)

    order := models.Order{UserID: userID, CartID: cart.ID}
    db.Create(&order)

    c.JSON(http.StatusOK, gin.H{"message": "Order placed", "order_id": order.ID})
}

func GetOrders(c *gin.Context, db *gorm.DB, userID uint) {
    var orders []models.Order
    db.Where("user_id = ?", userID).Find(&orders)
    c.JSON(http.StatusOK, orders)
}
