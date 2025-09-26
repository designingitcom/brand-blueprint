'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, ArrowLeft, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Module9Page() {
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
              <span>Module 9</span>
              <span>•</span>
              <span>Research</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Competitive Research
            </h1>
            <p className="text-xl text-muted-foreground">
              Understand your market landscape before building your strategy
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-primary" />
                <CardTitle>Market Research & Analysis</CardTitle>
              </div>
              <CardDescription>
                Comprehensive analysis of your competitive landscape, market
                gaps, and positioning opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>What you'll discover:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                    <li>Direct and indirect competitors</li>
                    <li>Market positioning gaps</li>
                    <li>Industry messaging patterns</li>
                    <li>Opportunity areas</li>
                    <li>Differentiation strategies</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Estimated time:</strong> 20-30 minutes
                </div>
                <Button className="w-full mt-4">
                  <Play className="w-4 h-4 mr-2" />
                  Start Research Module
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfect for when you need to:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Understand your competitive landscape</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Find differentiation opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Validate market positioning ideas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Identify messaging gaps</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>What happens after research?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                After completing your competitive research, you'll have clear
                insights about market opportunities and can move confidently
                into strategy development.
              </p>
              <div className="flex gap-3">
                <Button variant="outline">
                  Continue to Module 1 (Foundation)
                </Button>
                <Button variant="outline">Jump to Quick Start (8 min)</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
