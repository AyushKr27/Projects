package models

type Order struct {
    ID     uint `gorm:"primaryKey"`
    UserID uint
    CartID uint
}
