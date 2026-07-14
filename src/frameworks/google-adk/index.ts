/**
 * Google ADK Framework — Auto-registration
 * 
 * Importing this file registers the Google ADK adapter with the framework registry.
 */

import { FrameworkRegistry } from '../registry';
import { GoogleADKAdapter } from './adapter';

FrameworkRegistry.register(GoogleADKAdapter);

export { GoogleADKAdapter };
