package com.life.app.login

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.life.app.data.AppDatabase
import com.life.app.data.DatabaseHolder
import com.life.app.databinding.ActivityLoginBinding
import com.life.app.home.HomeActivity
import com.life.app.utils.SecurityUtils
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.loginButton.setOnClickListener {
            handlePasswordLogin()
        }
    }

    private fun handlePasswordLogin() {
        val password = binding.passwordEditText.text.toString()
        if (password.isBlank()) {
            binding.passwordInputLayout.error = "Password cannot be empty"
            return
        }
        binding.passwordInputLayout.error = null

        lifecycleScope.launch {
            try {
                // The act of getting the DB instance with the password verifies it.
                val db = AppDatabase.getInstance(applicationContext, password.toByteArray())
                val credentials = db.userCredentialsDao().getCredentialsOnce()

                if (credentials != null && credentials.masterPasswordHash == SecurityUtils.hashString(password)) {
                    // Password is correct, store the DB instance and navigate to home
                    DatabaseHolder.database = db
                    navigateToHome()
                } else {
                    // This case should ideally not be reached if DB opens, but as a safeguard:
                    showInvalidPasswordError()
                }
            } catch (e: Exception) {
                // This will catch errors from SQLCipher if the password is wrong
                e.printStackTrace()
                showInvalidPasswordError()
            }
        }
    }

    private fun navigateToHome() {
        val intent = Intent(this, HomeActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    private fun showInvalidPasswordError() {
        runOnUiThread {
            binding.passwordInputLayout.error = "Invalid password"
        }
    }
}
