// Implementação simples de rate limiting usando Map
export class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }>;
  private readonly maxAttempts: number;
  private readonly timeWindow: number;

  constructor(maxAttempts: number = 5, timeWindowInMinutes: number = 15) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindowInMinutes * 60 * 1000;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }

    // Resetar contagem se o tempo expirou
    if (now - attempt.firstAttempt > this.timeWindow) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }

    // Incrementar tentativas
    attempt.count++;
    this.attempts.set(key, attempt);

    // Verificar se excedeu o limite
    return attempt.count > this.maxAttempts;
  }

  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.maxAttempts;

    const remaining = this.maxAttempts - attempt.count;
    return remaining > 0 ? remaining : 0;
  }

  getTimeToReset(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;

    const timeElapsed = Date.now() - attempt.firstAttempt;
    const timeRemaining = this.timeWindow - timeElapsed;
    return timeRemaining > 0 ? timeRemaining : 0;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Instância singleton para uso em toda a aplicação
const globalRateLimiter = new RateLimiter();
export default globalRateLimiter;
