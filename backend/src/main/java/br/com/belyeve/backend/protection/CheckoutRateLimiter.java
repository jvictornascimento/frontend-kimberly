package br.com.belyeve.backend.protection;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Shared order/payment quota for the single backend instance. Never evicts active limits. */
@Component
public class CheckoutRateLimiter {
    static final int MAX_ATTEMPTS = 5;
    static final int MAX_IPS = 10_000;
    static final Duration WINDOW = Duration.ofSeconds(120);
    private final Clock clock;
    private final Map<String, Bucket> buckets = new HashMap<>();
    private long generation;

    public CheckoutRateLimiter() { this(Clock.systemUTC()); }
    CheckoutRateLimiter(Clock clock) { this.clock = clock; }

    public record Admission(String ip, long generation, long retryAfterSeconds) {
        public boolean allowed() { return retryAfterSeconds == 0; }
    }
    private static class Bucket {
        final long generation;
        Instant expires;
        int attempts;
        int failures;
        Bucket(long generation, Instant expires) { this.generation = generation; this.expires = expires; }
    }

    public synchronized Admission acquire(String ip) {
        Instant now = clock.instant();
        Bucket bucket = buckets.get(ip);
        if (bucket != null && !now.isBefore(bucket.expires)) {
            buckets.remove(ip);
            bucket = null;
        }
        if (bucket == null) {
            if (buckets.size() >= MAX_IPS) {
                buckets.values().removeIf(b -> !now.isBefore(b.expires));
                if (buckets.size() >= MAX_IPS) return new Admission(ip, -1, 120);
            }
            bucket = new Bucket(++generation, now.plus(WINDOW));
            buckets.put(ip, bucket);
        }
        if (bucket.attempts >= MAX_ATTEMPTS) {
            long millis = Duration.between(now, bucket.expires).toMillis();
            return new Admission(ip, bucket.generation, Math.max(1, (millis + 999) / 1000));
        }
        bucket.attempts++;
        return new Admission(ip, bucket.generation, 0);
    }

    public synchronized void complete(Admission admission, boolean failed) {
        if (!admission.allowed() || !failed) return;
        Bucket bucket = buckets.get(admission.ip());
        if (bucket == null || bucket.generation != admission.generation()) return;
        if (++bucket.failures == MAX_ATTEMPTS) bucket.expires = clock.instant().plus(WINDOW);
    }
}
