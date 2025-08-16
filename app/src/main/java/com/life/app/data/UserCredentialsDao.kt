package com.life.app.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UserCredentialsDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCredentials(credentials: UserCredentials)

    @Query("SELECT * FROM user_credentials WHERE id = 1")
    fun getCredentials(): Flow<UserCredentials?>

    @Query("SELECT * FROM user_credentials WHERE id = 1")
    suspend fun getCredentialsOnce(): UserCredentials?
}
