export const VOTING_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Substituir pelo endereço real
export const VOTING_ABI = [
  'function voteForProduct(uint256 productId, int256 vote) external',
  'function updateVote(uint256 productId, int256 newVote) external',
  'function removeVote(uint256 productId) external',
  'function getVote(uint256 productId, address user) external view returns (int256)',
  'function getVotingResults(uint256 productId) external view returns (int256 totalScore, uint256 voteCount)',
  'function getProductRanking(uint256 productId) external view returns (uint256 rank)',
  'function getTopProducts(uint256 limit, string category) external view returns (uint256[] productIds)',
  'function getVotingPower(address user) external view returns (uint256)',
  'function getVotingStats(uint256 productId) external view returns (uint256 totalVotes, int256 averageScore)',
  'function getUserVotingHistory(address user) external view returns (uint256[] productIds, int256[] votes)'
];

export const VOTING_ERROR_CODES = {
  INSUFFICIENT_POWER: 'INSUFFICIENT_VOTING_POWER',
  ALREADY_VOTED: 'ALREADY_VOTED',
  INVALID_VOTE_VALUE: 'INVALID_VOTE_VALUE',
  CONTRACT_ERROR: 'CONTRACT_INTERACTION_FAILED'
};
