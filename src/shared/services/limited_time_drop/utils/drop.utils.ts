export const calculateTimeRemaining = (endTime: number): number => {
  const now = Date.now();
  const diff = endTime - now;
  return diff > 0 ? diff : 0;
};

export const formatDropTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const checkTimestampRange = (startTime: number, endTime: number): boolean => {
  const now = Date.now();
  return now >= startTime && now <= endTime;
};
