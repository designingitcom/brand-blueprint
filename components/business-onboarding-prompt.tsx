'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Users,
  Mail,
  Send,
  Copy,
  CheckCircle,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BusinessOnboardingPromptProps {
  business: {
    id: string;
    name: string;
    slug: string;
    onboarding_completed?: boolean;
  };
  isOwner?: boolean;
  showAsModal?: boolean;
  onClose?: () => void;
}

export function BusinessOnboardingPrompt({
  business,
  isOwner = false,
  showAsModal = false,
  onClose,
}: BusinessOnboardingPromptProps) {
  const router = useRouter();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState(
    `You've been invited to collaborate on ${business.name}'s brand strategy. Join us for a collaborative onboarding session to align our vision and methodology.`
  );
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/join/${business.slug}`;

  const handleInviteTeam = async () => {
    setSending(true);
    try {
      // Parse emails (comma or newline separated)
      const emails = inviteEmails
        .split(/[,\n]/)
        .map(e => e.trim())
        .filter(e => e);

      if (emails.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      // TODO: Implement actual invite sending via email
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Invitations sent to ${emails.length} team member(s)`);
      setShowInviteDialog(false);
      setInviteEmails('');
    } catch (error) {
      toast.error('Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">
          {business.onboarding_completed 
            ? 'Onboarding Complete!' 
            : 'Complete Your Onboarding'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {business.onboarding_completed
            ? `${business.name} has completed the foundational brand strategy onboarding.`
            : `Before creating projects, complete the onboarding process to understand our brand methodology and set up ${business.name} for success.`}
        </p>
      </div>

      {!business.onboarding_completed && (
        <div className="space-y-4">
          <div className="grid gap-3">
            <Button 
              onClick={() => router.push(`/onboarding?business=${business.id}`)}
              className="w-full gap-2"
              size="lg"
            >
              <BookOpen className="h-4 w-4" />
              Start Onboarding Process
            </Button>
            
            {isOwner && (
              <Button 
                onClick={() => setShowInviteDialog(true)}
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <UserPlus className="h-4 w-4" />
                Invite Team Members First
              </Button>
            )}
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Why onboarding?</strong> Our guided onboarding ensures your team 
              understands the S1 • BMW methodology, aligns on brand vision, and sets up 
              essential strategy foundations. It takes about 30-45 minutes and can be 
              completed collaboratively with your team.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {business.onboarding_completed && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Ready to create projects!</span>
          </div>
          <Button 
            onClick={() => router.push('/projects/new')}
            className="w-full gap-2"
            size="lg"
          >
            Create First Project
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <>
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Next Steps for {business.name}</DialogTitle>
              <DialogDescription>
                Set up your business for success
              </DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>

        {/* Team Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite Team Members</DialogTitle>
              <DialogDescription>
                Invite your team to collaborate on the onboarding process
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Textarea
                  id="emails"
                  placeholder="Enter email addresses separated by commas or new lines"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Invitation Message</Label>
                <Textarea
                  id="message"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Or share this link</Label>
                <div className="flex gap-2">
                  <Input 
                    value={inviteLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteTeam}
                disabled={sending || !inviteEmails.trim()}
                className="gap-2"
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Invitations
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Card version for embedding in pages
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Steps for {business.name}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}