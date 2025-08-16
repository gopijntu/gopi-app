package com.life.app.banks

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.life.app.data.model.Bank
import com.life.app.databinding.ListItemBankBinding

class BankListAdapter(private val onItemClicked: (Bank) -> Unit) :
    ListAdapter<Bank, BankListAdapter.BankViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BankViewHolder {
        val binding = ListItemBankBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return BankViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BankViewHolder, position: Int) {
        val current = getItem(position)
        holder.itemView.setOnClickListener {
            onItemClicked(current)
        }
        holder.bind(current)
    }

    class BankViewHolder(private val binding: ListItemBankBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(bank: Bank) {
            binding.bankNameTextView.text = bank.bankName
            binding.accountNameTextView.text = bank.name
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<Bank>() {
            override fun areItemsTheSame(oldItem: Bank, newItem: Bank): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: Bank, newItem: Bank): Boolean {
                return oldItem == newItem
            }
        }
    }
}
