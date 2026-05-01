import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, Pencil, Trash2 } from 'lucide-react'
import { decryptPassword } from '../lib/crypto'
import { getCategoryById, timeAgo, checkStrength, scoreColors } from '../lib/passwordUtils'

export default function PasswordCard({ entry, pin, onEdit, onDelete }) {
  const [revealed, setRevealed] = useState(false)
  const [decrypted, setDecrypted] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedUser, setCopiedUser] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const category = getCategoryById(entry.category)

  const toggleReveal = () => {
    if (!revealed) {
      const plain = decryptPassword(entry.encrypted_password, entry.iv, pin)
      setDecrypted(plain || '❌ Decryption failed')
      // Auto hide after 15 seconds
      setTimeout(() => setRevealed(false), 15000)
    }
    setRevealed(!revealed)
  }

  const copyPassword = () => {
    const plain = decryptPassword(entry.encrypted_password, entry.iv, pin)
    navigator.clipboard.writeText(plain)
    setCopied(true)
    // Auto clear clipboard after 30 seconds
    setTimeout(() => {
      navigator.clipboard.writeText('')
      setCopied(false)
    }, 30000)
  }

  const copyUsername = () => {
    navigator.clipboard.writeText(entry.username)
    setCopiedUser(true)
    setTimeout(() => setCopiedUser(false), 2000)
  }

  const strength = checkStrength(
    revealed ? decrypted : ''
  )

  const strengthColor = revealed && decrypted
    ? scoreColors[checkStrength(decrypted).color]?.bar || ''
    : ''

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition">

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Site initial avatar */}
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
            {entry.site_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{entry.site_name}</h3>
            {entry.site_url && (
              <a
                href={entry.site_url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-500 text-xs hover:text-indigo-400 transition"
              >
                {entry.site_url}
              </a>
            )}
          </div>
        </div>

        {/* Category badge */}
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
          {category.emoji} {category.label}
        </span>
      </div>

      {/* Username row */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 mb-2">
        <div>
          <p className="text-gray-500 text-xs mb-0.5">Username</p>
          <p className="text-gray-300 text-sm font-mono">{entry.username}</p>
        </div>
        <button
          onClick={copyUsername}
          className="text-gray-500 hover:text-white transition"
        >
          {copiedUser
            ? <Check className="w-4 h-4 text-green-400" />
            : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Password row */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs mb-0.5">Password</p>
          <p className="text-gray-300 text-sm font-mono truncate">
            {revealed ? decrypted : '••••••••••••'}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <button onClick={toggleReveal} className="text-gray-500 hover:text-white transition">
            {revealed
              ? <EyeOff className="w-4 h-4" />
              : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={copyPassword} className="text-gray-500 hover:text-white transition">
            {copied
              ? <Check className="w-4 h-4 text-green-400" />
              : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Strength bar — only shows when revealed */}
      {revealed && decrypted && !decrypted.startsWith('❌') && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Strength</span>
            <span className={`text-xs font-medium ${scoreColors[checkStrength(decrypted).color]?.text}`}>
              {checkStrength(decrypted).label}
            </span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${strengthColor}`}
              style={{ width: `${[0,25,50,75,100][checkStrength(decrypted).score]}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {entry.tags.map(tag => (
            <span key={tag} className="text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-xs">
          🕐 Changed {timeAgo(entry.last_changed)}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="text-gray-500 hover:text-indigo-400 transition"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(entry.id)}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-500 hover:text-red-400 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}