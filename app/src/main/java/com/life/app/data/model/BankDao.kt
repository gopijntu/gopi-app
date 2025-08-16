package com.life.app.data.model

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface BankDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBank(bank: Bank)

    @Update
    suspend fun updateBank(bank: Bank)

    @Delete
    suspend fun deleteBank(bank: Bank)

    @Query("SELECT * FROM banks ORDER BY name ASC")
    fun getAllBanks(): Flow<List<Bank>>

    @Query("SELECT * FROM banks WHERE id = :id")
    fun getBankById(id: Int): Flow<Bank?>
}
