/**
 * Background Service Entry Point
 */

import './ServiceWorker';

export type { MessageType, BaseMessage, ExtensionMessage, MessageResponse } from './types';
export { MessageHandler } from './MessageHandler';
export { BadgeManager } from './BadgeManager';

console.log('[Sift] Background service worker loaded');
