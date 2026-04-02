/**
 * Seed script — inserts 1000 realistic transactions for a specific user.
 *
 * Usage:
 *   npx tsx scripts/seed.ts --userId <supabase-user-id>
 *   npx tsx scripts/seed.ts --userId <supabase-user-id> --clear   (wipe first)
 *
 * Requires: MONGODB_URI and MONGODB_DB_NAME in .env.local
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })
import mongoose from 'mongoose'

// ─── Config ──────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB  = process.env.MONGODB_DB_NAME || 'expense_tracker'

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not set in .env.local')
  process.exit(1)
}

// ─── Model (inline, no imports from src/) ────────────────────────────────────

const ExpenseSchema = new mongoose.Schema(
  {
    userId:   { type: String, required: true },
    amount:   { type: Number, required: true },
    category: { type: String, required: true },
    date:     { type: Date,   required: true },
    note:     { type: String, required: true },
    type:     { type: String, enum: ['income', 'expense'], default: 'expense' },
  },
  { timestamps: true }
)

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)

// ─── Data tables ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'food',          name: 'Food & Dining' },
  { id: 'travel',        name: 'Travel' },
  { id: 'bills',         name: 'Bills & Utilities' },
  { id: 'shopping',      name: 'Shopping' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'health',        name: 'Health & Fitness' },
  { id: 'education',     name: 'Education' },
  { id: 'others',        name: 'Others' },
]

const EXPENSE_NOTES: Record<string, string[]> = {
  food:          ['Lunch at office canteen', 'Dinner with family', 'Grocery shopping', 'Zomato order', 'Swiggy breakfast', 'Coffee at Starbucks', 'Street food', 'Fruit & vegetables', 'Bakery items', 'Restaurant dinner'],
  travel:        ['Ola cab to airport', 'Metro card recharge', 'Auto rickshaw', 'Uber ride', 'Petrol refill', 'Train ticket', 'Flight booking', 'Bus pass', 'Parking fee', 'Toll charges'],
  bills:         ['Electricity bill', 'WiFi bill', 'Water bill', 'Mobile recharge', 'DTH recharge', 'Gas cylinder', 'House rent', 'Society maintenance', 'Newspaper subscription', 'OTT subscription'],
  shopping:      ['Amazon purchase', 'Flipkart order', 'Clothes shopping', 'Shoes', 'Accessories', 'Home decor', 'Electronics', 'Books', 'Stationery', 'Gifts'],
  entertainment: ['Movie tickets', 'Netflix subscription', 'Spotify premium', 'Gaming purchase', 'Concert tickets', 'Amusement park', 'OTT subscription', 'Game top-up', 'Cricket match', 'Comedy show'],
  health:        ['Doctor consultation', 'Medicine purchase', 'Gym membership', 'Health checkup', 'Dental visit', 'Eye checkup', 'Vitamins & supplements', 'Yoga class', 'Physiotherapy', 'Lab tests'],
  education:     ['Online course', 'Books & materials', 'Coaching fees', 'Certification exam', 'Workshop registration', 'Udemy course', 'Library membership', 'Skill training', 'Internship fee', 'Study material'],
  others:        ['Birthday gift', 'Charity donation', 'Miscellaneous', 'Home repair', 'Laundry', 'Salon & grooming', 'Pet food', 'Plant purchase', 'Donations', 'Festival expenses'],
}

const INCOME_NOTES = [
  'Monthly salary credit',
  'Freelance project payment',
  'Consulting fees',
  'Bonus credited',
  'Side project income',
  'Investment returns',
  'Rent income',
  'Referral bonus',
  'Performance incentive',
  'Part-time work payment',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Random date within a calendar month */
function randomDateInMonth(year: number, month: number): Date {
  const daysInMonth = new Date(year, month, 0).getDate() // month is 1-indexed here
  const day = randomInt(1, daysInMonth)
  const hour = randomInt(7, 22)
  const minute = randomInt(0, 59)
  return new Date(year, month - 1, day, hour, minute)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const args = process.argv.slice(2)
  const userIdIdx = args.indexOf('--userId')
  const shouldClear = args.includes('--clear')

  if (userIdIdx === -1 || !args[userIdIdx + 1]) {
    console.error('❌  Usage: npx tsx scripts/seed.ts --userId <supabase-user-id> [--clear]')
    process.exit(1)
  }

  const userId = args[userIdIdx + 1]
  console.log(`\n🌱  Seeding for userId: ${userId}`)

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB })
  console.log('✅  Connected to MongoDB')

  if (shouldClear) {
    const deleted = await Expense.deleteMany({ userId })
    console.log(`🗑️   Cleared ${deleted.deletedCount} existing records`)
  }

  // Target: 1000 records spread across 3 months
  // Distribution (approximate):
  //   current month  : 300 records  (~270 expenses, ~30 income)
  //   previous month : 400 records  (~360 expenses, ~40 income)
  //   prev-prev month: 300 records  (~270 expenses, ~30 income)

  const now = new Date()
  const months = [
    { year: now.getFullYear(), month: now.getMonth() + 1,     expenseCount: 270, incomeCount: 30  },
    { year: now.getFullYear(), month: now.getMonth(),         expenseCount: 360, incomeCount: 40  },
    { year: now.getFullYear(), month: now.getMonth() - 1,     expenseCount: 270, incomeCount: 30  },
  ].map(m => {
    // Handle year rollover
    let { year, month } = m
    while (month <= 0) { month += 12; year -= 1 }
    return { ...m, year, month }
  })

  const docs: object[] = []

  for (const { year, month, expenseCount, incomeCount } of months) {
    const label = `${year}-${String(month).padStart(2, '0')}`
    console.log(`  📅  ${label} — ${expenseCount} expenses + ${incomeCount} income`)

    // ── Expenses ──
    for (let i = 0; i < expenseCount; i++) {
      const cat = randomFrom(CATEGORIES)
      const notes = EXPENSE_NOTES[cat.id]

      // Realistic amount ranges per category
      const amountRanges: Record<string, [number, number]> = {
        food:          [50,  800],
        travel:        [30,  2500],
        bills:         [200, 5000],
        shopping:      [100, 8000],
        entertainment: [50,  1500],
        health:        [100, 3000],
        education:     [200, 10000],
        others:        [50,  2000],
      }
      const [min, max] = amountRanges[cat.id] || [100, 1000]

      docs.push({
        userId,
        type: 'expense',
        category: cat.id,
        amount: randomFloat(min, max),
        note: randomFrom(notes),
        date: randomDateInMonth(year, month),
      })
    }

    // ── Income ──
    // Salaries cluster around 1st-5th, freelance is random
    for (let i = 0; i < incomeCount; i++) {
      const isSalary = i < Math.floor(incomeCount * 0.4)
      const note = isSalary ? 'Monthly salary credit' : randomFrom(INCOME_NOTES.slice(1))
      const amount = isSalary
        ? randomFloat(40000, 120000)
        : randomFloat(2000, 30000)

      const day = isSalary ? randomInt(1, 5) : randomInt(1, 28)
      const date = new Date(year, month - 1, day, randomInt(9, 18), randomInt(0, 59))

      docs.push({ userId, type: 'income', category: 'others', amount, note, date })
    }
  }

  // Bulk insert in batches of 200 for efficiency
  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH)
    await Expense.insertMany(batch, { ordered: false })
    inserted += batch.length
    process.stdout.write(`\r  ⏳  Inserted ${inserted} / ${docs.length}`)
  }

  console.log(`\n\n✅  Done! Inserted ${inserted} records across 3 months.`)
  console.log(`    Run the app and check the dashboard — data should appear immediately.\n`)

  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err)
  process.exit(1)
})
