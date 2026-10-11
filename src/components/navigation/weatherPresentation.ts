import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react';

interface WeatherPresentation {
  label: string;
  icon: LucideIcon;
}

export function weatherPresentation(code: number, isDay = true): WeatherPresentation {
  if (code === 0) return { label: isDay ? '晴朗' : '晴夜', icon: isDay ? Sun : Moon };
  if (code <= 2) return { label: '少云', icon: CloudSun };
  if (code === 3) return { label: '阴天', icon: Cloud };
  if (code === 45 || code === 48) return { label: '有雾', icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: '毛毛雨', icon: CloudDrizzle };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return { label: '有雨', icon: CloudRain };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { label: '有雪', icon: CloudSnow };
  if (code >= 95) return { label: '雷雨', icon: CloudLightning };
  return { label: '多云', icon: Cloud };
}
