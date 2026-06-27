export class CloverNormalizer {
  
  static normalizeAmount(cents: number | undefined): number {
    if (cents === undefined || cents === null) return 0;
    return cents / 100;
  }

  static normalizeDate(epochMs: number | undefined): Date | null {
    if (!epochMs) return null;
    return new Date(epochMs);
  }

  static normalizeStatus(result: string | undefined): string {
    const statusMap: Record<string, string> = {
      'SUCCESS': 'completed',
      'FAIL': 'failed',
      'VOIDED': 'voided',
      'AUTH': 'pending',
    };
    return statusMap[result || ''] || 'completed';
  }

  static normalizePhone(phone: string | undefined): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return phone;
  }

  static normalizeEmail(email: string | undefined): string | null {
    if (!email) return null;
    return email.trim().toLowerCase();
  }

  /**
   * Normalizes Clover Customer payload to database Customer schema
   */
  static normalizeCustomer(raw: any, franchiseId: string, storeId: string | null = null): any {
    const email = raw.emailAddresses?.[0]?.emailAddress || raw.email || null;
    const phone = raw.phoneNumbers?.[0]?.phoneNumber || raw.phone || null;
    
    return {
      franchise_id: franchiseId,
      store_id: storeId,
      clover_id: raw.id,
      email: this.normalizeEmail(email),
      phone: this.normalizePhone(phone),
      first_name: raw.firstName || null,
      last_name: raw.lastName || null,
      loyalty_points: raw.loyaltyPoints || 0,
      loyalty_tier: raw.loyaltyTier || null,
      metadata: raw.metadata || {},
    };
  }

  /**
   * Normalizes Clover Payment/Transaction payload to database Transaction schema
   */
  static normalizeTransaction(raw: any, storeId: string, customerId: string | null = null): any {
    const amount = this.normalizeAmount(raw.amount);
    const taxAmount = this.normalizeAmount(raw.taxAmount);
    const tipAmount = this.normalizeAmount(raw.tipAmount);
    // Calculate net amount as amount - tax - tip (or whatever business logic is appropriate)
    const netAmount = Math.max(0, amount - taxAmount - tipAmount);

    return {
      store_id: storeId,
      customer_id: customerId,
      clover_id: raw.id,
      type: raw.paymentStatus === 'REFUNDED' ? 'refund' : 'sale',
      status: this.normalizeStatus(raw.result),
      amount,
      tax_amount: taxAmount,
      tip_amount: tipAmount,
      discount_amount: this.normalizeAmount(raw.discountAmount),
      net_amount: netAmount,
      payment_method: raw.tender?.label || 'card',
      card_brand: raw.cardTransaction?.cardType || null,
      card_last_four: raw.cardTransaction?.last4 || null,
      line_items: JSON.stringify(raw.lineItems || []),
      metadata: raw.metadata || {},
      transacted_at: this.normalizeDate(raw.createdTime) || new Date(),
    };
  }

  /**
   * Normalizes Clover Refund payload to database Refund schema
   */
  static normalizeRefund(raw: any, transactionId: string, storeId: string, customerId: string | null = null): any {
    return {
      transaction_id: transactionId,
      store_id: storeId,
      customer_id: customerId,
      clover_id: raw.id,
      amount: this.normalizeAmount(raw.amount),
      reason: raw.reason || null,
      status: 'completed', // Clover refunds fetched from refunds endpoint are completed
      refunded_at: this.normalizeDate(raw.createdTime) || new Date(),
      metadata: raw.metadata || {},
    };
  }
}

