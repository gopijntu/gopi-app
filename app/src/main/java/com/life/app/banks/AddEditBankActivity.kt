package com.life.app.banks

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import androidx.lifecycle.lifecycleScope
import com.life.app.data.DatabaseHolder
import com.life.app.data.model.Bank
import com.life.app.databinding.ActivityAddEditBankBinding
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class AddEditBankActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddEditBankBinding
    private var currentBank: Bank? = null
    private val viewModel: BankViewModel by viewModels {
        BankViewModelFactory(DatabaseHolder.database!!.bankDao())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddEditBankBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val bankId = intent.getIntExtra("BANK_ID", -1)
        if (bankId != -1) {
            // Edit mode
            binding.deleteBankButton.visibility = View.VISIBLE
            lifecycleScope.launch {
                currentBank = viewModel.getBankById(bankId).first()
                currentBank?.let { populateUi(it) }
            }
        }

        binding.saveBankButton.setOnClickListener {
            saveBank()
        }

        binding.deleteBankButton.setOnClickListener {
            showDeleteConfirmationDialog()
        }
    }

    private fun showDeleteConfirmationDialog() {
        if (currentBank != null) {
            MaterialAlertDialogBuilder(this)
                .setTitle("Delete Record")
                .setMessage("Are you sure you want to delete this bank record? This action cannot be undone.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Delete") { _, _ ->
                    viewModel.delete(currentBank!!)
                    Toast.makeText(this, "Record deleted", Toast.LENGTH_SHORT).show()
                    finish()
                }
                .show()
        }
    }

    private fun populateUi(bank: Bank) {
        binding.nameEditText.setText(bank.name)
        binding.accountNumberEditText.setText(bank.accountNumber)
        binding.bankNameEditText.setText(bank.bankName)
        binding.ifscEditText.setText(bank.ifscCode)
        binding.cifEditText.setText(bank.cifNo)
        binding.usernameEditText.setText(bank.username)
        binding.privyEditText.setText(bank.privy)
    }

    private fun saveBank() {
        val name = binding.nameEditText.text.toString()
        val accountNumber = binding.accountNumberEditText.text.toString()
        val bankName = binding.bankNameEditText.text.toString()
        val ifsc = binding.ifscEditText.text.toString()
        val cif = binding.cifEditText.text.toString()
        val username = binding.usernameEditText.text.toString()
        val privy = binding.privyEditText.text.toString()

        if (accountNumber.isBlank()) {
            binding.accountNumberInputLayout.error = "Account number is mandatory"
            return
        }
        binding.accountNumberInputLayout.error = null

        val bank = Bank(
            id = currentBank?.id ?: 0,
            name = name,
            accountNumber = accountNumber,
            bankName = bankName,
            ifscCode = ifsc,
            cifNo = cif,
            username = username,
            privy = privy
        )

        if (currentBank == null) {
            viewModel.insert(bank)
            Toast.makeText(this, "Record saved", Toast.LENGTH_SHORT).show()
        } else {
            viewModel.update(bank)
            Toast.makeText(this, "Record updated", Toast.LENGTH_SHORT).show()
        }
        finish() // Go back to the list
    }
}
