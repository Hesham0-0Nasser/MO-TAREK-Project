import { useEffect, useState } from 'react';

export type AsyncState<T> = { loading: boolean; data?: T; error?: string };

/** Runs an async API call and exposes loading / data / error. Re-runs when `deps` change. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    fn().then(
      (data) => alive && setState({ loading: false, data }),
      (e: { code?: string; message?: string }) => alive && setState({ loading: false, error: e?.code ?? 'error' }),
    );
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, retry: () => setTick((n) => n + 1) };
}
