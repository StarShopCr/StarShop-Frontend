export interface VoteData {
  productId: string | number;
  user: string;
  vote: number;
}

export interface VotingResults {
  totalScore: number;
  voteCount: number;
  averageScore: number;
}

export interface VotingStats {
  totalVotes: number;
  averageScore: number;
}

export interface UserVoteHistory {
  productId: string;
  vote: number;
}
