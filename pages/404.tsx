export default function Custom404() {
  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif flex items-center justify-center flex-col">
      <h1 className="text-2xl mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
      <div className="mt-4">
        <a href="/" className="text-blue-600 underline">
          Return Home
        </a>
      </div>
    </div>
  )
}
