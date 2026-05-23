export function IconSearch({ className = 'w-6 h-6', active }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
      {active && <circle cx="11" cy="11" r="3" fill="currentColor" opacity="0.2" />}
    </svg>
  )
}

export function IconBook({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14" />
      <path d="M4 19h16M8 7h8M8 11h6" strokeLinecap="round" />
    </svg>
  )
}

export function IconStudy({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M6 11v5c0 2 2.5 4 6 4s6-2 6-4v-5" strokeLinecap="round" />
    </svg>
  )
}

export function IconSettings({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  )
}

export function IconMail({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" strokeLinecap="round" />
    </svg>
  )
}

export function IconUser({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  )
}

export function IconLock({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
    </svg>
  )
}

export function IconVolume({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 5L6 9H3v6h3l5 4V5zm6.5 2.5a7 7 0 010 9M14 8.5a4 4 0 010 7" />
    </svg>
  )
}

export function IconFolder({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#F5D76E" stroke="#E8C04A" strokeWidth="1">
      <path d="M3 7a2 2 0 012-2h5l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}

export function IconMore({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  )
}

export function IconChevronLeft({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconEnvelopeLarge({ className = 'w-20 h-20' }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none">
      <rect x="8" y="20" width="64" height="44" rx="6" fill="#7EB1B1" opacity="0.15" />
      <rect x="8" y="20" width="64" height="44" rx="6" stroke="#7EB1B1" strokeWidth="2.5" />
      <path d="M8 26l32 24 32-24" stroke="#7EB1B1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconLockLarge({ className = 'w-20 h-20' }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none">
      <rect x="22" y="36" width="36" height="28" rx="5" fill="#7EB1B1" opacity="0.15" />
      <rect x="22" y="36" width="36" height="28" rx="5" stroke="#7EB1B1" strokeWidth="2.5" />
      <path d="M30 36V28a10 10 0 0120 0v8" stroke="#7EB1B1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function AuthIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="mx-auto h-24 w-28" fill="none">
      <rect x="20" y="55" width="80" height="12" rx="2" fill="#E8E4DC" />
      <rect x="25" y="45" width="70" height="12" rx="2" fill="#D4CFC4" />
      <rect x="30" y="35" width="60" height="12" rx="2" fill="#C4BFB4" />
      <path d="M55 20 Q60 8 68 18 Q72 28 60 32 Q48 28 55 20" fill="#7EB1B1" opacity="0.7" />
      <path d="M58 18 L58 35" stroke="#6a9fa0" strokeWidth="1.5" />
      <ellipse cx="52" cy="22" rx="8" ry="5" fill="#7EB1B1" opacity="0.5" transform="rotate(-20 52 22)" />
      <ellipse cx="66" cy="24" rx="7" ry="4" fill="#7EB1B1" opacity="0.5" transform="rotate(15 66 24)" />
    </svg>
  )
}
