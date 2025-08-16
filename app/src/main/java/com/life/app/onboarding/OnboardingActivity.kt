package com.life.app.onboarding

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.life.app.data.AppDatabase
import com.life.app.data.DatabaseHolder
import com.life.app.data.model.UserCredentials
import com.life.app.databinding.ActivityOnboardingBinding
import com.life.app.home.HomeActivity
import com.life.app.utils.SecurityUtils
import kotlinx.coroutines.launch

class OnboardingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.saveButton.setOnClickListener {
            if (validateInput()) {
                saveCredentialsAndNavigate()
            }
        }
    }

    private fun validateInput(): Boolean {
        var isValid = true
        // Clear previous errors
        binding.passwordInputLayout.error = null
        binding.confirmPasswordInputLayout.error = null
        binding.question1InputLayout.error = null
        binding.answer1InputLayout.error = null
        binding.question2InputLayout.error = null
        binding.answer2InputLayout.error = null

        if (binding.passwordEditText.text.toString().length < 6) {
            binding.passwordInputLayout.error = "Password must be at least 6 characters"
            isValid = false
        }
        if (binding.passwordEditText.text.toString() != binding.confirmPasswordEditText.text.toString()) {
            binding.confirmPasswordInputLayout.error = "Passwords do not match"
            isValid = false
        }
        if (binding.question1EditText.text.isNullOrBlank()) {
            binding.question1InputLayout.error = "Question 1 cannot be empty"
            isValid = false
        }
        if (binding.answer1EditText.text.isNullOrBlank()) {
            binding.answer1InputLayout.error = "Answer 1 cannot be empty"
            isValid = false
        }
        if (binding.question2EditText.text.isNullOrBlank()) {
            binding.question2InputLayout.error = "Question 2 cannot be empty"
            isValid = false
        }
        if (binding.answer2EditText.text.isNullOrBlank()) {
            binding.answer2InputLayout.error = "Answer 2 cannot be empty"
            isValid = false
        }

        return isValid
    }

    private fun saveCredentialsAndNavigate() {
        lifecycleScope.launch {
            try {
                val password = binding.passwordEditText.text.toString()
                val question1 = binding.question1EditText.text.toString()
                val answer1 = binding.answer1EditText.text.toString()
                val question2 = binding.question2EditText.text.toString()
                val answer2 = binding.answer2EditText.text.toString()

                // The user-provided password is used to encrypt the database
                val db = AppDatabase.getInstance(applicationContext, password.toByteArray())
                DatabaseHolder.database = db

                val credentials = UserCredentials(
                    masterPasswordHash = SecurityUtils.hashString(password),
                    securityQuestion1 = question1,
                    securityAnswer1Hash = SecurityUtils.hashString(answer1),
                    securityQuestion2 = question2,
                    securityAnswer2Hash = SecurityUtils.hashString(answer2)
                )

                db.userCredentialsDao().insertCredentials(credentials)

                // Mark onboarding as complete
                val sharedPrefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                with(sharedPrefs.edit()) {
                    putBoolean("onboarding_complete", true)
                    apply()
                }

                // Navigate to home
                val intent = Intent(this@OnboardingActivity, HomeActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()

            } catch (e: Exception) {
                // In a real app, log this error
                e.printStackTrace()
                runOnUiThread {
                    Toast.makeText(this@OnboardingActivity, "Error saving credentials.", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
