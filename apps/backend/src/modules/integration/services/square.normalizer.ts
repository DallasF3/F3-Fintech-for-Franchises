import { v4 as uuidv4 } from 'uuid';

export class SquareNormalizer {
  static normalizeCustomer(raw: any, franchiseId: string, storeId?: string) {
    return {
      id: uuidv4(),
      franchise_id: franchiseId,
      store_id: storeId || null,
      clover_id: raw.id, // Using existing unique ID column for external IDs to prevent schema thrash for MVP
      first_name: raw.given_name || null,
      last_name: raw.family_name || null,
      email: raw.email_address || null,
      phone: raw.phone_number || null,
      loyalty_points: 0,
      loyalty_tier: null,
      visit_count: 0,
      created_at: raw.created_at ? new Date(raw.created_at) : new Date(),
      updated_at: raw.updated_at ? new Date(raw.updated_at) : new Date(),
    };
  }

  static normalizeTransaction(raw: any, storeId: string, customerId: string | null) {
    // Square amounts are typically in cents
    const totalAmountCents = raw.total_money?.amount || 0;
    const taxAmountCents = raw.total_tax_money?.amount || 0;
    const totalAmount = totalAmountCents / 100;
    const taxAmount = taxAmountCents / 100;
    
    return {
      id: uuidv4(),
      store_id: storeId,
      customer_id: customerId,
      clover_id: raw.id, // Using existing unique ID column
      type: 'sale',
      status: raw.state === 'COMPLETED' ? 'completed' : 'pending',
      total_amount: totalAmount,
      tax_amount: taxAmount,
      currency: raw.total_money?.currency || 'USD',
      transaction_date: raw.created_at ? new Date(raw.created_at) : new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  static normalizeRefund(raw: any, transactionId: string, storeId: string, customerId: string | null) {
    const amountCents = raw.amount_money?.amount || 0;
    const amount = amountCents / 100;

    return {
      id: uuidv4(),
      transaction_id: transactionId,
      store_id: storeId,
      customer_id: customerId,
      clover_id: raw.id,
      amount: amount,
      currency: raw.amount_money?.currency || 'USD',
      reason: raw.reason || null,
      status: raw.status === 'COMPLETED' ? 'completed' : 'pending',
      refund_date: raw.created_at ? new Date(raw.created_at) : new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }
}
