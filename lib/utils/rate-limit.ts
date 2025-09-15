const requests = new Map<string, number[]>();

export const rateLimit = {
  limit: (identifier: string, maxRequests: number = 5, windowMs: number = 60000) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const requestTimestamps = requests.get(identifier) || [];
    const requestsInWindow = requestTimestamps.filter(timestamp => timestamp > windowStart);
    
    if (requestsInWindow.length >= maxRequests) {
      return { success: false };
    }
    
    requestsInWindow.push(now);
    requests.set(identifier, requestsInWindow);
    
    return { success: true };
  }
};