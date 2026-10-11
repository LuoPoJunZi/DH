import { useEffect, useState } from 'react';
import { getTimeZoneCity, getVisitorCity } from '../utils/visitorLocation';

export function useVisitorCity(refreshKey = 0) {
  const [city, setCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void getVisitorCity(refreshKey > 0).then((result) => {
      if (active) {
        setCity(result ?? getTimeZoneCity());
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { city, isLoading };
}
