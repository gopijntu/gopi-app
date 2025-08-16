package com.life.app.banks

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.life.app.databinding.ActivityBanksMainBinding

class BanksMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBanksMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBanksMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.createRecordButton.setOnClickListener {
            val intent = Intent(this, AddEditBankActivity::class.java)
            startActivity(intent)
        }

        binding.viewRecordsButton.setOnClickListener {
            val intent = Intent(this, BankListActivity::class.java)
            startActivity(intent)
        }
    }
}
