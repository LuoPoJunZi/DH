import { useEffect, useState } from 'react';
import { getTimeZoneCity, getVisitorCity } from '../utils/visitorLocation';

export function useVisitorCity(refreshKey = 0) {
  const [state, setState] = useState<{ key: number; city: string | null }>({
    key: -1,
    city: null,
  });
  const isLoading = state.key !== refreshKey;

  useEffect(() => {
    const controller = new AbortController();
    void getVisitorCity(refreshKey > 0, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setState({ key: refreshKey, city: result ?? getTimeZoneCity() });
    });
    return () => controller.abort();
  }, [refreshKey]);

  return { city: state.city, isLoading };
}
