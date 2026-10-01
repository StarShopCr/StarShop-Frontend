export const validateVoteRange = (vote: number, min: number = -5, max: number = 5): boolean => {
  return vote >= min && vote <= max;
};

export const formatRankingDisplay = (rank: number): string => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};
