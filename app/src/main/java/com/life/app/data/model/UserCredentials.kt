package com.life.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_credentials")
data class UserCredentials(
    @PrimaryKey val id: Int = 1, // Singleton entity, always use the same ID
    val masterPasswordHash: String,
    val securityQuestion1: String,
    val securityAnswer1Hash: String,
    val securityQuestion2: String,
    val securityAnswer2Hash: String
)
