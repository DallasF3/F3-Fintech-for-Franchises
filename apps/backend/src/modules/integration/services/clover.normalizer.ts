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
}
