/**
 * Strands Framework — Auto-registration
 * 
 * Importing this file registers the Strands adapter with the framework registry.
 */

import { FrameworkRegistry } from '../registry';
import { StrandsAdapter } from './adapter';

FrameworkRegistry.register(StrandsAdapter);

export { StrandsAdapter };
