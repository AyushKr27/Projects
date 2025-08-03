package controllers

import (
    "net/http"
    "shopping-cart/models"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func AddToCart(c *gin.Context, db *gorm.DB, userID uint) {
    var req struct {
        ItemIDs []uint `json:"item_ids"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var cart models.Cart
    if err := db.Where("user_id = ?", userID).FirstOrCreate(&cart).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get or create cart"})
        return
    }

    for _, id := range req.ItemIDs {
        var cartItem models.CartItem
        err := db.Where("cart_id = ? AND item_id = ?", cart.ID, id).First(&cartItem).Error

        if err == gorm.ErrRecordNotFound {
            db.Create(&models.CartItem{CartID: cart.ID, ItemID: id, Quantity: 1})
        } else if err == nil {
            cartItem.Quantity += 1
            db.Save(&cartItem)
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item to cart"})
            return
        }
    }

    c.JSON(http.StatusOK, gin.H{"message": "Items added to cart"})
}

func GetCart(c *gin.Context, db *gorm.DB, userID uint) {
    var cart models.Cart
    if err := db.Where("user_id = ?", userID).FirstOrCreate(&cart).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
        return
    }

    var cartItems []models.CartItem
    if err := db.Preload("Item").Where("cart_id = ?", cart.ID).Find(&cartItems).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load cart items"})
        return
    }

    var responseItems []gin.H
    for _, ci := range cartItems {
        if ci.Item.ID == 0 {
            continue
        }

        responseItems = append(responseItems, gin.H{
            "cart_id":  cart.ID,
            "item_id":  ci.ItemID,
            "name":     ci.Item.Name,
            "image":    ci.Item.Image,
            "price":    ci.Item.Price,
            "quantity": ci.Quantity,
        })
    }

    c.JSON(http.StatusOK, gin.H{"items": responseItems})
}
