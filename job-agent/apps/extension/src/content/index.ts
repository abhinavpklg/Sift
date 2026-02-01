/**
 * Sift Content Script Entry Point
 */

import { ContentManager } from './ContentManager';
import { detectPlatform } from './platforms';

console.log('[Sift] Content script loaded on:', window.location.href);

const platform = detectPlatform(window.location.href);

if (platform === 'unknown') {
  console.log('[Sift] Not a recognized ATS platform');
} else {
  console.log('[Sift] Detected platform:', platform);
  
  const contentManager = new ContentManager({
    onReady: () => console.log('[Sift] Ready'),
    onFormDetected: (form) => console.log('[Sift] Form detected:', form),
    onFormFilled: (result) => console.log('[Sift] Filled:', result),
    onError: (error) => console.error('[Sift] Error:', error),
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => contentManager.initialize());
  } else {
    contentManager.initialize();
  }
}
