export interface RawCustomerData {
  id?: string;
  customer_id?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  points?: number | string;
  loyalty_tier?: string;
  tier?: string;
  visits?: number | string;
}

export class CrmNormalizer {
  
  /**
   * Translates messy, varying CRM data into our strict canonical schema.
   */
  static normalizeCustomer(raw: RawCustomerData) {
    const nameParts = this.splitName(raw.name, raw.first_name, raw.last_name);
    
    return {
      crm_id: raw.id || raw.customer_id || null,
      email: this.normalizeEmail(raw.email),
      phone: this.normalizePhone(raw.phone_number || raw.phone),
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      loyalty_points: this.normalizeNumber(raw.points),
      loyalty_tier: this.normalizeString(raw.loyalty_tier || raw.tier),
      visit_count: this.normalizeNumber(raw.visits),
    };
  }

  private static splitName(fullName?: string, first?: string, last?: string) {
    if (first || last) {
      return { 
        firstName: this.normalizeString(first), 
        lastName: this.normalizeString(last) 
      };
    }
    
    if (!fullName) return { firstName: null, lastName: null };
    
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || null;
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;
    
    return { 
      firstName: this.normalizeString(firstName), 
      lastName: this.normalizeString(lastName) 
    };
  }

  private static normalizeEmail(email?: string): string | null {
    if (!email) return null;
    const cleaned = email.trim().toLowerCase();
    // Basic regex for valid format
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned) ? cleaned : null;
  }

  private static normalizePhone(phone?: string): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return digits.length > 0 ? phone.trim() : null; // Fallback to raw if complex international
  }

  private static normalizeNumber(val?: number | string): number {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return Math.floor(val);
    const parsed = parseInt(val.toString().replace(/,/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static normalizeString(val?: string | null): string | null {
    if (!val) return null;
    const cleaned = val.trim();
    return cleaned.length > 0 ? cleaned : null;
  }
}
