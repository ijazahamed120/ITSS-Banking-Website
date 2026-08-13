/**
 * Risk level metadata and design system definitions
 */
export const RISK_LEVELS = {
  LOW: {
    key: 'LOW',
    label: 'Low Risk',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    textColor: '#15803D',
    badgeClass: 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]',
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Medium Risk',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    textColor: '#B45309',
    badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]',
  },
  HIGH: {
    key: 'HIGH',
    label: 'High Risk',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    textColor: '#B91C1C',
    badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FEE2E2]',
  },
  CRITICAL: {
    key: 'CRITICAL',
    label: 'Critical Risk',
    color: '#7C2D12',
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5',
    textColor: '#7C2D12',
    badgeClass: 'bg-[#FFF7ED] text-[#7C2D12] border-[#FFEDD5]',
  },
};

/**
 * Returns risk metadata based on a risk level string or score
 * @param {string|number} levelOrScore - Risk string ("LOW", "HIGH") or score (0-100)
 * @returns {Object} Risk level configuration
 */
export function getRiskMetadata(levelOrScore) {
  if (typeof levelOrScore === 'number') {
    if (levelOrScore >= 85) return RISK_LEVELS.CRITICAL;
    if (levelOrScore >= 65) return RISK_LEVELS.HIGH;
    if (levelOrScore >= 35) return RISK_LEVELS.MEDIUM;
    return RISK_LEVELS.LOW;
  }

  const normalized = String(levelOrScore || '').toUpperCase().trim();
  return RISK_LEVELS[normalized] || RISK_LEVELS.LOW;
}

/**
 * Gets Tailwind styling classes for a risk level badge
 * @param {string} level - Risk level key
 * @returns {string} Tailwind CSS class string
 */
export function getRiskBadgeStyle(level) {
  return getRiskMetadata(level).badgeClass;
}
