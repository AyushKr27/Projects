package models

type User struct {
    ID       uint   `gorm:"primaryKey" json:"id"`
    Username string `gorm:"unique" json:"username"`
    Password string `json:"password"`
    Token    *string `gorm:"unique" json:"token"`
    Role     string `json:"role"`
}
