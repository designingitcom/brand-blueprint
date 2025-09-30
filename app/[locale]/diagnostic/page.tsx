'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HelpCircle, ArrowLeft, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DiagnosticPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Diagnostic Tool</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Find Your Starting Point
            </h1>
            <p className="text-xl text-muted-foreground">
              Answer a few questions to get personalized recommendations
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <CardTitle>Smart Diagnostic Assessment</CardTitle>
              </div>
              <CardDescription>
                Our AI-powered diagnostic tool analyzes your situation and
                recommends the optimal path forward.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>What we'll assess:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                    <li>Current business stage</li>
                    <li>Existing strategy maturity</li>
                    <li>Marketing experience level</li>
                    <li>Immediate priorities</li>
                    <li>Available resources</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Estimated time:</strong> 5 minutes
                </div>
                <Button className="w-full mt-4">
                  <Play className="w-4 h-4 mr-2" />
                  Start Diagnostic
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                You'll get personalized recommendations for:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Which modules to prioritize</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Optimal learning sequence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Time investment recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Quick wins you can implement</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Not sure if you need this?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you're uncertain about your business priorities, current
                strategy gaps, or simply want a tailored recommendation based on
                your specific situation, the diagnostic tool is perfect.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/modules/1')}
                >
                  Skip to Module 1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/en/onboarding-v3-simple')}
                >
                  Try Quick Start Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
