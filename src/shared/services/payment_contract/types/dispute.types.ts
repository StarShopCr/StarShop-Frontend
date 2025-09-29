import type { i128 } from './payment.types';
import { DisputeStatus, DisputeDecision } from './payment.types';

// ==================== DISPUTE CORE TYPES ====================

/**
 * Dispute creation request
 */
export interface CreateDisputeRequest {
  tokenId: string;
  buyer: string;
  seller: string;
  reason: string;
  evidence?: string[];
  requestedRefundAmount?: i128;
  metadata?: Record<string, any>;
}

/**
 * Dispute resolution request
 */
export interface ResolveDisputeRequest {
  disputeId: string;
  arbitrator: string;
  decision: DisputeDecision;
  refundAmount: i128;
  reason?: string;
  evidence?: string[];
  metadata?: Record<string, any>;
}

/**
 * Dispute update request
 */
export interface UpdateDisputeRequest {
  disputeId: string;
  status?: DisputeStatus;
  reason?: string;
  evidence?: string[];
  metadata?: Record<string, any>;
}

/**
 * Dispute evidence
 */
export interface DisputeEvidence {
  id: string;
  type: EvidenceType;
  content: string;
  submittedBy: string;
  submittedAt: number;
  verified: boolean;
  metadata?: Record<string, any>;
}

/**
 * Evidence types
 */
export enum EvidenceType {
  TEXT_DESCRIPTION = 'text_description',
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  LINK = 'link',
  TRANSACTION_PROOF = 'transaction_proof',
  COMMUNICATION_LOG = 'communication_log'
}

/**
 * Dispute timeline entry
 */
export interface DisputeTimelineEntry {
  id: string;
  type: DisputeTimelineType;
  timestamp: number;
  actor: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Dispute timeline types
 */
export enum DisputeTimelineType {
  DISPUTE_CREATED = 'dispute_created',
  EVIDENCE_SUBMITTED = 'evidence_submitted',
  ARBITRATOR_ASSIGNED = 'arbitrator_assigned',
  ARBITRATOR_REVIEW = 'arbitrator_review',
  DECISION_MADE = 'decision_made',
  DISPUTE_RESOLVED = 'dispute_resolved',
  DISPUTE_CLOSED = 'dispute_closed',
  STATUS_CHANGED = 'status_changed'
}

/**
 * Arbitrator information
 */
export interface ArbitratorInfo {
  address: string;
  name?: string;
  reputation: number;
  totalCases: number;
  successfulResolutions: number;
  specialization?: string[];
  isActive: boolean;
  fee?: i128;
  responseTime?: number; // Average response time in hours
}

/**
 * Dispute statistics
 */
export interface DisputeStats {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  closedDisputes: number;
  averageResolutionTime: number; // in hours
  resolutionRate: number; // percentage
  favorBuyerRate: number; // percentage
  favorSellerRate: number; // percentage
  partialRefundRate: number; // percentage
}

/**
 * Dispute resolution metrics
 */
export interface DisputeResolutionMetrics {
  disputeId: string;
  timeToResolution: number; // in hours
  evidenceCount: number;
  arbitratorResponseTime: number; // in hours
  decisionAccuracy?: number; // if available from feedback
  satisfactionRating?: number; // if available from feedback
}

// ==================== DISPUTE VALIDATION TYPES ====================

/**
 * Dispute creation validation
 */
export interface DisputeCreationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedResolutionTime?: number;
  recommendedArbitrator?: string;
  suggestedEvidence?: string[];
}

/**
 * Evidence validation
 */
export interface EvidenceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  maxSize?: number;
  allowedTypes?: EvidenceType[];
}

/**
 * Arbitrator validation
 */
export interface ArbitratorValidation {
  isValid: boolean;
  isAvailable: boolean;
  reputationScore: number;
  specializationMatch: boolean;
  responseTimeEstimate?: number;
  error?: string;
}

// ==================== DISPUTE FILTER TYPES ====================

/**
 * Dispute search filter
 */
export interface DisputeSearchFilter {
  status?: DisputeStatus[];
  arbitrator?: string;
  buyer?: string;
  seller?: string;
  tokenId?: string;
  decision?: DisputeDecision[];
  createdAfter?: number;
  createdBefore?: number;
  resolvedAfter?: number;
  resolvedBefore?: number;
  hasEvidence?: boolean;
  minAmount?: i128;
  maxAmount?: i128;
  limit?: number;
  offset?: number;
}

/**
 * Arbitrator filter
 */
export interface ArbitratorFilter {
  isActive?: boolean;
  minReputation?: number;
  specialization?: string[];
  maxFee?: i128;
  maxResponseTime?: number;
  exclude?: string[];
  limit?: number;
  offset?: number;
}

// ==================== DISPUTE NOTIFICATION TYPES ====================

/**
 * Dispute notification types
 */
export enum DisputeNotificationType {
  DISPUTE_CREATED = 'dispute_created',
  EVIDENCE_SUBMITTED = 'evidence_submitted',
  ARBITRATOR_ASSIGNED = 'arbitrator_assigned',
  ARBITRATOR_RESPONSE = 'arbitrator_response',
  DISPUTE_RESOLVED = 'dispute_resolved',
  DISPUTE_CLOSED = 'dispute_closed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  DEADLINE_EXCEEDED = 'deadline_exceeded'
}

/**
 * Dispute notification
 */
export interface DisputeNotification {
  id: string;
  type: DisputeNotificationType;
  disputeId: string;
  recipient: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// ==================== DISPUTE TEMPLATE TYPES ====================

/**
 * Dispute template
 */
export interface DisputeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredEvidence: EvidenceType[];
  suggestedEvidence: EvidenceType[];
  commonReasons: string[];
  estimatedResolutionTime: number;
  isActive: boolean;
}

/**
 * Dispute category
 */
export interface DisputeCategory {
  id: string;
  name: string;
  description: string;
  commonIssues: string[];
  resolutionGuidelines: string[];
  averageResolutionTime: number;
  successRate: number;
}

// ==================== DISPUTE ANALYTICS TYPES ====================

/**
 * Dispute analytics data
 */
export interface DisputeAnalytics {
  period: AnalyticsPeriod;
  totalDisputes: number;
  resolutionRate: number;
  averageResolutionTime: number;
  categoryBreakdown: DisputeCategoryStats[];
  arbitratorPerformance: ArbitratorPerformanceStats[];
  trendData: DisputeTrendData[];
}

/**
 * Analytics period
 */
export interface AnalyticsPeriod {
  startDate: number;
  endDate: number;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Dispute category statistics
 */
export interface DisputeCategoryStats {
  category: string;
  count: number;
  resolutionRate: number;
  averageResolutionTime: number;
  commonDecisions: Array<{
    decision: DisputeDecision;
    count: number;
    percentage: number;
  }>;
}

/**
 * Arbitrator performance statistics
 */
export interface ArbitratorPerformanceStats {
  arbitrator: string;
  totalCases: number;
  resolutionRate: number;
  averageResolutionTime: number;
  satisfactionRating?: number;
  specialization: string[];
  isActive: boolean;
}

/**
 * Dispute trend data
 */
export interface DisputeTrendData {
  date: number;
  disputesCreated: number;
  disputesResolved: number;
  averageResolutionTime: number;
  resolutionRate: number;
}

// ==================== DISPUTE ESCALATION TYPES ====================

/**
 * Dispute escalation levels
 */
export enum EscalationLevel {
  LEVEL_1 = 'level_1', // Initial dispute
  LEVEL_2 = 'level_2', // Senior arbitrator
  LEVEL_3 = 'level_3', // Expert panel
  LEVEL_4 = 'level_4', // Community vote
  FINAL = 'final'      // Final decision
}

/**
 * Dispute escalation request
 */
export interface EscalationRequest {
  disputeId: string;
  fromLevel: EscalationLevel;
  toLevel: EscalationLevel;
  reason: string;
  requestedBy: string;
  timestamp: number;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: number;
}

/**
 * Escalation criteria
 */
export interface EscalationCriteria {
  level: EscalationLevel;
  maxCases: number;
  timeThreshold: number; // hours
  complexityThreshold: number;
  valueThreshold: i128;
  autoEscalate: boolean;
}

// ==================== DISPUTE FEEDBACK TYPES ====================

/**
 * Dispute feedback
 */
export interface DisputeFeedback {
  id: string;
  disputeId: string;
  submittedBy: string;
  target: 'arbitrator' | 'system' | 'process';
  rating: number; // 1-5
  comments?: string;
  categories: FeedbackCategory[];
  timestamp: number;
  isAnonymous: boolean;
}

/**
 * Feedback categories
 */
export enum FeedbackCategory {
  FAIRNESS = 'fairness',
  SPEED = 'speed',
  COMMUNICATION = 'communication',
  EXPERTISE = 'expertise',
  PROCESS = 'process',
  OUTCOME = 'outcome'
}

/**
 * Feedback summary
 */
export interface FeedbackSummary {
  target: 'arbitrator' | 'system' | 'process';
  averageRating: number;
  totalResponses: number;
  categoryBreakdown: Array<{
    category: FeedbackCategory;
    averageRating: number;
    count: number;
  }>;
  commonComments: string[];
  improvementSuggestions: string[];
}

// ==================== DISPUTE INTEGRATION TYPES ====================

/**
 * External dispute system integration
 */
export interface ExternalDisputeSystem {
  id: string;
  name: string;
  type: 'arbitration' | 'mediation' | 'court';
  isActive: boolean;
  apiEndpoint?: string;
  credentials?: Record<string, string>;
  supportedTypes: string[];
  averageCost: i128;
  averageTime: number;
  successRate: number;
}

/**
 * Dispute export data
 */
export interface DisputeExportData {
  disputeId: string;
  exportType: 'full' | 'summary' | 'evidence_only';
  format: 'json' | 'pdf' | 'csv';
  includeTimeline: boolean;
  includeEvidence: boolean;
  includeCommunications: boolean;
  timestamp: number;
  requestedBy: string;
}

// ==================== DISPUTE AUTOMATION TYPES ====================

/**
 * Dispute automation rule
 */
export interface DisputeAutomationRule {
  id: string;
  name: string;
  description: string;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Automation condition
 */
export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
  logic?: 'AND' | 'OR';
}

/**
 * Automation action
 */
export interface AutomationAction {
  type: 'assign_arbitrator' | 'send_notification' | 'escalate' | 'close' | 'update_status';
  parameters: Record<string, any>;
  delay?: number; // in seconds
}

// ==================== EXPORT TYPES ====================

export type DisputeId = string;
export type EvidenceId = string;
export type ArbitratorId = string;
export type NotificationId = string;
export type TemplateId = string;
export type FeedbackId = string;
export type EscalationId = string;
