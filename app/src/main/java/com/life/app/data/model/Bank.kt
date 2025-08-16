package com.life.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "banks")
data class Bank(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val accountNumber: String,
    val bankName: String,
    val ifscCode: String,
    val cifNo: String,
    val username: String,
    val privy: String
)
