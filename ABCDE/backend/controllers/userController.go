package controllers

import (
    "net/http"
    "shopping-cart/models"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

func RegisterUser(c *gin.Context, db *gorm.DB) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var existing models.User
    if err := db.Where("username = ?", user.Username).First(&existing).Error; err == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Username already taken"})
        return
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    user.Password = string(hashedPassword)

    if user.Role == "" {
        user.Role = "user"
    }

    user.Token = nil

    if err := db.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
}

func LoginUser(c *gin.Context, db *gorm.DB) {
    var req models.User
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var user models.User
    if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
        return
    }

    token := user.Username + "_token"
    user.Token = &token

    if err := db.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "token":    token,
        "username": user.Username,
        "role":     user.Role,
    })
}
