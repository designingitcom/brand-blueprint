'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Building2,
  Briefcase,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { OrganizationForm } from '@/components/forms/organization-form';
import { OnboardingWizardV2 } from '@/components/forms/onboarding-wizard-v2';
import { ProjectWizard } from '@/components/forms/project-wizard';
import { getOrganizations } from '@/app/actions/organizations';

export function ActionDropdown() {
  const orgButtonRef = useRef<HTMLButtonElement>(null);
  const bizButtonRef = useRef<HTMLButtonElement>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load organizations
    async function loadData() {
      const orgsResult = await getOrganizations();

      if (orgsResult.success) {
        setOrganizations(orgsResult.data || []);
      }
    }

    loadData();
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button ref={buttonRef} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50"
            style={{ minWidth: buttonRef.current?.offsetWidth || 'auto' }}
          >
            <div className="py-1">
              <button
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => handleItemClick(() => orgButtonRef.current?.click())}
              >
                <Building2 className="h-4 w-4 mr-2" />
                New Organization
              </button>
              <button
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => handleItemClick(() => bizButtonRef.current?.click())}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                New Business
              </button>
              <button
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => handleItemClick(() => setShowProjectDialog(true))}
              >
                <FileText className="h-4 w-4 mr-2" />
                New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden trigger buttons for forms */}
      <div className="hidden">
        <OrganizationForm
          trigger={<button ref={orgButtonRef} />}
          onSuccess={() => {
            window.location.reload();
          }}
        />
        
        <OnboardingWizardV2
          triggerButton={<button ref={bizButtonRef} />}
          onComplete={() => {
            window.location.reload();
          }}
        />
        
        {showProjectDialog && (
          <ProjectWizard
            onSuccess={() => {
              setShowProjectDialog(false);
              window.location.reload();
            }}
            onCancel={() => setShowProjectDialog(false)}
          />
        )}
      </div>
    </>
  );
}