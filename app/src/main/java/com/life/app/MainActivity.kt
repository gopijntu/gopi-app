package com.life.app

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.life.app.login.LoginActivity
import com.life.app.onboarding.OnboardingActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val sharedPrefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val isOnboardingComplete = sharedPrefs.getBoolean("onboarding_complete", false)

        if (isOnboardingComplete) {
            startActivity(Intent(this, LoginActivity::class.java))
        } else {
            startActivity(Intent(this, OnboardingActivity::class.java))
        }
        finish()
    }
}
