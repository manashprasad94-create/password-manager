import { supabase } from './supabase'

/**
 * Send a password reset email to the user
 * Supabase will send an email with a link containing a token
 * The user clicks the link which should redirect to /reset-password?token=...
 * 
 * @param {string} email - The user's email address
 * @param {string} redirectUrl - The URL to redirect to after reset (e.g., http://localhost:5173/reset-password)
 * @returns {Promise<{error: null | Error}>}
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
 * The user must have a valid session or token from the reset email
 * 
 * @param {string} newPassword - The new password to set
 * @returns {Promise<{user: null | Object, error: null | Error}>}
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
 * This is called when the user clicks the reset email link
 * The token comes from the URL query params
 * 
 * @param {string} token - The reset token from the URL
 * @returns {Promise<{session: null | Object, error: null | Error}>}
 */
export async function verifyResetToken(token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery', // recovery emails use the 'recovery' type
    })
    return { session: data?.session || null, error }
  } catch (error) {
    return { session: null, error }
  }
}
