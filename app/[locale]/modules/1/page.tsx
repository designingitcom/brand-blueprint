'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Target, ArrowLeft, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Module1Page() {
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
              <span>Module 1</span>
              <span>•</span>
              <span>Foundation</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Strategic Foundation
            </h1>
            <p className="text-xl text-muted-foreground">
              Build your core business strategy and positioning framework
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle>Comprehensive Foundation</CardTitle>
              </div>
              <CardDescription>
                Deep dive into your business strategy, market positioning, and
                core messaging framework.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>What you'll complete:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                    <li>Business model analysis</li>
                    <li>Target market definition</li>
                    <li>Value proposition development</li>
                    <li>Competitive positioning</li>
                    <li>Core messaging framework</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Estimated time:</strong> 30-45 minutes
                </div>
                <Button className="w-full mt-4">
                  <Play className="w-4 h-4 mr-2" />
                  Start Module 1
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What happens after?</CardTitle>
              <CardDescription>
                Once you complete Module 1, you'll unlock:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>All marketing activation modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Advanced strategy tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Personalized recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Export and implementation guides</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Why start with foundation?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Without clear strategic foundation, marketing activations often
                fail or produce inconsistent results. Module 1 ensures every
                subsequent action is aligned with your core business strategy
                and resonates with your target market.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
