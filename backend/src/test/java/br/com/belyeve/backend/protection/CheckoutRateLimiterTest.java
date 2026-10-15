package br.com.belyeve.backend.protection;

import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.ArrayList;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;

class CheckoutRateLimiterTest {
    static class TestClock extends Clock {
        Instant now = Instant.parse("2026-10-13T12:00:00Z");
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now; }
        void advance(long seconds) { now = now.plusSeconds(seconds); }
    }
    @Test void countsAllAttemptsAndStartsNewWindowAfterExpiry() {
        var clock = new TestClock(); var limiter = new CheckoutRateLimiter(clock);
        for (int i=0; i<5; i++) {
            var admission = limiter.acquire("one"); assertThat(admission.allowed()).isTrue();
            limiter.complete(admission, false);
        }
        assertThat(limiter.acquire("one").retryAfterSeconds()).isEqualTo(120);
        assertThat(limiter.acquire("two").allowed()).isTrue();
        clock.advance(119);
        assertThat(limiter.acquire("one").retryAfterSeconds()).isEqualTo(1);
        clock.advance(1); assertThat(limiter.acquire("one").allowed()).isTrue();
    }
    @Test void fiveFailuresStartFullCooldownWithoutExtendingRejectedRequests() {
        var clock = new TestClock(); var limiter = new CheckoutRateLimiter(clock);
        for (int i=0; i<5; i++) {
            var admission = limiter.acquire("one"); clock.advance(10); limiter.complete(admission, true);
        }
        assertThat(limiter.acquire("one").retryAfterSeconds()).isEqualTo(120);
        clock.advance(90);
        var rejected = limiter.acquire("one"); limiter.complete(rejected, true);
        assertThat(rejected.retryAfterSeconds()).isEqualTo(30);
        clock.advance(30); assertThat(limiter.acquire("one").allowed()).isTrue();
    }
    @Test void lateCompletionDoesNotBlockAnotherGeneration() {
        var clock = new TestClock(); var limiter = new CheckoutRateLimiter(clock);
        var old = new ArrayList<CheckoutRateLimiter.Admission>();
        for(int i=0; i<5; i++) old.add(limiter.acquire("one"));
        clock.advance(120); assertThat(limiter.acquire("one").allowed()).isTrue();
        old.forEach(a -> limiter.complete(a,true));
        assertThat(limiter.acquire("one").allowed()).isTrue();
    }
    @Test void concurrentlyAdmitsOnlyFiveRequests() throws Exception {
        var limiter = new CheckoutRateLimiter(new TestClock());
        try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = new ArrayList<Future<Boolean>>();
            for(int i=0;i<100;i++) futures.add(pool.submit(() -> limiter.acquire("same").allowed()));
            int accepted=0; for(var future:futures) if(future.get()) accepted++;
            assertThat(accepted).isEqualTo(5);
        }
    }
    @Test void capacityDoesNotEvictActiveLimitsAndExpiredEntriesAreReclaimed() {
        var clock=new TestClock(); var limiter=new CheckoutRateLimiter(clock);
        for(int i=0;i<CheckoutRateLimiter.MAX_IPS;i++) assertThat(limiter.acquire("ip"+i).allowed()).isTrue();
        assertThat(limiter.acquire("new").allowed()).isFalse();
        clock.advance(120); assertThat(limiter.acquire("new").allowed()).isTrue();
    }
}
