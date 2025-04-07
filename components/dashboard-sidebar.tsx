"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Settings, Users, Folder, Zap, HelpCircle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive?: boolean
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={href}>
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/projects", icon: Folder, label: "Projects" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/dashboard/users", icon: Users, label: "Team" },
    { href: "/dashboard/tutorials", icon: Zap, label: "Tutorials" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-slate-800 flex items-center justify-center">
            <span className="text-white font-semibold">S</span>
          </div>
          <span className="font-semibold text-slate-800">Spindle</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <NavItem
            href="/dashboard/help"
            icon={HelpCircle}
            label="Help & Support"
            isActive={pathname === "/dashboard/help"}
          />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="flex items-center h-16 px-4 border-b border-slate-200 bg-white">
            <SidebarTrigger className="mr-4" />
            <div className="ml-auto flex items-center space-x-4">
              {/* User button or other header elements can go here */}
            </div>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

