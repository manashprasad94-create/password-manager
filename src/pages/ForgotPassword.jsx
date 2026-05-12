import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Shield, ArrowLeft } from 'lucide-react'
import { sendPasswordResetEmail } from '../lib/auth'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)

    // Get the reset redirect URL - adjust this to match your deployed domain
    // For local development, use localhost:5173
    // For production on Vercel, use your actual domain
    const resetUrl = `${window.location.origin}/reset-password`

    const { error: resetError } = await sendPasswordResetEmail(email, resetUrl)

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email. Please try again.')
    } else {
      setSuccess(true)
      setEmail('')
      // Keep success message visible for 5 seconds, then redirect to login
      setTimeout(() => {
        navigate('/login')
      }, 5000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">KeyVault</h1>
          <p className="text-gray-400 mt-1">Your encrypted password manager</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-2">
            Reset your password
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your email and we'll send you a link to reset your password
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
              <p className="font-medium">Email sent successfully!</p>
              <p className="mt-1">Check your inbox for the reset link. Redirecting to login in 5 seconds...</p>
            </div>
          )}

          {/* Email field */}
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-1 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          {/* Back to login link */}
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          All passwords are encrypted locally before storage
        </p>
      </div>
    </div>
  )
}
