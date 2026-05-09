const requests = new Map<string, { count: number; reset: number }>();

// Cleanup expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of requests.entries()) {
    if (now > val.reset) requests.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requests.get(ip);

  if (!record || now > record.reset) {
    requests.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}
