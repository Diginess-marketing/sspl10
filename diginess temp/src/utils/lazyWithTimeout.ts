import React, { lazy } from 'react';

/**
 * Wrap React.lazy with a timeout and optional retry to avoid infinite Suspense spinners
 * when a dynamic import hangs (e.g., due to SW cache or flaky network).
 */
export function lazyWithTimeout<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  timeoutMs: number = 15000,
  retries: number = 1,
): React.LazyExoticComponent<T> {
  const tryLoad = (attempt: number): Promise<{ default: T }> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const err: any = new Error('Module load timeout');
        err.code = 'LAZY_TIMEOUT';
        reject(err);
      }, timeoutMs);

      factory()
        .then((mod) => {
          clearTimeout(timer);
          resolve(mod);
        })
        .catch((err) => {
          clearTimeout(timer);
          if (attempt < retries) {
            // Small backoff before retry
            setTimeout(() => {
              tryLoad(attempt + 1).then(resolve).catch(reject);
            }, Math.min(1000 * (attempt + 1), 3000));
          } else {
            reject(err);
          }
        });
    });

  return lazy(() => tryLoad(0));
}
