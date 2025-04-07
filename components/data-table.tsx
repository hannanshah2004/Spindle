"use client"

import { useState } from "react"
import { ArrowUpDown, MoreHorizontal, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Status = "completed" | "pending" | "failed"

interface Project {
  id: string
  name: string
  description: string
  status: Status
  lastRun: string
}

const statusConfig = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-600",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-600",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    className: "bg-red-100 text-red-600",
  },
}

interface StatusBadgeProps {
  status: Status
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </div>
  )
}

export function DataTable() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Website Scraper",
      description: "Automated data extraction from e-commerce sites",
      status: "completed",
      lastRun: "2 hours ago",
    },
    {
      id: "2",
      name: "Email Automation",
      description: "Scheduled email campaign delivery",
      status: "pending",
      lastRun: "Pending",
    },
    {
      id: "3",
      name: "Data Sync",
      description: "Synchronize data between CRM and database",
      status: "failed",
      lastRun: "1 day ago",
    },
    {
      id: "4",
      name: "Report Generator",
      description: "Weekly analytics report creation",
      status: "completed",
      lastRun: "5 hours ago",
    },
  ])

  return (
    <Card>
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Projects</h3>
        <Button variant="primary" size="sm">
          New Project
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left p-4 font-medium text-slate-500 text-sm">
                <div className="flex items-center gap-1">
                  Name
                  <Button variant="ghost" size="icon-sm" className="ml-1 h-6 w-6">
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </div>
              </th>
              <th className="text-left p-4 font-medium text-slate-500 text-sm">Description</th>
              <th className="text-left p-4 font-medium text-slate-500 text-sm">Status</th>
              <th className="text-left p-4 font-medium text-slate-500 text-sm">Last Run</th>
              <th className="text-right p-4 font-medium text-slate-500 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm font-medium text-slate-800">{project.name}</td>
                <td className="p-4 text-sm text-slate-600">{project.description}</td>
                <td className="p-4">
                  <StatusBadge status={project.status} />
                </td>
                <td className="p-4 text-sm text-slate-600">{project.lastRun}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

