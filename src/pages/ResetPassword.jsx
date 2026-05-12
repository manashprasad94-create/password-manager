import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, Shield, Check } from 'lucide-react'
import { updatePassword, verifyResetToken } from '../lib/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenError, setTokenError] = useState(false)
  const [sessionReady, setSessionReady] = useState(false) // NEW

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setTokenError(true)
        setError('No reset token found. The link may have expired.')
        return
      }

      const { session, error: verifyError } = await verifyResetToken(token)

      if (verifyError || !session) {
        setTokenError(true)
        setError('Reset link is invalid or has expired. Please request a new one.')
        return
      }

      setSessionReady(true)
    }

    verifyToken()
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error: updateError } = await updatePassword(newPassword)

    if (updateError) {
      setError(updateError.message || 'Failed to update password. Please try again.')
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
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
          {tokenError ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">Invalid reset link</h2>
              <p className="text-gray-400 text-sm mb-6">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
              >
                Request new reset link
              </button>
            </>
          ) : success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full mb-4">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Password updated!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>
          ) : !sessionReady ? (
            // ✅ Show loading while exchanging the code
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">Verifying reset link...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">
                Create a new password
              </h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-1 block">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-1 block">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          All passwords are encrypted locally before storage
        </p>
      </div>
    </div>
  )
}