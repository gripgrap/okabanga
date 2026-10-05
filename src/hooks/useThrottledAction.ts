/**
 * ==============================================================================
 * useThrottledAction Hook
 * ==============================================================================
 * 연속 클릭으로 인한 API Rate Limit(요청 한도 초과) 및 중복 트랜잭션을 방지하는
 * 요청 스로틀링(Throttle) & 쿨다운 타이머 훅.
 * ==============================================================================
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseThrottledActionOptions {
  cooldownSeconds?: number;
  onBlocked?: (remainingSeconds: number) => void;
}

export function useThrottledAction({
  cooldownSeconds = 3,
  onBlocked,
}: UseThrottledActionOptions = {}) {
  const [cooldownLeft, setCooldownLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const trigger = useCallback(
    (action: () => void) => {
      if (cooldownLeft > 0) {
        if (onBlocked) {
          onBlocked(cooldownLeft);
        }
        return false;
      }

      // Execute primary action
      action();

      // Start countdown
      setCooldownLeft(cooldownSeconds);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCooldownLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return true;
    },
    [cooldownLeft, cooldownSeconds, onBlocked]
  );

  return {
    isCooldown: cooldownLeft > 0,
    cooldownLeft,
    trigger,
  };
}
