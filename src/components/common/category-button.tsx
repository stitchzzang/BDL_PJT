import {
  CpuChipIcon,
  CurrencyDollarIcon,
  EyeDropperIcon,
  PaintBrushIcon,
  QueueListIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { BeakerIcon, CakeIcon, TruckIcon, TvIcon } from 'lucide-react';
import React from 'react';

export interface categoryData {
  name: string;
  icon: React.ElementType;
}

export const CategoryButton = () => {
  const categoryList: categoryData[] = [
    { name: '자동차', icon: typeof TruckIcon === 'function' ? TruckIcon : () => <></> },
    { name: '화장품', icon: typeof EyeDropperIcon === 'function' ? EyeDropperIcon : () => <></> },
    { name: '방위', icon: typeof RocketLaunchIcon === 'function' ? RocketLaunchIcon : () => <></> },
    { name: '반도체', icon: typeof CpuChipIcon === 'function' ? CpuChipIcon : () => <></> },
    { name: '바이오', icon: typeof BeakerIcon === 'function' ? BeakerIcon : () => <></> },
    { name: 'IT', icon: typeof TvIcon === 'function' ? TvIcon : () => <></> },
    { name: '금속', icon: typeof QueueListIcon === 'function' ? QueueListIcon : () => <></> },
    { name: '엔터', icon: typeof PaintBrushIcon === 'function' ? PaintBrushIcon : () => <></> },
    {
      name: '금융',
      icon: typeof CurrencyDollarIcon === 'function' ? CurrencyDollarIcon : () => <></>,
    },
    { name: '음식', icon: typeof CakeIcon === 'function' ? CakeIcon : () => <></> },
  ];

  return (
    <div>
      <div></div>
    </div>
  );
};
