import React from 'react'

/** Full logo, shown on the login screen (admin.components.graphics.Logo). */
export function Logo() {
  return (
    <div className="em-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo.png" alt="EnviroMET" width={300} height={97} />
    </div>
  )
}

/** Globe mark from the logo, shown top-left of every admin screen (admin.components.graphics.Icon). */
export function Icon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="em-icon" src="/admin/enviromet-mark.png" alt="EnviroMET" width={26} height={26} />
  )
}

/** One line of context above the login form (admin.components.beforeLogin). */
export function BeforeLogin() {
  return <p className="em-login-note">Sign in to edit the EnviroMET website in English and Arabic.</p>
}
