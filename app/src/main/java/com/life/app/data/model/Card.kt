package com.life.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cards")
data class Card(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val bankName: String,
    val cardType: String, // "Visa" or "Master"
    val cardNumber: String,
    val cvv: String,
    val validTill: String, // MM/YY format
    val cardName: String // Optional note
)
