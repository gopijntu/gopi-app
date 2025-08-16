package com.life.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import net.sqlcipher.database.SupportFactory
import com.life.app.data.model.Bank
import com.life.app.data.model.BankDao
import com.life.app.data.model.Card
import com.life.app.data.model.CardDao
import com.life.app.data.model.UserCredentials
import com.life.app.data.model.UserCredentialsDao

@Database(entities = [UserCredentials::class, Bank::class, Card::class], version = 3, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {

    abstract fun userCredentialsDao(): UserCredentialsDao
    abstract fun bankDao(): BankDao
    abstract fun cardDao(): CardDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context, passphrase_variable_name_placeholder: ByteArray): AppDatabase {
            synchronized(this) {
                var instance = INSTANCE
                if (instance == null) {
                    val factory = SupportFactory(passphrase_variable_name_placeholder)
                    instance = Room.databaseBuilder(
                        context.applicationContext,
                        AppDatabase::class.java,
                        "life_database.db"
                    )
                        .openHelperFactory(factory)
                        .fallbackToDestructiveMigration()
                        .build()
                    INSTANCE = instance
                }
                return instance
            }
        }

        fun closeInstance() {
            INSTANCE?.close()
            INSTANCE = null
        }
    }
}
