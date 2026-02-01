/**
 * Tests for OrgServiceClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrgServiceClient } from '../orgServiceClient';

// Mock the auth token provider
vi.mock('../authTokenProvider', () => ({
  getAuthToken: vi.fn(() => 'mock-session-token'),
}));

describe('OrgServiceClient', () => {
  let client: OrgServiceClient;

  beforeEach(() => {
    client = new OrgServiceClient('https://test-api.example.com');
    global.fetch = vi.fn();
  });

  describe('listTenants', () => {
    it('should successfully list tenants', async () => {
      const mockResponse = {
        data: {
          listTenants: {
            items: [
              { id: 'tenant1', name: 'Tenant 1' },
              { id: 'tenant2', name: 'Tenant 2' },
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
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.listTenants();

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.name).toBe('Tenant 1');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.example.com',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-session-token',
          },
        })
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(client.listTenants()).rejects.toThrow('Org Service request failed');
    });

    it('should handle GraphQL errors', async () => {
      const mockResponse = {
        errors: [{ message: 'Unauthorized' }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(client.listTenants()).rejects.toThrow('GraphQL error: Unauthorized');
    });

    it('should handle missing data', async () => {
      const mockResponse = {};

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(client.listTenants()).rejects.toThrow('No data returned from Org Service');
    });
  });
});
