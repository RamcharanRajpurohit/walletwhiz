export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-col)] bg-[var(--surface-elevated)] py-6 backdrop-blur-md">
      <div className="container mx-auto px-4 text-center">
        <p className="text-[var(--text-soft)]">
          © {new Date().getFullYear()} Expense Tracker. Built with ❤️
        </p>
      </div>
    </footer>
  )
}