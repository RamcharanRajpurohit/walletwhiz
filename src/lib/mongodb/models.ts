import mongoose, { Schema, Model } from 'mongoose'
import { Expense } from '@/types/expense'

const ExpenseSchema = new Schema<Expense>(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    note: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for all common query patterns
ExpenseSchema.index({ userId: 1, date: -1 })           // default list sort
ExpenseSchema.index({ userId: 1, type: 1, date: -1 })  // filter by type + sort
ExpenseSchema.index({ userId: 1, category: 1, date: -1 }) // filter by category + sort
ExpenseSchema.index({ userId: 1, type: 1, category: 1, date: -1 }) // combined filters
// Text index for search
ExpenseSchema.index({ note: 'text' })

export const ExpenseModel: Model<Expense> =
  mongoose.models.Expense || mongoose.model<Expense>('Expense', ExpenseSchema)
