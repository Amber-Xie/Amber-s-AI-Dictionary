import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { IconSearch, IconBook, IconStudy, IconSettings } from './Icons'

const tabs = [
  { to: '/find', label: '查找', Icon: IconSearch },
  { to: '/books', label: '单词本', Icon: IconBook },
  { to: '/study', label: '学习', Icon: IconStudy },
  { to: '/settings', label: '设置', Icon: IconSettings },
]

export default function Layout() {
  const location = useLocation()
  const hideTabBar =
    location.pathname.startsWith('/book/') ||
    location.pathname.startsWith('/word/')

  return (
    <div className="flex h-full flex-col bg-[#FDFCF8]">
      <main className={`flex-1 overflow-y-auto ${hideTabBar ? '' : 'pb-[72px]'}`}>
        <Outlet />
      </main>

      {!hideTabBar && (
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-[#f0ebe3] bg-[#FDFCF8]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[480px] justify-around px-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                    isActive ? 'text-[#7EB1B1] font-semibold' : 'text-[#9CA3AF]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <tab.Icon className="h-6 w-6" active={isActive} />
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
