'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Zap, ArrowLeft, Play, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickStartPage() {
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
              <span>Quick Start</span>
              <span>•</span>
              <span>8 Minute Setup</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quick Start Strategy
            </h1>
            <p className="text-xl text-muted-foreground">
              Get your essential strategy framework in just 8 minutes
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle>Rapid Strategy Setup</CardTitle>
              </div>
              <CardDescription>
                Essential strategy questions that unlock marketing activations
                quickly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>What you'll define:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                    <li>Target customer profile</li>
                    <li>Core value proposition</li>
                    <li>Primary messaging pillars</li>
                    <li>Key differentiators</li>
                    <li>Initial positioning</li>
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <strong>Estimated time:</strong>
                  <span>8 minutes</span>
                </div>
                <Button className="w-full mt-4">
                  <Play className="w-4 h-4 mr-2" />
                  Start Quick Start
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfect for:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Need to unlock activations quickly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Have limited time right now</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Want to start implementing immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Can refine strategy later</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                Quick Start vs. Module 1: What's the difference?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-primary">
                    Quick Start (8 min)
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Essential strategy basics</li>
                    <li>• Unlocks all activations</li>
                    <li>• Fast implementation</li>
                    <li>• Can upgrade later</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Module 1 (30-45 min)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Comprehensive foundation</li>
                    <li>• Deep strategic insights</li>
                    <li>• Detailed frameworks</li>
                    <li>• Complete positioning</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Recommendation:</strong> Start with Quick Start if you
                  need to begin implementing marketing activations today. You
                  can always come back and complete Module 1 for deeper
                  insights.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
