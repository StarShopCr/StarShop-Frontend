export const AUCTION_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Substituir pelo endereço real
export const AUCTION_ABI = [
  // ABI simplificada para representação do serviço
  "function createAuction(tuple(uint256 price, uint256 duration, address seller)) external returns (uint256)",
  "function getAuction(uint256 auctionId) external view returns (uint256 price, uint256 duration, address seller, uint256 endTime, bool active)",
  "function updateAuction(uint256 auctionId, uint256 newPrice) external",
  "function cancelAuction(uint256 auctionId) external",
  "function placeBid(uint256 auctionId) external payable",
  "function withdrawBid(uint256 auctionId) external",
  "function getHighestBid(uint256 auctionId) external view returns (address bidder, uint256 amount)",
  "function endAuction(uint256 auctionId) external",
  "function distributeAuction(uint256 auctionId) external",
  "function claimWinnings(uint256 auctionId) external",
  "function getDistributionStatus(uint256 auctionId) external view returns (bool processed)"
];

export const AUCTION_ERROR_CODES = {
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  AUCTION_NOT_ACTIVE: 'AUCTION_NOT_ACTIVE',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  AUCTION_EXPIRED: 'AUCTION_EXPIRED'
};
