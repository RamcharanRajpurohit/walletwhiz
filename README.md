
---

```markdown
# Personal Expense Tracker

A modern, full-stack expense tracking application built with Next.js 14, TypeScript, MongoDB, Supabase Auth, and Tailwind CSS.

## Live Demo

You can access the live version of the application here:  
[https://walletwhiz-eight.vercel.app/dashboard]

**Demo Credentials:**  
- Email: test@gmail.com  
- Password: password

## Features

### Core Functionality
- **Add Expense** - Create expenses with amount, date, category, and notes
- **View Expenses** - Browse all expenses with filtering options
- **Update Expense** - Edit existing expense details
- **Delete Expense** - Remove expenses from the system
- **Data Persistence** - MongoDB database for reliable storage
- **Authentication** - Secure user authentication with Supabase
- **Validation** - Comprehensive input validation and error handling

### Advanced Features
- **Categories** - 8 pre-defined categories (Food, Travel, Bills, Shopping, Entertainment, Health, Education, Others)
- **Summary Reports** - Visual analytics including:
  - Total spending overview
  - Category-wise breakdown with pie charts
  - Monthly spending trends with line charts
  - Average expense calculations
- **Advanced Filters** - Filter by:
  - Date range (start and end date)
  - Category
  - Search by note text
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Modern UI** - Beautiful gradient themes with glassmorphism effects
- **Performance** - Fast loading with optimized queries
- **Security** - Protected routes with middleware authentication

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Custom gradients
- **Authentication**: Supabase Auth
- **Database**: MongoDB with Mongoose ODM
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast notifications


````

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB
- Supabase account

### Installation

1. **Clone and setup**
```bash
# Run the setup script
chmod +x setup.sh
./setup.sh

# Or manually create structure and install
npm install
````

2. **Configure Environment Variables**

Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=expense_tracker

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Setup Supabase**

* Create a new project at [supabase.com](https://supabase.com)
* Enable Email authentication
* Copy your project URL and keys to `.env.local`

4. **Setup MongoDB**

* Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* Create a database user
* Whitelist your IP address
* Copy connection string to `.env.local`

5. **Run Development Server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## API Routes

### Expenses

* `GET /api/expenses` - List expenses with filters
* `POST /api/expenses` - Create new expense
* `PUT /api/expenses/[id]` - Update expense
* `DELETE /api/expenses/[id]` - Delete expense

### Reports

* `GET /api/reports` - Get analytics data

### Auth

* `GET /api/auth/callback` - OAuth callback

## Database Schema

### Expense Model

```typescript
{
  userId: string          // Supabase user ID
  amount: number          // Expense amount
  category: string        // Category ID
  date: Date              // Expense date
  note: string            // Description
  createdAt: Date         // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## Key Features Implementation

### 1. Modular Architecture

* Separated concerns with clear folder structure
* Reusable components and utilities
* Type-safe with TypeScript throughout

### 2. SEO Optimized

* Server-side rendering with Next.js 14
* Metadata API for dynamic meta tags
* Semantic HTML structure
* Optimized images and assets

### 3. Responsive Design

* Mobile-first approach
* Breakpoints for tablet and desktop
* Touch-friendly UI elements
* Collapsible sidebar on mobile

### 4. Error Handling

* Client-side validation with Zod
* Server-side validation
* User-friendly error messages
* Toast notifications for feedback

### 5. Performance

* MongoDB indexing on userId and date
* Optimized queries with lean()
* React Server Components where possible
* Lazy loading for charts

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Future Enhancements

* [ ] Export reports to PDF/Excel
* [ ] Recurring expenses
* [ ] Budget goals and alerts
* [ ] Multi-currency support
* [ ] Receipt upload
* [ ] Dark mode
* [ ] Email notifications
* [ ] Expense sharing

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

```

---

```
