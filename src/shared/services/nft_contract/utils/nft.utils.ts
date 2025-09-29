import type { u32 } from '../types/nft.types';
import { 
  VALIDATION, 
  ERROR_TYPES, 
  METADATA_TEMPLATES,
  COMMON_ATTRIBUTES,
  DEFAULT_METADATA,
  METADATA_VALIDATION_RULES
} from '../constants/nft.constants';
import type { 
  NFTMetadata, 
  SupplyInfo,
  OwnershipInfo,
  MetadataValidation
} from '../types/nft.types';
import type {
  ExtendedNFTMetadata, 
  NFTAttribute, 
  MetadataValidationResult,
  MetadataValidationRules,
  MetadataTemplate
} from '../types/metadata.types';
import { AttributeType } from '../types/metadata.types';
import type { MetadataTransformOptions } from '../types/metadata.types';

/**
 * Format token ID for display
 */
export function formatTokenId(tokenId: u32): string {
  return `#${tokenId.toString()}`;
}

/**
 * Parse token ID from display format
 */
export function parseTokenId(displayId: string): u32 {
  const cleanId = displayId.replace('#', '').trim();
  const id = parseInt(cleanId, 10);
  
  if (isNaN(id) || id < 0) {
    throw new Error('Invalid token ID format');
  }
  
  return id as u32;
}

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  const stellarAddressRegex = /^[G-ZA-Z2-7]{56}$/;
  return stellarAddressRegex.test(address);
}

/**
 * Validate contract address format
 */
export function isValidContractAddress(address: string): boolean {
  const contractAddressRegex = /^[C-ZA-Z2-7]{56}$/;
  return contractAddressRegex.test(address);
}

/**
 * Validate token ID
 */
export function isValidTokenId(tokenId: any): tokenId is u32 {
  return typeof tokenId === 'number' && 
         Number.isInteger(tokenId) && 
         tokenId >= 0 && 
         tokenId <= 0xFFFFFFFF;
}

/**
 * Validate NFT metadata
 */
export function validateNFTMetadata(metadata: NFTMetadata): MetadataValidation {
  const errors: string[] = [];

  // Validate name
  if (!metadata.name || metadata.name.trim().length === 0) {
    errors.push('NFT name is required');
  } else if (metadata.name.length > VALIDATION.MAX_NAME_LENGTH) {
    errors.push(`NFT name must be less than ${VALIDATION.MAX_NAME_LENGTH} characters`);
  }

  // Validate description
  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push('NFT description is required');
  } else if (metadata.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push(`NFT description must be less than ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`);
  }

  // Validate attributes
  if (!Array.isArray(metadata.attributes)) {
    errors.push('Attributes must be an array');
  } else {
    if (metadata.attributes.length > VALIDATION.MAX_ATTRIBUTES) {
      errors.push(`Maximum ${VALIDATION.MAX_ATTRIBUTES} attributes allowed`);
    }

    metadata.attributes.forEach((attr, index) => {
      if (typeof attr !== 'string') {
        errors.push(`Attribute ${index + 1} must be a string`);
      } else if (attr.length > VALIDATION.MAX_ATTRIBUTE_VALUE_LENGTH) {
        errors.push(`Attribute ${index + 1} exceeds maximum length`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate extended NFT metadata
 */
export function validateExtendedNFTMetadata(metadata: ExtendedNFTMetadata): MetadataValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate basic fields
  if (!metadata.name || metadata.name.trim().length === 0) {
    errors.push('NFT name is required');
  } else if (metadata.name.length > METADATA_VALIDATION_RULES.maxNameLength) {
    errors.push(`NFT name must be less than ${METADATA_VALIDATION_RULES.maxNameLength} characters`);
  }

  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push('NFT description is required');
  } else if (metadata.description.length > METADATA_VALIDATION_RULES.maxDescriptionLength) {
    errors.push(`NFT description must be less than ${METADATA_VALIDATION_RULES.maxDescriptionLength} characters`);
  }

  // Validate URLs
  if (metadata.image && !isValidUrl(metadata.image)) {
    errors.push('Invalid image URL format');
  }

  if (metadata.external_url && !isValidUrl(metadata.external_url)) {
    errors.push('Invalid external URL format');
  }

  if (metadata.animation_url && !isValidUrl(metadata.animation_url)) {
    errors.push('Invalid animation URL format');
  }

  if (metadata.youtube_url && !isValidYouTubeUrl(metadata.youtube_url)) {
    errors.push('Invalid YouTube URL format');
  }

  // Validate attributes
  if (!Array.isArray(metadata.attributes)) {
    errors.push('Attributes must be an array');
  } else {
    if (metadata.attributes.length > METADATA_VALIDATION_RULES.maxAttributes) {
      errors.push(`Maximum ${METADATA_VALIDATION_RULES.maxAttributes} attributes allowed`);
    }

    metadata.attributes.forEach((attr, index) => {
      if (!attr.trait_type || attr.trait_type.trim().length === 0) {
        errors.push(`Attribute ${index + 1} trait_type is required`);
      } else if (attr.trait_type.length > METADATA_VALIDATION_RULES.maxAttributeNameLength) {
        errors.push(`Attribute ${index + 1} trait_type exceeds maximum length`);
      }

      if (attr.value === undefined || attr.value === null) {
        errors.push(`Attribute ${index + 1} value is required`);
      }

      if (attr.type && !METADATA_VALIDATION_RULES.allowedAttributeTypes.includes(attr.type as any)) {
        warnings.push(`Attribute ${index + 1} has unsupported type: ${attr.type}`);
      }
    });
  }

  // Validate collection
  if (metadata.collection && !metadata.collection.name) {
    errors.push('Collection name is required if collection is specified');
  }

  // Validate creator
  if (metadata.creator) {
    if (!metadata.creator.name) {
      errors.push('Creator name is required if creator is specified');
    }
    if (!metadata.creator.address || !isValidStellarAddress(metadata.creator.address)) {
      errors.push('Valid creator address is required if creator is specified');
    }
    if (metadata.creator.share !== undefined && (metadata.creator.share < 0 || metadata.creator.share > 100)) {
      errors.push('Creator share must be between 0 and 100');
    }
  }

  // Validate edition
  if (metadata.edition) {
    if (metadata.edition.number < 1) {
      errors.push('Edition number must be greater than 0');
    }
    if (metadata.edition.total < metadata.edition.number) {
      errors.push('Edition total must be greater than or equal to edition number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: errors.length === 0 ? metadata : undefined,
    schemaCompliant: errors.length === 0 && warnings.length === 0
  };
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
}

/**
 * Parse and validate metadata from string
 */
export function parseMetadata(metadataString: string): NFTMetadata {
  try {
    const parsed = JSON.parse(metadataString);
    
    // Ensure required fields exist
    const metadata: NFTMetadata = {
      name: parsed.name || DEFAULT_METADATA.NAME,
      description: parsed.description || DEFAULT_METADATA.DESCRIPTION,
      attributes: Array.isArray(parsed.attributes) ? parsed.attributes : DEFAULT_METADATA.ATTRIBUTES
    };

    const validation = validateNFTMetadata(metadata);
    if (!validation.isValid) {
      throw new Error(`Metadata validation failed: ${validation.errors.join(', ')}`);
    }

    return metadata;
  } catch (error) {
    throw new Error(`Failed to parse metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transform basic metadata to extended metadata
 */
export function transformToExtendedMetadata(
  metadata: NFTMetadata, 
  options: MetadataTransformOptions = {
    normalizeAttributeNames: true,
    validateAttributeValues: true,
    addDefaultAttributes: false,
    sanitizeUrls: true
  }
): ExtendedNFTMetadata {
  const extendedMetadata: ExtendedNFTMetadata = {
    name: metadata.name,
    description: metadata.description,
    attributes: []
  };

  // Transform attributes
  if (Array.isArray(metadata.attributes)) {
    const attributes: NFTAttribute[] = metadata.attributes.map((attr, index) => {
      let traitType = `Attribute ${index + 1}`;
      let value = attr;

      if (options.normalizeAttributeNames && typeof attr === 'string') {
        // Try to extract trait_type and value from string format
        const parts = attr.split(':');
        if (parts.length === 2) {
          traitType = parts[0].trim();
          value = parts[1].trim();
        }
      }

      const attribute: NFTAttribute = {
        trait_type: traitType,
        value: value,
        type: inferAttributeType(value)
      };

      return attribute;
    });
    extendedMetadata.attributes = attributes;
  }

  // Add default attributes if requested
  if (options.addDefaultAttributes && extendedMetadata.attributes.length === 0) {
    extendedMetadata.attributes = [
      { trait_type: 'Rarity', value: 'Common', type: AttributeType.STRING },
      { trait_type: 'Collection', value: 'StarShop', type: AttributeType.STRING }
    ];
  }

  // Apply custom transformations
  if (options.customTransforms) {
    let currentMetadata = extendedMetadata;
    for (const transform of options.customTransforms) {
      currentMetadata = transform(currentMetadata);
    }
    return currentMetadata;
  }

  return extendedMetadata;
}

/**
 * Infer attribute type from value
 */
export function inferAttributeType(value: any): AttributeType {
  if (typeof value === 'number') {
    return AttributeType.NUMBER;
  }
  if (typeof value === 'boolean') {
    return AttributeType.BOOLEAN;
  }
  if (typeof value === 'string') {
    // Check if it's a date
    if (!isNaN(Date.parse(value))) {
      return AttributeType.DATE;
    }
    // Check if it's a URL
    if (isValidUrl(value)) {
      return AttributeType.URL;
    }
    // Check if it's a color
    if (isValidColor(value)) {
      return AttributeType.COLOR;
    }
  }
  return AttributeType.STRING;
}

/**
 * Validate color format
 */
export function isValidColor(color: string): boolean {
  // Hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  // RGB/RGBA color
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
    return true;
  }
  // Named colors (basic set)
  const namedColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white', 'gray', 'pink'];
  return namedColors.includes(color.toLowerCase());
}

/**
 * Calculate supply information
 */
export function calculateSupplyInfo(maxSupply: u32, currentSupply: u32): SupplyInfo {
  const remainingSupply = Math.max(0, maxSupply - currentSupply);
  const supplyPercentage = maxSupply > 0 ? Math.round((currentSupply / maxSupply) * 100) : 0;

  return {
    maxSupply,
    currentSupply,
    remainingSupply,
    supplyPercentage
  };
}

/**
 * Check if supply is exhausted
 */
export function isSupplyExhausted(maxSupply: u32, currentSupply: u32): boolean {
  return currentSupply >= maxSupply;
}

/**
 * Get remaining supply percentage
 */
export function getRemainingSupplyPercentage(maxSupply: u32, currentSupply: u32): number {
  if (maxSupply === 0) return 0;
  const remaining = maxSupply - currentSupply;
  return Math.round((remaining / maxSupply) * 100);
}

/**
 * Generate random attributes from templates
 */
export function generateRandomAttributes(templateId: string): NFTAttribute[] {
  const template = METADATA_TEMPLATES[templateId as keyof typeof METADATA_TEMPLATES];
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  return template.attributes.map((attrTemplate: any) => {
    let value: string | number | boolean = 'Unknown';

    // Generate random values based on common attributes
    if (attrTemplate.trait_type.toLowerCase().includes('rarity')) {
      value = getRandomValue(COMMON_ATTRIBUTES.RARITY);
    } else if (attrTemplate.trait_type.toLowerCase().includes('color')) {
      value = getRandomValue(COMMON_ATTRIBUTES.COLOR);
    } else if (attrTemplate.trait_type.toLowerCase().includes('size')) {
      value = getRandomValue(COMMON_ATTRIBUTES.SIZE);
    } else if (attrTemplate.trait_type.toLowerCase().includes('condition')) {
      value = getRandomValue(COMMON_ATTRIBUTES.CONDITION);
    } else if (attrTemplate.trait_type.toLowerCase().includes('material')) {
      value = getRandomValue(COMMON_ATTRIBUTES.MATERIAL);
    } else if (attrTemplate.type === AttributeType.NUMBER) {
      value = Math.floor(Math.random() * 100) + 1;
    } else if (attrTemplate.type === AttributeType.BOOLEAN) {
      value = Math.random() > 0.5;
    }

    return {
      ...attrTemplate,
      value
    };
  });
}

/**
 * Get random value from array
 */
function getRandomValue<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  exponentialBackoff: boolean = true
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = exponentialBackoff 
        ? baseDelay * Math.pow(2, attempt)
        : baseDelay;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Get error type from error message
 */
export function getErrorType(error: string): string {
  if (error.includes('network') || error.includes('connection')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  if (error.includes('contract') || error.includes('transaction')) {
    return ERROR_TYPES.CONTRACT_ERROR;
  }
  if (error.includes('validation') || error.includes('invalid')) {
    return ERROR_TYPES.VALIDATION_ERROR;
  }
  if (error.includes('wallet') || error.includes('signature')) {
    return ERROR_TYPES.WALLET_ERROR;
  }
  if (error.includes('supply') || error.includes('exceeded')) {
    return ERROR_TYPES.SUPPLY_ERROR;
  }
  if (error.includes('owner') || error.includes('ownership')) {
    return ERROR_TYPES.OWNERSHIP_ERROR;
  }
  if (error.includes('metadata')) {
    return ERROR_TYPES.METADATA_ERROR;
  }
  return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * Create a deep clone of an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (obj instanceof Map) {
    const newMap = new Map();
    for (const [key, value] of obj) {
      newMap.set(deepClone(key), deepClone(value));
    }
    return newMap as T;
  }
  
  if (obj instanceof Set) {
    const newSet = new Set();
    for (const value of obj) {
      newSet.add(deepClone(value));
    }
    return newSet as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncate string with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Sanitize string for metadata
 */
export function sanitizeMetadataString(str: string): string {
  return str
    .trim()
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, VALIDATION.MAX_DESCRIPTION_LENGTH);
}

/**
 * Validate ownership before operation
 */
export function validateOwnership(
  tokenId: u32,
  owner: string,
  expectedOwner: string
): OwnershipInfo {
  const exists = owner !== '0x0000000000000000000000000000000000000000';
  const isValid = exists && owner.toLowerCase() === expectedOwner.toLowerCase();

  return {
    tokenId,
    owner,
    exists
  };
}
