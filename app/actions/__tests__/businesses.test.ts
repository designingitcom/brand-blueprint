import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinesses,
  getBusiness,
} from '../businesses';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  revalidatePath: vi.fn(),
}));

describe('Businesses Server Actions', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      insert: vi.fn(() => mockSupabase),
      update: vi.fn(() => mockSupabase),
      delete: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      neq: vi.fn(() => mockSupabase),
      single: vi.fn(() => mockSupabase),
      order: vi.fn(() => mockSupabase),
      limit: vi.fn(() => mockSupabase),
    };

    (createClient as Mock).mockReturnValue(mockSupabase);
  });

  describe('createBusiness', () => {
    it('should create a business successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockBusiness = {
        id: 'biz-123',
        name: 'Test Business',
        slug: 'test-business',
        organization_id: 'org-123',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Check for existing slug
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Check organization exists
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'org-123' },
        error: null,
      });

      // Create business
      mockSupabase.single.mockResolvedValueOnce({
        data: mockBusiness,
        error: null,
      });

      const result = await createBusiness({
        name: 'Test Business',
        organization_id: 'org-123',
        type: 'Technology',
        description: 'A test business',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBusiness);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return error if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createBusiness({
        name: 'Test Business',
        organization_id: 'org-123',
      });

      expect(result.error).toBe('You must be logged in to create a business.');
      expect(result.success).toBeUndefined();
    });

    it('should return error if business slug already exists', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Existing business with same slug
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'existing-biz' },
        error: null,
      });

      const result = await createBusiness({
        name: 'Test Business',
        organization_id: 'org-123',
      });

      expect(result.error).toBe('A business with this name already exists.');
    });

    it('should return error if organization does not exist', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // No existing slug
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Organization not found
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await createBusiness({
        name: 'Test Business',
        organization_id: 'org-123',
      });

      expect(result.error).toBe('Organization not found or access denied.');
    });
  });

  describe('updateBusiness', () => {
    it('should update business successfully for owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockBusiness = {
        id: 'biz-123',
        user_id: 'user-123',
        organization_id: 'org-123',
      };
      const mockUpdatedBusiness = {
        ...mockBusiness,
        name: 'Updated Business',
        slug: 'updated-business',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Get existing business
      mockSupabase.single.mockResolvedValueOnce({
        data: mockBusiness,
        error: null,
      });

      // Check for slug conflict
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Update business
      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedBusiness,
        error: null,
      });

      const result = await updateBusiness('biz-123', {
        name: 'Updated Business',
        slug: 'updated-business',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedBusiness);
    });

    it('should deny update for non-owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockBusiness = {
        id: 'biz-123',
        user_id: 'other-user',
        organization_id: 'org-123',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockBusiness,
        error: null,
      });

      const result = await updateBusiness('biz-123', {
        name: 'Updated Business',
      });

      expect(result.error).toBe(
        'You do not have permission to update this business.'
      );
    });

    it('should return error if business not found', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await updateBusiness('biz-123', {
        name: 'Updated Business',
      });

      expect(result.error).toBe('Business not found.');
    });
  });

  describe('deleteBusiness', () => {
    it('should delete business successfully for owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockBusiness = {
        id: 'biz-123',
        user_id: 'user-123',
        organization_id: 'org-123',
        slug: 'test-business',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Get business
      mockSupabase.single.mockResolvedValue({
        data: mockBusiness,
        error: null,
      });

      // Check for projects
      mockSupabase.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      // Delete business
      mockSupabase.delete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteBusiness('biz-123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should prevent deletion if business has projects', async () => {
      const mockUser = { id: 'user-123' };
      const mockBusiness = {
        id: 'biz-123',
        user_id: 'user-123',
        organization_id: 'org-123',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockBusiness,
        error: null,
      });

      // Has projects
      mockSupabase.limit.mockResolvedValue({
        data: [{ id: 'project-1' }],
        error: null,
      });

      const result = await deleteBusiness('biz-123');

      expect(result.error).toBe(
        'Cannot delete business with existing projects. Please delete all projects first.'
      );
    });

    it('should deny deletion for non-owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockBusiness = {
        id: 'biz-123',
        user_id: 'other-user',
        organization_id: 'org-123',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockBusiness,
        error: null,
      });

      const result = await deleteBusiness('biz-123');

      expect(result.error).toBe(
        'You do not have permission to delete this business.'
      );
    });
  });

  describe('getBusinesses', () => {
    it('should fetch businesses successfully', async () => {
      const mockBusinesses = [
        { id: 'biz-1', name: 'Business 1' },
        { id: 'biz-2', name: 'Business 2' },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockBusinesses,
        error: null,
      });

      const result = await getBusinesses();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBusinesses);
    });

    it('should handle database errors', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getBusinesses();

      expect(result.error).toBe('Failed to fetch businesses.');
    });
  });

  describe('getBusiness', () => {
    it('should fetch a single business by slug', async () => {
      const mockBusiness = {
        id: 'biz-123',
        name: 'Test Business',
        slug: 'test-business',
        projects: [],
      };

      mockSupabase.single.mockResolvedValue({
        data: mockBusiness,
        error: null,
      });

      const result = await getBusiness('test-business');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBusiness);
    });

    it('should return error if business not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await getBusiness('non-existent');

      expect(result.error).toBe('Business not found.');
    });
  });
});
