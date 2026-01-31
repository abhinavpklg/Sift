// Content Script - Injected into job application pages
console.log('AI Job Agent: Content script loaded on', window.location.href);

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  switch (message.type) {
    case 'FILL_FORM':
      handleFillForm().then(sendResponse);
      return true;
      
    case 'PING':
      sendResponse({ success: true, data: 'pong' });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

async function handleFillForm() {
  try {
    // Get active profile from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
    
    if (!response.success || !response.data) {
      console.warn('No active profile found');
      return { success: false, error: 'No active profile selected' };
    }
    
    const profile = response.data;
    console.log('Filling form with profile:', profile.name);
    
    // TODO: Implement actual form filling logic in CONTENT-002
    // For now, just log that we would fill the form
    console.log('Form filling will be implemented in CONTENT-005');
    
    return { success: true, data: { filled: 0 } };
  } catch (error) {
    console.error('Error filling form:', error);
    return { success: false, error: String(error) };
  }
}

// Check if this URL was already applied to
async function checkIfApplied() {
  const response = await chrome.runtime.sendMessage({ 
    type: 'CHECK_URL', 
    url: window.location.href 
  });
  
  if (response.success && response.data) {
    showAppliedBadge(response.data.appliedAt);
  }
}

function showAppliedBadge(appliedAt: string) {
  // Remove existing badge if any
  const existing = document.querySelector('.job-agent-applied-badge');
  if (existing) existing.remove();
  
  const badge = document.createElement('div');
  badge.className = 'job-agent-applied-badge';
  
  const date = new Date(appliedAt).toLocaleDateString();
  badge.innerHTML = `
    <span>✓ Already applied on ${date}</span>
    <button class="close-btn" aria-label="Dismiss">×</button>
  `;
  
  badge.querySelector('.close-btn')?.addEventListener('click', () => {
    badge.remove();
  });
  
  document.body.appendChild(badge);
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => badge.remove(), 10000);
}

// Initialize
checkIfApplied();
