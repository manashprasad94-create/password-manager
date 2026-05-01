import { CATEGORIES } from '../lib/passwordUtils'

export default function CategoryFilter({ active, onChange }) {
  const all = [{ id: 'all', label: 'All', emoji: '🔐' }, ...CATEGORIES]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {all.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition
            ${active === cat.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}