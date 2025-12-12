'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  name: string
  role: string
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userStr = sessionStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userStr))
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) return null

  const navItems = [
    { href: '/dashboard', label: '仪表盘', roles: ['ADMIN', 'INPUT', 'AUDIT', 'QUERY'] },
    { href: '/samples', label: '样本管理', roles: ['ADMIN', 'INPUT', 'AUDIT', 'QUERY'] },
    { href: '/locations', label: '位置管理', roles: ['ADMIN', 'INPUT'] },
    { href: '/documents', label: '单据管理', roles: ['ADMIN', 'INPUT', 'AUDIT', 'QUERY'] },
    { href: '/ledger', label: '流水查询', roles: ['ADMIN', 'INPUT', 'AUDIT', 'QUERY'] },
    { href: '/trace', label: '溯源查询', roles: ['ADMIN', 'INPUT', 'AUDIT', 'QUERY'] },
    { href: '/reports', label: '报表', roles: ['ADMIN', 'AUDIT', 'QUERY'] },
    { href: '/audit-logs', label: '操作日志', roles: ['ADMIN', 'AUDIT'] },
  ]

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  微生物溯源管理器
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

