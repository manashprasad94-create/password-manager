import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { encryptPassword } from '../lib/crypto'
import { CATEGORIES, checkStrength } from '../lib/passwordUtils'
import StrengthMeter from './StrengthMeter'
import PasswordGenerator from './PasswordGenerator'
import { Eye, EyeOff, ChevronLeft, Sparkles } from 'lucide-react'

export default function AddPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const pin = location.state?.pin
  const existing = location.state?.entry // if editing

  const isEditing = !!existing

  // Form state
  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState('other')
  const [tags, setTags] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if no PIN
  useEffect(() => {
    if (!pin) navigate('/pin')
  }, [pin])

  // Pre-fill form if editing
  useEffect(() => {
    if (existing) {
      setSiteName(existing.site_name || '')
      setSiteUrl(existing.site_url || '')
      setUsername(existing.username || '')
      setCategory(existing.category || 'other')
      setTags(existing.tags?.join(', ') || '')
      // Don't pre-fill password — user must re-enter if changing
    }
  }, [existing])

  const handleSubmit = async () => {
    setError('')

    // Validation
    if (!siteName.trim()) { setError('Site name is required'); return }
    if (!username.trim()) { setError('Username is required'); return }
    if (!password.trim() && !isEditing) { setError('Password is required'); return }

    setLoading(true)

    // Parse tags
    const parsedTags = tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    let payload = {
      site_name: siteName.trim(),
      site_url: siteUrl.trim(),
      username: username.trim(),
      category,
      tags: parsedTags,
      strength_score: checkStrength(password).score,
      user_id: user.id,
    }

    // Only encrypt + update password if user typed one
    if (password.trim()) {
      const { ciphertext, iv } = encryptPassword(password, pin)
      payload.encrypted_password = ciphertext
      payload.iv = iv
    }

    if (isEditing) {
      // Update existing entry
      const { error } = await supabase
        .from('vault_entries')
        .update(payload)
        .eq('id', existing.id)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      // Insert new entry
      const { error } = await supabase
        .from('vault_entries')
        .insert(payload)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    navigate('/dashboard', { state: { pin } })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard', { state: { pin } })}
            className="text-gray-400 hover:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-white">
            {isEditing ? 'Edit Entry' : 'Add New Entry'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Site Name */}
        <div>
          <label className="text-gray-400 text-sm mb-1 block">
            Site Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            placeholder="e.g. Gmail, Netflix, HDFC"
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Site URL */}
        <div>
          <label className="text-gray-400 text-sm mb-1 block">
            Site URL <span className="text-gray-600 text-xs">(optional)</span>
          </label>
          <input
            type="url"
            value={siteUrl}
            onChange={e => setSiteUrl(e.target.value)}
            placeholder="https://gmail.com"
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Username */}
        <div>
          <label className="text-gray-400 text-sm mb-1 block">
            Username / Email <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-gray-400 text-sm">
              Password {!isEditing && <span className="text-red-400">*</span>}
            </label>
            {isEditing && (
              <span className="text-gray-600 text-xs">Leave blank to keep current</span>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isEditing ? '(unchanged)' : 'Enter password'}
              className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength meter */}
          {password && <StrengthMeter password={password} />}
        </div>

        {/* Password Generator toggle */}
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
        >
          <Sparkles className="w-4 h-4" />
          {showGenerator ? 'Hide generator' : 'Generate a strong password'}
        </button>

        {/* Password Generator */}
        {showGenerator && (
          <PasswordGenerator
            onUse={pwd => {
              setPassword(pwd)
              setShowPassword(true)
              setShowGenerator(false)
            }}
          />
        )}

        {/* Category */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition
                  ${category === cat.id
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-gray-400 text-sm mb-1 block">
            Tags <span className="text-gray-600 text-xs">(comma separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. personal, work, family"
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
          {/* Tag preview */}
          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition mt-2"
        >
          {loading
            ? 'Saving...'
            : isEditing ? '💾 Save Changes' : '🔐 Save Password'}
        </button>

        {/* Bottom spacing */}
        <div className="h-6" />
      </div>
    </div>
  )
}