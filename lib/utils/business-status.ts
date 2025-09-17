/**
 * Business Status Utilities
 * Manages business status based on onboarding progress and operational state
 */

// Align with database business_status_enum (from comprehensive schema)
export type BusinessStatus = 'pending' | 'onboarding' | 'active' | 'inactive' | 'suspended';

export interface BusinessStatusInfo {
  status: BusinessStatus;
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
  style: string;
}

/**
 * Determines the current business status based on various factors
 */
export function getBusinessStatus(business: {
  onboarding_completed?: boolean;
  onboarding_started_at?: string;
  onboarding_current_step?: number;
  status?: BusinessStatus | string;
  status_enum?: BusinessStatus; // New ENUM field after migration
  created_at?: string;
  last_activity_at?: string;
  description?: string;
  website?: string;
}): BusinessStatusInfo {
  
  // PRIORITY 1: Use ENUM field if available (after migration)
  if (business.status_enum) {
    return getStatusInfo(business.status_enum);
  }
  
  // PRIORITY 2: Use onboarding_completed field if available (current fallback)
  if (business.onboarding_completed !== undefined) {
    if (business.onboarding_completed === true) {
      return {
        status: 'active',
        label: 'Active',
        description: 'M0 onboarding complete and operational',
        color: 'green',
        style: 'bg-green-100 text-green-700 border-green-200'
      };
    }
    
    // Check if onboarding has actually started (saved progress on step 1+)
    const hasStartedOnboarding = business.onboarding_started_at || (business.onboarding_current_step && business.onboarding_current_step > 0);
    
    if (hasStartedOnboarding) {
      const currentStep = business.onboarding_current_step || 1;
      return {
        status: 'onboarding',
        label: 'Onboarding',
        description: `M0 onboarding in progress (step ${currentStep}/5)`,
        color: 'orange',
        style: 'bg-orange-100 text-orange-700 border-orange-200'
      };
    } else {
      // Business created but M0 onboarding not started yet
      const createdDate = business.created_at ? new Date(business.created_at) : null;
      const daysSinceCreation = createdDate 
        ? Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
        
      return {
        status: 'pending',
        label: 'Pending Setup',
        description: daysSinceCreation > 7 
          ? 'M0 onboarding overdue - needs attention'
          : 'Ready to start M0 onboarding',
        color: 'yellow',
        style: 'bg-yellow-100 text-yellow-700 border-yellow-200'
      };
    }
  }
  
  // FALLBACK: If no onboarding_completed field (shouldn't happen now)
  // Use business completeness as a proxy
  const hasDescription = business.description && business.description.trim().length > 10;
  const hasWebsite = business.website && business.website.trim().length > 0;
  const isBusinessComplete = hasDescription || hasWebsite;
  
  if (isBusinessComplete) {
    return {
      status: 'active',
      label: 'Active',
      description: 'Business appears complete',
      color: 'green',
      style: 'bg-green-100 text-green-700 border-green-200'
    };
  }
  
  // Default to onboarding if we can't determine status
  return {
    status: 'onboarding',
    label: 'Onboarding',
    description: 'Business setup needed',
    color: 'orange',
    style: 'bg-orange-100 text-orange-700 border-orange-200'
  };
}

/**
 * Get status info for a specific status
 */
export function getStatusInfo(status: BusinessStatus): BusinessStatusInfo {
  const statusMap: Record<BusinessStatus, BusinessStatusInfo> = {
    pending: {
      status: 'pending',
      label: 'Pending Setup',
      description: 'Ready to start M0 onboarding',
      color: 'yellow',
      style: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    onboarding: {
      status: 'onboarding',
      label: 'Onboarding',
      description: 'M0 onboarding in progress',
      color: 'orange',
      style: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    active: {
      status: 'active',
      label: 'Active',
      description: 'M0 onboarding complete and operational',
      color: 'green',
      style: 'bg-green-100 text-green-700 border-green-200'
    },
    inactive: {
      status: 'inactive',
      label: 'Inactive',
      description: 'Business is not currently active',
      color: 'gray',
      style: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    suspended: {
      status: 'suspended',
      label: 'Suspended',
      description: 'Business access is temporarily suspended',
      color: 'red',
      style: 'bg-red-100 text-red-700 border-red-200'
    }
  };

  return statusMap[status];
}