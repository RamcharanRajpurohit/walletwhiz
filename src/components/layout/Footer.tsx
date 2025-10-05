export default function Footer() {
  return (
    <footer className="bg-white/90 backdrop-blur-md border-t-2 border-yellow-200/50 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} Expense Tracker. Built with ❤️
        </p>
      </div>
    </footer>
  )
}