package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"shopping-cart/models"
)

func AddItem(c *gin.Context, db *gorm.DB) {
	var item models.Item

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if item.Name == "" || item.Description == "" || item.Image == "" || item.Price == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, description, price, and image URL are required"})
		return
	}

	if err := db.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item"})
		return
	}

	c.JSON(http.StatusOK, item)
}

func GetItems(c *gin.Context, db *gorm.DB) {
	var items []models.Item
	if err := db.Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch items"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func DeleteItem(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if err := db.Delete(&models.Item{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}

func UpdateItem(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")

	var existing models.Item
	if err := db.First(&existing, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}

	var update models.Item
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if update.Name != "" {
		existing.Name = update.Name
	}
	if update.Description != "" {
		existing.Description = update.Description
	}
	if update.Price != 0 {
		existing.Price = update.Price
	}
	if update.Image != "" {
		existing.Image = update.Image
	}

	if err := db.Save(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item"})
		return
	}

	c.JSON(http.StatusOK, existing)
}
