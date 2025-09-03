"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/contexts/auth-context"
import { 
  Plus, 
  FolderOpen, 
  Users, 
  BarChart3, 
  Palette, 
  Target, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react"
import Link from "next/link"
import { AIAssistant } from "@/components/ai/ai-assistant"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  const { user } = useAuth()

  const firstName = user?.user_metadata?.first_name || "there"

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {firstName}!</h1>
          <p className="text-blue-100 text-lg mb-6">
            Ready to build something amazing? Let's streamline your brand management.
          </p>
          <div className="flex gap-3">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="mr-2 h-5 w-5" />
              Create Project
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Target className="mr-2 h-5 w-5" />
              Set Goals
            </Button>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
        <div className="absolute -right-8 top-8 h-16 w-16 rounded-full bg-white/5"></div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200">
          <Palette className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">Brand Kit</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200">
          <FolderOpen className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium">Projects</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-200">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium">Analytics</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200">
          <Users className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium">Team</span>
        </Button>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Projects</CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Ready to create your first
            </p>
            <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-blue-600">
              Start Now <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <div className="rounded-full bg-purple-100 p-2">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              You're the founder
            </p>
            <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-purple-600">
              Invite Team <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Consistency</CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <Target className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              Establish guidelines first
            </p>
            <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-green-600">
              Setup Guidelines <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Efficiency</CardTitle>
            <div className="rounded-full bg-orange-100 p-2">
              <Zap className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Sparkles className="w-3 h-3 mr-1" />
              AI assistant activated
            </p>
            <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-orange-600">
              Try AI Chat <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Assistant - Enhanced */}
        <div className="lg:col-span-2">
          <AIAssistant />
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Brand Management Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Brand Setup Journey
              </CardTitle>
              <CardDescription>
                Complete these steps to build a powerful brand presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-sm font-medium">Define Brand Identity</span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Next</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-muted-foreground">Create Brand Guidelines</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2/4</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-muted-foreground">Launch First Campaign</span>
                  </div>
                  <span className="text-xs text-muted-foreground">3/4</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-muted-foreground">Invite Team & Collaborate</span>
                  </div>
                  <span className="text-xs text-muted-foreground">4/4</span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>1/4 Complete</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Brand Identity Setup
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Track your brand management progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="rounded-full bg-green-500 p-1">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900">Account Created</p>
                    <p className="text-xs text-green-700">Welcome to S1BMW! Ready to build your brand.</p>
                    <p className="text-xs text-green-600 mt-1">Just now</p>
                  </div>
                </div>
                
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">More activities will appear here</p>
                  <p className="text-xs text-muted-foreground">as you start using S1BMW</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}