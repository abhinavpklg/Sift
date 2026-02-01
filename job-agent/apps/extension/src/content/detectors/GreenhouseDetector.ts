import type { DetectedForm, DetectedField } from '../types';
export class GreenhouseDetector {
  detect(): DetectedForm | null { return null; }
  getFields(): DetectedField[] { return []; }
}
export default GreenhouseDetector;
