import { useState } from 'react'
import { generatePassword, checkStrength, scoreColors } from '../lib/passwordUtils'
import { RefreshCw, Copy, Check } from 'lucide-react'
import StrengthMeter from './StrengthMeter'

export default function PasswordGenerator({ onUse }) {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [generated, setGenerated] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    const pwd = generatePassword({ length, ...options })
    setGenerated(pwd)
    setCopied(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggle = key => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold mb-4 text-sm">⚙️ Password Generator</h3>

      {/* Length slider */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Length</span>
          <span className="text-indigo-400 font-bold">{length}</span>
        </div>
        <input
          type="range"
          min={8} max={32}
          value={length}
          onChange={e => setLength(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { key: 'uppercase', label: 'Uppercase (A-Z)' },
          { key: 'lowercase', label: 'Lowercase (a-z)' },
          { key: 'numbers',   label: 'Numbers (0-9)'   },
          { key: 'symbols',   label: 'Symbols (!@#$)'  },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggle(key)}
              className="accent-indigo-500"
            />
            <span className="text-gray-400 text-xs">{label}</span>
          </label>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 rounded-lg transition mb-3"
      >
        <RefreshCw className="w-4 h-4" /> Generate
      </button>

      {/* Result */}
      {generated && (
        <div>
          <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 mb-2">
            <span className="flex-1 text-white text-sm font-mono break-all">
              {generated}
            </span>
            <button onClick={copy} className="text-gray-400 hover:text-white transition shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <StrengthMeter password={generated} />

          {onUse && (
            <button
              onClick={() => onUse(generated)}
              className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              ✅ Use This Password
            </button>
          )}
        </div>
      )}
    </div>
  )
}