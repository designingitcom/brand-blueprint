'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  Users,
  Building2,
  AlertCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingStatusCardProps {
  businesses: Array<{
    id: string;
    name: string;
    slug: string;
    onboarding_completed?: boolean;
    team_size?: number;
    organization_name?: string;
  }>;
  isAdminView?: boolean;
}

export function OnboardingStatusCard({ 
  businesses, 
  isAdminView = false 
}: OnboardingStatusCardProps) {
  const completedCount = businesses.filter(b => b.onboarding_completed).length;
  const pendingCount = businesses.length - completedCount;
  const completionRate = businesses.length > 0 ? (completedCount / businesses.length) * 100 : 0;

  const pendingBusinesses = businesses.filter(b => !b.onboarding_completed);

  if (isAdminView) {
    // Compact admin view
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Onboarding Status</CardTitle>
            <Badge variant={pendingCount > 0 ? "secondary" : "default"}>
              {completedCount}/{businesses.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {pendingCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Businesses Pending Onboarding:</span>
              </div>
              <div className="space-y-1">
                {pendingBusinesses.slice(0, 3).map((business) => (
                  <div key={business.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{business.name}</span>
                      {business.organization_name && (
                        <span className="text-muted-foreground">
                          · {business.organization_name}
                        </span>
                      )}
                    </div>
                    <Link href={`/businesses/${business.slug}`}>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {pendingBusinesses.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{pendingBusinesses.length - 3} more businesses
                  </div>
                )}
              </div>
            </div>
          )}

          {pendingCount === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>All businesses have completed onboarding</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // End user view - more prominent
  const userBusiness = businesses[0]; // Assuming single business for end user
  
  if (!userBusiness) return null;

  if (userBusiness.onboarding_completed) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                Onboarding Complete!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {userBusiness.name} is ready to create projects and start 
                building powerful brand strategies.
              </p>
              <div className="mt-4">
                <Link href="/projects/new">
                  <Button className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prominent onboarding prompt
  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-orange-900">
                Complete Your Onboarding
              </h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                Required
              </Badge>
            </div>
            <p className="text-sm text-orange-700 mt-1 mb-4">
              Before creating projects, complete the onboarding process for{' '}
              <strong>{userBusiness.name}</strong>. This ensures you understand 
              our brand methodology and sets you up for success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/onboarding?business=${userBusiness.id}`}>
                <Button className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Start Onboarding
                </Button>
              </Link>
              <Link href={`/businesses/${userBusiness.slug}`}>
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Invite Team First
                </Button>
              </Link>
            </div>

            <div className="mt-4 p-3 bg-orange-100/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-xs text-orange-800">
                  <strong>Why onboarding?</strong> Our guided process ensures 
                  you understand the S1 • BMW methodology, align your team on 
                  brand vision, and establish strategic foundations. Takes 30-45 
                  minutes and can be completed with your team.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}