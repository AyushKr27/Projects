package models

type Item struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `gorm:"not null" json:"name"`
	Description string  `gorm:"not null" json:"description"`
	Price       float64 `gorm:"not null" json:"price"`
	Image       string  `gorm:"not null" json:"image"`
}
