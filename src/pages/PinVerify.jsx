import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Delete } from 'lucide-react'

export default function PinVerify() {
  const navigate = useNavigate()
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isSettingPin, setIsSettingPin] = useState(false)
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState('enter') // 'enter' or 'confirm'
  const inputRefs = useRef([])

  useEffect(() => {
    // Check if PIN already exists
    const savedPin = localStorage.getItem('vault_pin')
    if (!savedPin) setIsSettingPin(true)
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigit = (index, value) => {
    if (!/^\d*$/.test(value)) return // only numbers
    const updated = [...pin]
    updated[index] = value
    setPin(updated)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    // Auto submit when all 6 digits filled
    if (index === 5 && value) {
      const fullPin = [...updated].join('')
      if (fullPin.length === 6) setTimeout(() => handleSubmit([...updated]), 100)
    }
  }

  const handleBackspace = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (currentPin = pin) => {
    const fullPin = currentPin.join('')
    if (fullPin.length < 6) {
      setError('Please enter all 6 digits')
      return
    }

    if (isSettingPin) {
      if (step === 'enter') {
        // First time entering PIN — ask to confirm
        setStep('confirm')
        setConfirmPin(currentPin)
        setPin(['', '', '', '', '', ''])
        setError('')
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      } else {
        // Confirming PIN
        if (fullPin === confirmPin.join('')) {
          localStorage.setItem('vault_pin', fullPin)
          navigate('/dashboard', { state: { pin: fullPin } })
        } else {
          setError('PINs do not match. Try again.')
          setPin(['', '', '', '', '', ''])
          setStep('enter')
          setTimeout(() => inputRefs.current[0]?.focus(), 100)
        }
      }
    } else {
      // Verify existing PIN
      const savedPin = localStorage.getItem('vault_pin')
      if (fullPin === savedPin) {
        navigate('/dashboard', { state: { pin: fullPin } })
      } else {
        setError('Incorrect PIN. Try again.')
        setPin(['', '', '', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    }
  }

  const clearPin = () => {
    setPin(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">KeyVault</h1>

        <p className="text-gray-400 mb-2">
          {isSettingPin
            ? step === 'enter' ? 'Set a 6-digit PIN for your vault' : 'Confirm your PIN'
            : 'Enter your PIN to unlock'}
        </p>

        <p className="text-gray-600 text-xs mb-8">
          {isSettingPin
            ? 'This PIN encrypts your passwords — never forget it'
            : 'Your PIN is never stored on any server'}
        </p>

        {/* PIN inputs */}
        <div className="flex gap-3 justify-center mb-6">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleBackspace(i, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-gray-800 text-white border-2 border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 transition"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={clearPin}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-sm transition"
          >
            <Delete className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={() => handleSubmit()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition"
          >
            {isSettingPin ? (step === 'enter' ? 'Next' : 'Confirm') : 'Unlock'}
          </button>
        </div>

        {/* Reset PIN option */}
        {!isSettingPin && (
          <button
            onClick={() => {
              localStorage.removeItem('vault_pin')
              setIsSettingPin(true)
              setStep('enter')
              setPin(['', '', '', '', '', ''])
              setError('')
            }}
            className="text-gray-600 hover:text-gray-400 text-xs mt-6 block mx-auto transition"
          >
            Forgot PIN? Reset it
          </button>
        )}
      </div>
    </div>
  )
}