import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name, username or tag..."
        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}