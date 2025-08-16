package com.life.app.banks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.asLiveData
import com.life.app.data.model.Bank
import com.life.app.data.model.BankDao
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

class BankViewModel(private val bankDao: BankDao) : ViewModel() {

    val allBanks: Flow<List<Bank>> = bankDao.getAllBanks()

    fun getBankById(id: Int): Flow<Bank?> = bankDao.getBankById(id)

    fun insert(bank: Bank) = viewModelScope.launch {
        bankDao.insertBank(bank)
    }

    fun update(bank: Bank) = viewModelScope.launch {
        bankDao.updateBank(bank)
    }

    fun delete(bank: Bank) = viewModelScope.launch {
        bankDao.deleteBank(bank)
    }
}

class BankViewModelFactory(private val bankDao: BankDao) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(BankViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return BankViewModel(bankDao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
