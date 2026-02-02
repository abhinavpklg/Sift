/**
 * Sift Content Script - Auto-Fill with Overlay UI
 */

import { ContentManager } from './ContentManager';
import { FillOverlay } from './ui/FillOverlay';
import { detectPlatform } from './platforms';

console.log('[Sift] Content script loaded on:', window.location.href);

const platform = detectPlatform(window.location.href);

if (platform === 'unknown') {
  console.log('[Sift] Not a recognized ATS platform');
} else {
  console.log('[Sift] Detected platform:', platform);
  
  let overlay: FillOverlay;
  let contentManager: ContentManager;
  let hasAutoFilled = false;

  // Create overlay
  overlay = new FillOverlay({
    onFillClick: async () => {
      overlay.setStatus('filling', 'Filling application...');
      const result = await contentManager.fillForm();
      
      if (result) {
        overlay.setProgress(result.filledFields, result.totalFields);
        overlay.setStatus('filled', `Filled ${result.filledFields} fields`);
        
        if (overlay.isAutoNextEnabled() && result.filledFields > 0) {
          setTimeout(() => contentManager.clickNextButton(), 1500);
        }
      } else {
        overlay.setStatus('error', 'No profile found');
      }
    },
    
    onNextClick: () => {
      contentManager.clickNextButton();
    },
    
    onClose: () => {
      overlay.hide();
    },
  });

  // Create content manager
  contentManager = new ContentManager({
    onReady: () => {
      console.log('[Sift] Ready');
    },
    
    onFormDetected: async (form) => {
      console.log('[Sift] Form detected with', form.fields.length, 'fields');
      overlay.setFieldCount(form.fields.length);
      overlay.setStatus('idle', `${form.fields.length} fields detected`);
      
      // Auto-fill if enabled
      if (overlay.isAutoFillEnabled() && !hasAutoFilled) {
        hasAutoFilled = true;
        console.log('[Sift] Auto-filling...');
        overlay.setStatus('filling', 'Filling application...');
        
        await new Promise(r => setTimeout(r, 500));
        
        const result = await contentManager.fillForm();
        
        if (result) {
          overlay.setProgress(result.filledFields, result.totalFields);
          overlay.setStatus('filled', `Filled ${result.filledFields} fields`);
          
          if (overlay.isAutoNextEnabled() && result.filledFields > 0) {
            setTimeout(() => {
              console.log('[Sift] Auto-next...');
              contentManager.clickNextButton();
            }, 2000);
          }
        } else {
          overlay.setStatus('error', 'Create a profile first');
        }
      }
    },
    
    onFormFilled: (result) => {
      console.log('[Sift] ✅ Filled:', result.filledFields, '/', result.totalFields);
    },
    
    onError: (error) => {
      console.error('[Sift] Error:', error);
      overlay.setStatus('error', error.message);
    },
  });

  // Show overlay and initialize
  overlay.show();
  overlay.setStatus('detecting', 'Detecting form...');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => contentManager.initialize());
  } else {
    contentManager.initialize();
  }

  // Reset on URL change
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      hasAutoFilled = false;
      overlay.setStatus('detecting', 'Detecting form...');
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Message listener for popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'FILL_FORM') {
      contentManager.fillForm(message.options)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
    if (message.type === 'GET_FORM_STATE') {
      sendResponse({ success: true, data: contentManager.getState() });
    }
  });
}
