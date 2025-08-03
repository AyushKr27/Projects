package middleware

import (
    "net/http"
    "shopping-cart/models"
    "strings"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")

        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
            return
        }

        var user models.User
        if err := db.Where("token = ?", token).First(&user).Error; err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
            return
        }

        c.Set("userID", user.ID)
        c.Set("userRole", user.Role)
        c.Set("db", db)

        c.Next()
    }
}
