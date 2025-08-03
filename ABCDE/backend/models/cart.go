package models

type Cart struct {
	ID     uint       `gorm:"primaryKey"`
	UserID uint
	Items  []CartItem `gorm:"foreignKey:CartID"`
}

type CartItem struct {
	ID       uint `gorm:"primaryKey"`
	CartID   uint
	ItemID   uint
	Quantity int       `gorm:"default:1"`
	Item     Item      `gorm:"foreignKey:ItemID"`
}
