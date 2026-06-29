export type IntegrationType = 'clover' | 'payment' | 'crm' | 'loyalty' | 'email' | 'sms' | 'square' | 'salesforce';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface IntegrationConfig {
  id: string;
  franchise_id: string;
  store_id: string | null;
  type: IntegrationType;
  status: IntegrationStatus;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  last_sync_at: Date | null;
  last_error: string | null;
  error_count: number;
}

export interface IConnector {
  /** Unique connector type identifier */
  readonly type: IntegrationType;

  /** Test connection with stored credentials */
  testConnection(config: IntegrationConfig): Promise<ConnectionTestResult>;

  /** Run a full data sync (backfill all historical data) */
  fullSync(config: IntegrationConfig, options: SyncOptions): Promise<SyncResult>;

  /** Run a delta sync (only new/modified records since last sync) */
  deltaSync(config: IntegrationConfig, since: Date): Promise<SyncResult>;

  /** Process an incoming webhook payload */
  processWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
}

export interface SyncError {
  message: string;
  code?: string;
  details?: any;
}

export interface SyncResult {
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: SyncError[];
  nextCursor?: string;       // For pagination continuation
  hasMore: boolean;
}

export interface SyncOptions {
  batchSize: number;         // Records per API call (default: 100)
  maxRecords?: number;       // Limit for testing
  since?: Date;              // Delta sync start date
  dryRun?: boolean;          // Validate without writing
}

export interface ConnectionTestResult {
  success: boolean;
  merchantName?: string;
  storeCount?: number;
  error?: string;
  latencyMs: number;
}

export interface WebhookResult {
  success: boolean;
  event_type: string;
  recordsProcessed: number;
  error?: string;
}
