import type { u32 } from './nft.types';

/**
 * NFT attribute types
 */
export enum AttributeType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  URL = 'url',
  COLOR = 'color',
}

/**
 * NFT attribute definition
 */
export interface NFTAttribute {
  /** Attribute name */
  trait_type: string;
  /** Attribute value */
  value: string | number | boolean;
  /** Attribute type */
  type?: AttributeType;
  /** Display name for the attribute */
  display_type?: string;
  /** Maximum value for numeric attributes */
  max_value?: number;
  /** Minimum value for numeric attributes */
  min_value?: number;
}

/**
 * Extended NFT metadata with structured attributes
 */
export interface ExtendedNFTMetadata {
  /** NFT name */
  name: string;
  /** NFT description */
  description: string;
  /** NFT image URL */
  image?: string;
  /** NFT external URL */
  external_url?: string;
  /** NFT animation URL */
  animation_url?: string;
  /** NFT background color */
  background_color?: string;
  /** NFT YouTube URL */
  youtube_url?: string;
  /** Structured attributes */
  attributes: NFTAttribute[];
  /** Additional properties */
  properties?: Record<string, any>;
  /** NFT collection information */
  collection?: {
    name: string;
    family?: string;
  };
  /** NFT creator information */
  creator?: {
    name: string;
    address: string;
    share?: number;
  };
  /** NFT edition information */
  edition?: {
    number: number;
    total: number;
  };
}

/**
 * Metadata validation rules
 */
export interface MetadataValidationRules {
  /** Maximum name length */
  maxNameLength: number;
  /** Maximum description length */
  maxDescriptionLength: number;
  /** Maximum number of attributes */
  maxAttributes: number;
  /** Maximum attribute name length */
  maxAttributeNameLength: number;
  /** Maximum attribute value length */
  maxAttributeValueLength: number;
  /** Required attributes */
  requiredAttributes: string[];
  /** Allowed attribute types */
  allowedAttributeTypes: AttributeType[];
  /** Maximum image URL length */
  maxImageUrlLength: number;
  /** Maximum external URL length */
  maxExternalUrlLength: number;
}

/**
 * Metadata template for common NFT types
 */
export interface MetadataTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template attributes */
  attributes: Omit<NFTAttribute, 'value'>[];
  /** Template properties */
  properties?: Record<string, any>;
  /** Template category */
  category: string;
}

/**
 * Metadata schema definition
 */
export interface MetadataSchema {
  /** Schema version */
  version: string;
  /** Schema name */
  name: string;
  /** Required fields */
  required: string[];
  /** Optional fields */
  optional: string[];
  /** Field definitions */
  properties: Record<string, {
    type: string;
    description: string;
    format?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    enum?: string[];
  }>;
  /** Attribute schemas */
  attributeSchemas: Record<string, {
    type: AttributeType;
    required: boolean;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      enum?: string[];
    };
  }>;
}

/**
 * Metadata validation result
 */
export interface MetadataValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Validated metadata */
  metadata?: ExtendedNFTMetadata;
  /** Schema compliance */
  schemaCompliant: boolean;
}

/**
 * Metadata transformation options
 */
export interface MetadataTransformOptions {
  /** Whether to normalize attribute names */
  normalizeAttributeNames: boolean;
  /** Whether to validate attribute values */
  validateAttributeValues: boolean;
  /** Whether to add default attributes */
  addDefaultAttributes: boolean;
  /** Whether to sanitize URLs */
  sanitizeUrls: boolean;
  /** Custom transformations */
  customTransforms?: Array<(metadata: ExtendedNFTMetadata) => ExtendedNFTMetadata>;
}

/**
 * Metadata query options
 */
export interface MetadataQueryOptions {
  /** Filter by name contains */
  nameContains?: string;
  /** Filter by description contains */
  descriptionContains?: string;
  /** Filter by attribute name */
  attributeName?: string;
  /** Filter by attribute value */
  attributeValue?: string | number | boolean;
  /** Filter by attribute type */
  attributeType?: AttributeType;
  /** Filter by collection */
  collection?: string;
  /** Filter by creator */
  creator?: string;
  /** Sort options */
  sort?: {
    field: keyof ExtendedNFTMetadata;
    order: 'asc' | 'desc';
  };
  /** Pagination */
  pagination?: {
    limit: number;
    offset: number;
  };
}

/**
 * Metadata statistics
 */
export interface MetadataStatistics {
  /** Total number of NFTs */
  totalNFTs: number;
  /** Unique collections */
  uniqueCollections: number;
  /** Unique creators */
  uniqueCreators: number;
  /** Most common attributes */
  commonAttributes: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  /** Attribute type distribution */
  attributeTypeDistribution: Record<AttributeType, number>;
  /** Average attributes per NFT */
  averageAttributesPerNFT: number;
}

/**
 * Metadata export format
 */
export enum MetadataExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  YAML = 'yaml',
}

/**
 * Metadata export options
 */
export interface MetadataExportOptions {
  /** Export format */
  format: MetadataExportFormat;
  /** Include metadata */
  includeMetadata: boolean;
  /** Include attributes */
  includeAttributes: boolean;
  /** Include properties */
  includeProperties: boolean;
  /** Include statistics */
  includeStatistics: boolean;
  /** Custom fields to include */
  customFields?: string[];
  /** Filter options */
  filter?: MetadataQueryOptions;
}

/**
 * Metadata import options
 */
export interface MetadataImportOptions {
  /** Import format */
  format: MetadataExportFormat;
  /** Whether to validate imported data */
  validate: boolean;
  /** Whether to transform imported data */
  transform: boolean;
  /** Transformation options */
  transformOptions?: MetadataTransformOptions;
  /** Whether to overwrite existing metadata */
  overwrite: boolean;
  /** Batch size for processing */
  batchSize: number;
}

/**
 * Metadata backup information
 */
export interface MetadataBackup {
  /** Backup ID */
  id: string;
  /** Backup timestamp */
  timestamp: number;
  /** Backup version */
  version: string;
  /** Number of NFTs backed up */
  nftCount: number;
  /** Backup size in bytes */
  size: number;
  /** Backup checksum */
  checksum: string;
  /** Backup metadata */
  metadata: Record<string, any>;
}

/**
 * Metadata restore options
 */
export interface MetadataRestoreOptions {
  /** Backup ID to restore from */
  backupId: string;
  /** Whether to validate before restore */
  validate: boolean;
  /** Whether to overwrite existing data */
  overwrite: boolean;
  /** Filter for selective restore */
  filter?: {
    tokenIds?: u32[];
    collections?: string[];
    creators?: string[];
  };
}

/**
 * Metadata migration options
 */
export interface MetadataMigrationOptions {
  /** Source schema version */
  fromVersion: string;
  /** Target schema version */
  toVersion: string;
  /** Migration strategy */
  strategy: 'preserve' | 'transform' | 'merge';
  /** Custom migration functions */
  customMigrations?: Array<(metadata: any) => any>;
  /** Whether to create backup before migration */
  createBackup: boolean;
  /** Batch size for migration */
  batchSize: number;
}
