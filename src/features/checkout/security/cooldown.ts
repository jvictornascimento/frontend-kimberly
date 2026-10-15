let blockedUntil = 0;

export function retryAfterSeconds(value: string | null, now = Date.now()): number {
  if (!value) return 120;
  const seconds = /^\d+$/.test(value) ? Number(value) : (Date.parse(value) - now) / 1000;
  return Number.isFinite(seconds) ? Math.max(1, Math.min(3600, Math.ceil(seconds))) : 120;
}

export function startCooldown(seconds: number) {
  blockedUntil = Math.max(blockedUntil, Date.now() + seconds * 1000);
}
export function remainingCooldown() {
  return Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
}
