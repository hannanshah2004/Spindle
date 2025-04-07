import type React from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  iconColor?: string
}

export function StatsCard({ title, value, icon, change, iconColor = "bg-indigo-100 text-indigo-600" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>

            {change && (
              <div className="flex items-center mt-1">
                <span
                  className={cn(
                    "text-xs font-medium flex items-center",
                    change.trend === "up"
                      ? "text-emerald-600"
                      : change.trend === "down"
                        ? "text-red-600"
                        : "text-slate-600",
                  )}
                >
                  {change.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : change.trend === "down" ? (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  ) : null}
                  {change.value}
                </span>
                <span className="text-xs text-slate-500 ml-1">vs last period</span>
              </div>
            )}
          </div>

          <div className={cn("p-2 rounded-full", iconColor)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

