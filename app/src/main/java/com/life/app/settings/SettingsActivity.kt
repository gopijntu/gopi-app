package com.life.app.settings

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.EditText
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.life.app.data.DatabaseHolder
import com.life.app.databinding.ActivitySettingsBinding
import com.life.app.utils.CryptoUtils
import java.io.FileOutputStream

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding

    private val createDocumentLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.also { uri ->
                val password = tempBackupPassword
                if (password != null) {
                    performBackup(uri, password)
                    tempBackupPassword = null // Clear the password
                }
            }
        }
    }

    private var tempBackupPassword: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.backupButton.setOnClickListener {
            showBackupPasswordDialog()
        }

        binding.restoreButton.setOnClickListener {
            launchRestoreFilePicker()
        }
    }

    private val openDocumentLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.also { uri ->
                showRestorePasswordDialog(uri)
            }
        }
    }

    private fun launchRestoreFilePicker() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*" // Or be more specific if you want
        }
        openDocumentLauncher.launch(intent)
    }

    private fun showRestorePasswordDialog(uri: Uri) {
        val editText = EditText(this).apply { inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD }
        MaterialAlertDialogBuilder(this)
            .setTitle("Enter Backup Password")
            .setMessage("Enter the password you used to create this backup.")
            .setView(editText)
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Restore") { _, _ ->
                val password = editText.text.toString()
                if (password.isNotBlank()) {
                    performRestore(uri, password)
                } else {
                    Toast.makeText(this, "Password cannot be empty", Toast.LENGTH_SHORT).show()
                }
            }
            .show()
    }

    private fun performRestore(uri: Uri, password: String) {
        try {
            val dbFile = getDatabasePath("life_database.db")

            val encryptedBytes = contentResolver.openInputStream(uri)?.readBytes()
            if (encryptedBytes == null) {
                Toast.makeText(this, "Failed to read backup file.", Toast.LENGTH_SHORT).show()
                return
            }

            val decryptedBytes = CryptoUtils.decrypt(encryptedBytes, password)

            // Close current DB connection
            DatabaseHolder.database?.close()
            DatabaseHolder.database = null

            // Overwrite the DB file
            dbFile.writeBytes(decryptedBytes)

            Toast.makeText(this, "Restore successful! The app will now restart.", Toast.LENGTH_LONG).show()

            // Restart the app
            finishAffinity()
            startActivity(Intent(this, com.life.app.MainActivity::class.java))

        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Restore failed: Invalid password or corrupt file.", Toast.LENGTH_LONG).show()
        }
    }

    private fun showBackupPasswordDialog() {
        val editText = EditText(this).apply { inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD }
        MaterialAlertDialogBuilder(this)
            .setTitle("Create Backup Password")
            .setMessage("This password will be required to restore the backup. Do not forget it.")
            .setView(editText)
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Continue") { _, _ ->
                val password = editText.text.toString()
                if (password.isNotBlank()) {
                    tempBackupPassword = password
                    launchBackupFilePicker()
                } else {
                    Toast.makeText(this, "Password cannot be empty", Toast.LENGTH_SHORT).show()
                }
            }
            .show()
    }

    private fun launchBackupFilePicker() {
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/octet-stream"
            putExtra(Intent.EXTRA_TITLE, "life_backup.enc")
        }
        createDocumentLauncher.launch(intent)
    }

    private fun performBackup(uri: Uri, password: String) {
        try {
            val dbFile = getDatabasePath("life_database.db")
            if (!dbFile.exists()) {
                Toast.makeText(this, "Database not found!", Toast.LENGTH_SHORT).show()
                return
            }

            // Close the database to ensure all data is written to the file
            DatabaseHolder.database?.close()
            DatabaseHolder.database = null // Force re-login and re-opening

            val dbBytes = dbFile.readBytes()
            val encryptedBytes = CryptoUtils.encrypt(dbBytes, password)

            contentResolver.openFileDescriptor(uri, "w")?.use {
                FileOutputStream(it.fileDescriptor).use { fos ->
                    fos.write(encryptedBytes)
                }
            }
            Toast.makeText(this, "Backup successful!", Toast.LENGTH_LONG).show()
            // After backup, the user should be sent back to login screen as we closed the DB
            finishAffinity() // Closes all activities
            startActivity(Intent(this, com.life.app.MainActivity::class.java))

        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Backup failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}
