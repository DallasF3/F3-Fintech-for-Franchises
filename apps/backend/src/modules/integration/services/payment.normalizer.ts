export class PaymentNormalizer {
  
  static normalizeAmount(cents: number | undefined): number {
    if (cents === undefined || cents === null) return 0;
    return cents / 100;
  }

  static normalizeDate(epochMs: number | string | undefined): Date {
    if (!epochMs) return new Date();
    const parsed = typeof epochMs === 'string' ? parseInt(epochMs, 10) : epochMs;
    return isNaN(parsed) ? new Date() : new Date(parsed);
  }

  static normalizeStatus(status: string | undefined): string {
    const statusMap: Record<string, string> = {
      'PAID': 'funded',
      'FUNDED': 'funded',
      'PENDING': 'pending',
      'FAILED': 'failed',
      'REVERSED': 'reversed',
    };
    return statusMap[status?.toUpperCase() || ''] || 'pending';
  }

  /**
   * Normalizes raw processor settlement payload to database Settlements schema
   */
  static normalizeSettlement(raw: any, storeId: string): any {
    const grossAmount = this.normalizeAmount(raw.amount || raw.grossAmount);
    const fees = this.normalizeAmount(raw.fees || raw.feeAmount);
    const netAmount = this.normalizeAmount(raw.netAmount || (raw.amount - (raw.fees || 0)));
    const fundedAt = this.normalizeDate(raw.fundedTime || raw.createdTime);

    return {
      store_id: storeId,
      external_id: raw.settlementId || raw.id,
      status: this.normalizeStatus(raw.status),
      gross_amount: grossAmount,
      fees: fees,
      chargebacks: this.normalizeAmount(raw.chargebacks || 0),
      adjustments: this.normalizeAmount(raw.adjustments || 0),
      net_amount: netAmount,
      transaction_count: raw.transactionCount || 0,
      period_start: this.normalizeDate(raw.periodStart || raw.fundedTime || raw.createdTime),
      period_end: this.normalizeDate(raw.periodEnd || raw.fundedTime || raw.createdTime),
      funded_at: fundedAt,
      metadata: raw.metadata || {},
    };
  }

  /**
   * Normalizes raw processor chargeback payload to database Refunds schema
   */
  static normalizeChargeback(raw: any, transactionId: string, storeId: string, customerId: string | null = null): any {
    return {
      transaction_id: transactionId,
      store_id: storeId,
      customer_id: customerId,
      clover_id: raw.disputeId || raw.id, // Reference to processor dispute ID
      amount: this.normalizeAmount(raw.amount),
      reason: raw.reason || 'chargeback',
      status: 'completed', // Ingested chargeback disputes represent completed debits/refunds
      refunded_at: this.normalizeDate(raw.disputeTime || raw.createdTime),
      metadata: raw.metadata || {},
    };
  }
}
