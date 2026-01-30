/**
 * Tests for MemberServiceClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberServiceClient } from '../memberServiceClient';

describe('MemberServiceClient', () => {
  let client: MemberServiceClient;

  beforeEach(() => {
    client = new MemberServiceClient('https://test-api.example.com', 'test-key');
    global.fetch = vi.fn();
  });

  describe('listMembers', () => {
    it('should successfully list members for a tenant', async () => {
      const mockResponse = {
        data: {
          listMembers: {
            items: [
              {
                loginId: 'user1',
                name: 'User One',
                email: 'user1@example.com',
                phone: '+1234567890',
                tenantId: 'tenant1',
              },
              {
                loginId: 'user2',
                name: 'User Two',
                email: 'user2@example.com',
                phone: null,
                tenantId: 'tenant1',
              },
            ],
            page: 0,
            pageSize: 20,
            totalItems: 2,
            totalPages: 1,
          },
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.listMembers('tenant1');

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.email).toBe('user1@example.com');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.example.com',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-key',
          },
        })
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(client.listMembers('tenant1')).rejects.toThrow('Member Service request failed');
    });

    it('should handle GraphQL errors', async () => {
      const mockResponse = {
        errors: [{ message: 'Tenant not found' }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(client.listMembers('tenant1')).rejects.toThrow('GraphQL error: Tenant not found');
    });
  });
});
