/**
 * Sift Background Service Worker
 */

import type { ExtensionMessage, MessageResponse } from './types';
import { MessageHandler } from './MessageHandler';
import { BadgeManager } from './BadgeManager';

let messageHandler: MessageHandler | null = null;
let badgeManager: BadgeManager | null = null;
let isInitialized = false;

async function initialize(): Promise<void> {
  if (isInitialized) return;
  console.log('[Sift] Initializing service worker...');

  try {
    badgeManager = new BadgeManager();
    await badgeManager.initialize();
    messageHandler = new MessageHandler(badgeManager);
    isInitialized = true;
    console.log('[Sift] Service worker initialized successfully');
  } catch (error) {
    console.error('[Sift] Failed to initialize service worker:', error);
  }
}

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): boolean => {
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error) => {
        console.error('[Sift] Message handling error:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });
    return true;
  }
);

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender
): Promise<MessageResponse> {
  if (!isInitialized) await initialize();
  if (!messageHandler) return { success: false, error: 'Service worker not initialized' };
  console.log('[Sift] Received message:', message.type, 'from:', sender.tab?.id ?? 'popup');
  return messageHandler.handle(message, sender);
}

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Sift] Extension installed:', details.reason);
  await initialize();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Sift] Browser startup detected');
  await initialize();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('[Sift] Alarm triggered:', alarm.name);
  if (alarm.name === 'daily-reset' && badgeManager) {
    await badgeManager.refreshCount();
  }
});

function getNextMidnight(): number {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

chrome.alarms.create('daily-reset', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60,
});

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && checkIfATSSite(tab.url)) {
    console.log('[Sift] ATS site detected:', tab.url);
  }
});

function checkIfATSSite(url: string): boolean {
  const atsPatterns = [
    'greenhouse.io',
    'lever.co',
    'ashbyhq.com',
    'workday',
    'icims.com',
    'smartrecruiters.com',
    'jobvite.com',
    'bamboohr.com',
    'breezy.hr',
    'workable.com',
  ];
  return atsPatterns.some((pattern) => url.includes(pattern));
}

// Keep service worker alive (MV3 workaround)
setInterval(() => {
  chrome.runtime.getPlatformInfo(() => {
    // Keep alive ping
  });
}, 20 * 1000);

export { initialize, handleMessage, checkIfATSSite };
