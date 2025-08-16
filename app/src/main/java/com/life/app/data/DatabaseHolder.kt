package com.life.app.data

/**
 * A simple singleton object to hold the database instance after login.
 * In a larger app, a proper dependency injection framework like Hilt would be used.
 */
object DatabaseHolder {
    var database: AppDatabase? = null
}
