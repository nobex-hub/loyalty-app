const TIERS = {
  BRONZE:   { threshold: 0,    multiplier: 1,    label: 'Bronze',   next: 'SILVER' },
  SILVER:   { threshold: 500,  multiplier: 1.25, label: 'Silver',   next: 'GOLD' },
  GOLD:     { threshold: 2000, multiplier: 1.5,  label: 'Gold',     next: 'PLATINUM' },
  PLATINUM: { threshold: 5000, multiplier: 2,    label: 'Platinum', next: null },
};

const calculateTier = (totalPointsEarned) => {
  if (totalPointsEarned >= TIERS.PLATINUM.threshold) return 'PLATINUM';
  if (totalPointsEarned >= TIERS.GOLD.threshold) return 'GOLD';
  if (totalPointsEarned >= TIERS.SILVER.threshold) return 'SILVER';
  return 'BRONZE';
};

const getTierMultiplier = (tier) => {
  return TIERS[tier]?.multiplier || 1;
};

const getTierProgress = (totalPointsEarned) => {
  const currentTier = calculateTier(totalPointsEarned);
  const tierInfo = TIERS[currentTier];
  const nextTierName = tierInfo.next;

  if (!nextTierName) {
    return {
      currentTier,
      currentTierLabel: tierInfo.label,
      multiplier: tierInfo.multiplier,
      nextTier: null,
      nextTierLabel: null,
      progress: 100,
      pointsNeeded: 0,
      pointsInCurrentTier: totalPointsEarned - tierInfo.threshold,
    };
  }

  const nextTier = TIERS[nextTierName];
  const rangeSize = nextTier.threshold - tierInfo.threshold;
  const pointsInRange = totalPointsEarned - tierInfo.threshold;
  const progress = Math.min(Math.round((pointsInRange / rangeSize) * 100), 100);

  return {
    currentTier,
    currentTierLabel: tierInfo.label,
    multiplier: tierInfo.multiplier,
    nextTier: nextTierName,
    nextTierLabel: nextTier.label,
    progress,
    pointsNeeded: nextTier.threshold - totalPointsEarned,
    pointsInCurrentTier: pointsInRange,
  };
};

module.exports = { TIERS, calculateTier, getTierMultiplier, getTierProgress };
