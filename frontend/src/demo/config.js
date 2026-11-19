/** True when the app was built with `--mode demo` (see .env.demo). */
export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const SIGNED_OUT_KEY = 'ecci-demo-signed-out'

/**
 * After an explicit sign-out the demo shows the login page instead of signing in again.
 * Kept in sessionStorage, so a new visit starts signed in.
 */
export const demoSession = {
  isSignedOut: () => {
    try {
      return sessionStorage.getItem(SIGNED_OUT_KEY) === '1'
    } catch {
      return false
    }
  },
  markSignedOut: () => {
    try {
      sessionStorage.setItem(SIGNED_OUT_KEY, '1')
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(SIGNED_OUT_KEY)
    } catch {
      /* ignore */
    }
  },
}
