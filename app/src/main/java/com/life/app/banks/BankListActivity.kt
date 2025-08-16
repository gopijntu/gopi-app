package com.life.app.banks

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.lifecycle.lifecycleScope
import com.life.app.data.DatabaseHolder
import com.life.app.databinding.ActivityBankListBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class BankListActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBankListBinding
    private val viewModel: BankViewModel by viewModels {
        val db = DatabaseHolder.database
        if (db == null) {
            // This should not happen if the login flow is correct.
            // Redirect to login or show an error.
            Toast.makeText(this, "Error: Not logged in.", Toast.LENGTH_LONG).show()
            finish()
        }
        BankViewModelFactory(db!!.bankDao())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBankListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val adapter = BankListAdapter { bank ->
            // Handle item click -> navigate to AddEdit activity for editing
            val intent = Intent(this, AddEditBankActivity::class.java)
            intent.putExtra("BANK_ID", bank.id)
            startActivity(intent)
        }
        binding.banksRecyclerView.adapter = adapter

        lifecycleScope.launch {
            viewModel.allBanks.collect { banks ->
                adapter.submitList(banks)
            }
        }

        binding.fabAddBank.setOnClickListener {
            // Handle FAB click -> navigate to AddEdit activity for creating
            val intent = Intent(this, AddEditBankActivity::class.java)
            startActivity(intent)
        }
    }
}
