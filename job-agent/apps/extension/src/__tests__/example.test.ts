import { describe, it, expect } from 'vitest';

describe('Example Tests', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have chrome mock available', () => {
    expect(chrome).toBeDefined();
    expect(chrome.storage).toBeDefined();
    expect(chrome.storage.local.get).toBeDefined();
  });
});

describe('URL Hashing', () => {
  async function hashUrl(url: string): Promise<string> {
    const normalized = new URL(url);
    normalized.search = '';
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized.href);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  it('should hash URLs consistently', async () => {
    const url1 = 'https://boards.greenhouse.io/company/jobs/123';
    const url2 = 'https://boards.greenhouse.io/company/jobs/123?gh_src=abc';
    
    const hash1 = await hashUrl(url1);
    const hash2 = await hashUrl(url2);
    
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different URLs', async () => {
    const url1 = 'https://boards.greenhouse.io/company/jobs/123';
    const url2 = 'https://boards.greenhouse.io/company/jobs/456';
    
    const hash1 = await hashUrl(url1);
    const hash2 = await hashUrl(url2);
    
    expect(hash1).not.toBe(hash2);
  });
});
