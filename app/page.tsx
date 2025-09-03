import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Users, BarChart3, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">S1BMW</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Streamline Your Brand Management
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              S1BMW helps you maintain brand consistency, manage assets, and collaborate with your team - all in one powerful platform.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need for brand management
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to keep your brand consistent and your team aligned.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Brand Guidelines</CardTitle>
                <CardDescription>
                  Create and maintain comprehensive brand guidelines that keep your team aligned.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Work together seamlessly with real-time collaboration and approval workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track brand performance and get insights to make data-driven decisions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Why choose S1BMW?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built by brand managers, for brand managers. We understand the challenges you face and have created the perfect solution.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Centralized brand asset management",
                  "Real-time team collaboration",
                  "Automated brand compliance checks",
                  "Comprehensive analytics and reporting",
                  "Enterprise-grade security",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pl-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ready to get started?</CardTitle>
                  <CardDescription>
                    Join thousands of brands already using S1BMW to streamline their brand management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/signup">
                        Create Free Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      No credit card required. Start your free trial today.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 S1BMW. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
