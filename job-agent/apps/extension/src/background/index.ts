// Background Service Worker
console.log('AI Job Agent: Background service worker started');

// Message listener - using underscore prefix for unused params
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'GET_ACTIVE_PROFILE':
      handleGetActiveProfile().then(sendResponse);
      return true;
      
    case 'INCREMENT_COUNTER':
      handleIncrementCounter().then(sendResponse);
      return true;
      
    case 'CHECK_URL':
      handleCheckUrl(message.url).then(sendResponse);
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

async function handleGetActiveProfile() {
  try {
    const result = await chrome.storage.local.get(['profiles', 'activeProfileId']);
    const profiles = result.profiles as Array<{ id: string; [key: string]: unknown }> | undefined;
    const profile = profiles?.find((p) => p.id === result.activeProfileId);
    return { success: true, data: profile || null };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function handleIncrementCounter() {
  try {
    const result = await chrome.storage.local.get(['stats']);
    const stats = (result.stats as { appliedToday: number; dailyGoal: number; totalApplied: number }) || { 
      appliedToday: 0, 
      dailyGoal: 10, 
      totalApplied: 0 
    };
    stats.appliedToday += 1;
    stats.totalApplied += 1;
    await chrome.storage.local.set({ stats });
    
    await chrome.action.setBadgeText({ text: String(stats.appliedToday) });
    await chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
    
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function handleCheckUrl(url: string) {
  try {
    const result = await chrome.storage.local.get(['appliedJobs']);
    const appliedJobs = (result.appliedJobs as Array<{ urlHash: string }>) || [];
    const urlHash = await hashUrl(url);
    const found = appliedJobs.find((j) => j.urlHash === urlHash);
    return { success: true, data: found || null };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function hashUrl(url: string): Promise<string> {
  const normalized = new URL(url);
  normalized.search = '';
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized.href);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

// Reset daily counter at midnight
chrome.alarms.create('resetDailyCounter', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'resetDailyCounter') {
    const result = await chrome.storage.local.get(['stats']);
    const stats = (result.stats as { appliedToday: number; dailyGoal: number; totalApplied: number }) || { 
      appliedToday: 0, 
      dailyGoal: 10, 
      totalApplied: 0 
    };
    stats.appliedToday = 0;
    await chrome.storage.local.set({ stats });
    await chrome.action.setBadgeText({ text: '' });
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('AI Job Agent installed');
  
  const result = await chrome.storage.local.get(['stats']);
  if (!result.stats) {
    await chrome.storage.local.set({
      stats: { appliedToday: 0, dailyGoal: 10, totalApplied: 0 }
    });
  }
});
