/**
 * app.js — App initialization
 *
 * Runs on every /app/* page. Bootstraps auth state,
 * populates nav with user info, and sets up global UI helpers.
 *
 * Import at the bottom of every app page:
 *   <script src="/js/app.js" type="module"></script>
 */

import { getSession, getProfile, signOut } from '/js/auth.js'

// ─── Bootstrap ───────────────────────────────────────────────────
async function init() {
  const session = await getSession()
  if (!session) return  // auth.js's requireAuth() handles the redirect

  const profile = await getProfile()
  if (!profile) return

  renderNavUser(profile)
}

// ─── Render user info in nav ──────────────────────────────────────
function renderNavUser(profile) {
  const userEl = document.getElementById('nav-user')
  if (!userEl) return

  const name = profile.display_name || profile.email?.split('@')[0] || 'Account'
  const tier = profile.subscription_tier === 'pro'
    ? '<span class="badge badge-pro">Pro</span>'
    : ''

  userEl.innerHTML = `
    <span class="nav-user-name">${escapeHtml(name)}</span>${tier}
    <button class="btn btn-ghost btn-sm" id="sign-out-btn">Sign out</button>
  `

  document.getElementById('sign-out-btn')?.addEventListener('click', signOut)
}

// ─── Show inline alert ────────────────────────────────────────────
export function showAlert(container, message, type = 'error') {
  const div = document.createElement('div')
  div.className = `alert alert-${type}`
  div.textContent = message
  container.prepend(div)
  setTimeout(() => div.remove(), 5000)
}

// ─── Escape HTML to prevent XSS ──────────────────────────────────
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

init()
