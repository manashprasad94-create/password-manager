import { supabase } from './supabase'

/**
 * Send a password reset email to the user
 */
export async function sendPasswordResetEmail(email, redirectUrl) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    return { error }
  } catch (error) {
    return { error }
  }
}

/**
 * Update the user's password (called after they submit the reset form)
 */
export async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { user: data?.user || null, error }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * Exchange a reset token for a session
 * Works with both ?token= and ?code= URL formats from Supabase
 */
export async function verifyResetToken(token) {
  try {
    // First try exchangeCodeForSession — works with both token flows
    const { data, error } = await supabase.auth.exchangeCodeForSession(token)

    if (!error && data?.session) {
      return { session: data.session, error: null }
    }

    // Fallback: try verifyOtp with token_hash
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })

    return { session: otpData?.session || null, error: otpError }
  } catch (error) {
    return { session: null, error }
  }
}