import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, LogOut, Shield, KeyRound } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import PasswordCard from '../components/PasswordCard'

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const pin = location.state?.pin

  const [entries, setEntries] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  // Redirect if no PIN in state
  useEffect(() => {
    if (!pin) navigate('/pin')
  }, [pin])

  // Fetch entries from Supabase
  useEffect(() => {
    if (pin) fetchEntries()
  }, [pin])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setEntries(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('vault_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const handleEdit = (entry) => {
    navigate('/add', { state: { pin, entry } })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('vault_pin')
    navigate('/login')
  }

  // Filter entries by search + category
  const filtered = entries.filter(e => {
    const matchSearch =
      e.site_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.username?.toLowerCase().includes(search.toLowerCase()) ||
      e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))

    const matchCategory =
      category === 'all' || e.category === category

    return matchSearch && matchCategory
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Top navbar */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">KeyVault</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs">{entries.length} entries</span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Search */}
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Category filter */}
        <div className="mb-6">
          <CategoryFilter active={category} onChange={setCategory} />
        </div>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <Shield className="w-8 h-8 mx-auto mb-3 animate-pulse text-indigo-500" />
            Loading your vault...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <KeyRound className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-500 text-sm">
              {search || category !== 'all'
                ? 'No entries match your search'
                : 'Your vault is empty — add your first password!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(entry => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                pin={pin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add button */}
      <button
        onClick={() => navigate('/add', { state: { pin } })}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}