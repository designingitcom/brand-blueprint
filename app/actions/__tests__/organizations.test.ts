import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizations,
  getOrganization,
  inviteUserToOrganization,
} from '../organizations';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

describe('Organizations Server Actions', () => {
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
      upsert: vi.fn(() => mockSupabase),
    };

    (createClient as Mock).mockResolvedValue(mockSupabase);
  });

  describe('createOrganization', () => {
    it('should create an organization successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockOrganization = {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No existing slug
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockOrganization,
        error: null,
      });

      mockSupabase.insert.mockReturnValue(mockSupabase);

      const result = await createOrganization({
        name: 'Test Org',
        website: 'https://test.com',
        industry: 'Technology',
        company_size: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganization);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return error if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createOrganization({
        name: 'Test Org',
      });

      expect(result.error).toBe('User not authenticated');
      expect(result.success).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await createOrganization({
        name: 'Test Org',
      });

      expect(result.error).toBe('Database error');
    });
  });

  describe('updateOrganization', () => {
    it('should update organization successfully for admin/owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockMembership = { role: 'owner' };
      const mockUpdatedOrg = {
        id: 'org-123',
        name: 'Updated Org',
        slug: 'updated-org',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockMembership,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No existing slug conflict
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedOrg,
        error: null,
      });

      const result = await updateOrganization('org-123', {
        name: 'Updated Org',
        slug: 'updated-org',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedOrg);
    });

    it('should deny update for non-admin/owner users', async () => {
      const mockUser = { id: 'user-123' };
      const mockMembership = { role: 'viewer' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockMembership,
        error: null,
      });

      const result = await updateOrganization('org-123', {
        name: 'Updated Org',
      });

      expect(result.error).toBe('Insufficient permissions');
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization successfully for owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockMembership = { role: 'owner' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockMembership,
        error: null,
      });

      mockSupabase.delete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteOrganization('org-123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should deny deletion for non-owner users', async () => {
      const mockUser = { id: 'user-123' };
      const mockMembership = { role: 'admin' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockMembership,
        error: null,
      });

      const result = await deleteOrganization('org-123');

      expect(result.error).toBe(
        'Only organization owners can delete organizations'
      );
    });
  });

  describe('inviteUserToOrganization', () => {
    it('should create invite successfully for admin/owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockMembership = { role: 'admin' };
      const mockInvite = {
        id: 'invite-123',
        email: 'newuser@example.com',
        token: 'abc-123',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockMembership,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockInvite,
        error: null,
      });

      const result = await inviteUserToOrganization('org-123', {
        email: 'newuser@example.com',
        role: 'viewer',
      });

      expect(result.success).toBe(true);
      expect(result.data?.invite).toEqual(mockInvite);
      expect(result.data?.inviteUrl).toContain('abc-123');
    });

    it('should deny invite creation for non-admin/owner', async () => {
      const mockUser = { id: 'user-123' };
      const mockMembership = { role: 'viewer' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockMembership,
        error: null,
      });

      const result = await inviteUserToOrganization('org-123', {
        email: 'newuser@example.com',
        role: 'viewer',
      });

      expect(result.error).toBe('Insufficient permissions to invite users');
    });
  });

  describe('getOrganizations', () => {
    it('should fetch user organizations successfully', async () => {
      const mockUser = { id: 'user-123' };
      const mockOrganizations = [
        { id: 'org-1', name: 'Org 1' },
        { id: 'org-2', name: 'Org 2' },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.eq.mockResolvedValue({
        data: mockOrganizations,
        error: null,
      });

      const result = await getOrganizations();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganizations);
    });

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.eq.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getOrganizations();

      expect(result.error).toBe('Database error');
    });
  });
});
