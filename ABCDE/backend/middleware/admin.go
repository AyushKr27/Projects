package middleware

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func AdminOnly() gin.HandlerFunc {
    return func(c *gin.Context) {
        roleInterface, exists := c.Get("userRole")
        if !exists {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
            return
        }

        role, ok := roleInterface.(string)
        if !ok {
            c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Invalid user role format"})
            return
        }

        if role != "admin" {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
            return
        }

        c.Next()
    }
}
