// ─── PASSWORD STRENGTH CHECKER ───────────────────────────────────────────────

export function checkStrength(password) {
  if (!password) return { score: 0, label: '', color: '', checks: [] }

  const checks = [
    {
      label: '8+ characters',
      passed: password.length >= 8,
    },
    {
      label: '12+ characters',
      passed: password.length >= 12,
    },
    {
      label: 'Uppercase letter (A-Z)',
      passed: /[A-Z]/.test(password),
    },
    {
      label: 'Lowercase letter (a-z)',
      passed: /[a-z]/.test(password),
    },
    {
      label: 'Number (0-9)',
      passed: /[0-9]/.test(password),
    },
    {
      label: 'Special character (!@#$...)',
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ]

  const passed = checks.filter(c => c.passed).length

  let score, label, color
  if (passed <= 2) {
    score = 1; label = 'Weak'; color = 'red'
  } else if (passed === 3) {
    score = 2; label = 'Fair'; color = 'orange'
  } else if (passed === 4 || passed === 5) {
    score = 3; label = 'Strong'; color = 'yellow'
  } else {
    score = 4; label = 'Very Strong'; color = 'green'
  }

  return { score, label, color, checks }
}

// Score to bar width
export function scoreToPercent(score) {
  return [0, 25, 50, 75, 100][score]
}

// Score to color classes
export const scoreColors = {
  red:    { bar: 'bg-red-500',    text: 'text-red-400'    },
  orange: { bar: 'bg-orange-500', text: 'text-orange-400' },
  yellow: { bar: 'bg-yellow-500', text: 'text-yellow-400' },
  green:  { bar: 'bg-green-500',  text: 'text-green-400'  },
}


// ─── PASSWORD GENERATOR ──────────────────────────────────────────────────────

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS   = '0123456789'
const SYMBOLS   = '!@#$%^&*()_+-=[]{}|;:,.<>?'

export function generatePassword({
  length = 16,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
} = {}) {
  let charset = ''
  let guaranteed = []

  if (uppercase) { charset += UPPERCASE; guaranteed.push(randomChar(UPPERCASE)) }
  if (lowercase) { charset += LOWERCASE; guaranteed.push(randomChar(LOWERCASE)) }
  if (numbers)   { charset += NUMBERS;   guaranteed.push(randomChar(NUMBERS))   }
  if (symbols)   { charset += SYMBOLS;   guaranteed.push(randomChar(SYMBOLS))   }

  if (!charset) return ''

  // Fill remaining length randomly
  const remaining = length - guaranteed.length
  const randomPart = Array.from(
    { length: remaining },
    () => randomChar(charset)
  )

  // Shuffle guaranteed + random together
  const all = [...guaranteed, ...randomPart]
  return shuffle(all).join('')
}

function randomChar(str) {
  return str[Math.floor(Math.random() * str.length)]
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}


// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'social',    label: 'Social',    emoji: '🌐' },
  { id: 'work',      label: 'Work',      emoji: '💼' },
  { id: 'banking',   label: 'Banking',   emoji: '🏦' },
  { id: 'shopping',  label: 'Shopping',  emoji: '🛒' },
  { id: 'gaming',    label: 'Gaming',    emoji: '🎮' },
  { id: 'streaming', label: 'Streaming', emoji: '🎬' },
  { id: 'other',     label: 'Other',     emoji: '📦' },
]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}


// ─── TIME HELPER ─────────────────────────────────────────────────────────────

export function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60)             return 'just now'
  if (seconds < 3600)           return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400)          return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 86400 * 30)     return `${Math.floor(seconds / 86400)} days ago`
  if (seconds < 86400 * 365)    return `${Math.floor(seconds / 2592000)} months ago`
  return `${Math.floor(seconds / 31536000)} years ago`
}