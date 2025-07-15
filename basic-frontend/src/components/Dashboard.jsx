import React from "react"
import { TrendingUp, Users, Mic, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"

const Dashboard = () => {
  
  const stats = [
    {
      title: "Total Voices",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: Mic,
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+5.2%",
      trend: "up",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "API Calls",
      value: "45.2K",
      change: "+18%",
      trend: "up",
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      title: "Success Rate",
      value: "98.5%",
      change: "-0.3%",
      trend: "down",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ]

  const recentActivity = [
    { id: 1, action: 'Voice "Sarah" created', time: "2 minutes ago", type: "create" },
    { id: 2, action: "TTS request processed", time: "5 minutes ago", type: "process" },
    { id: 3, action: 'User "john@example.com" registered', time: "10 minutes ago", type: "user" },
    { id: 4, action: 'Voice "Alex" updated', time: "15 minutes ago", type: "update" },
    { id: 5, action: "API key generated", time: "20 minutes ago", type: "api" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here's what's happening with your voice platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ml-1 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-slate-500 ml-1">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Usage Analytics</h2>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">Chart visualization would go here</p>
              <p className="text-sm text-slate-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <Mic className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-medium text-slate-300">Create New Voice</h3>
            <p className="text-sm text-slate-500">Add a new voice to your collection</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <Users className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-medium text-slate-300">Manage Users</h3>
            <p className="text-sm text-slate-500">View and manage user accounts</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <Activity className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-medium text-slate-300">View Analytics</h3>
            <p className="text-sm text-slate-500">Check detailed usage statistics</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
