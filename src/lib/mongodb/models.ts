import mongoose, { Schema, Model } from 'mongoose'
import { Expense } from '@/types/expense'

const ExpenseSchema = new Schema<Expense>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    note: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

ExpenseSchema.index({ userId: 1, date: -1 })
ExpenseSchema.index({ userId: 1, category: 1 })

export const ExpenseModel: Model<Expense> = 
  mongoose.models.Expense || mongoose.model<Expense>('Expense', ExpenseSchema)
