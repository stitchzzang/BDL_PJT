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
  icon: React.ComponentType; // ComponentType으로 변경
}

export const CategoryButton = () => {
  const categoryList: categoryData[] = [
    { name: '자동차', icon: TruckIcon },
    { name: '화장품', icon: EyeDropperIcon },
    { name: '방위', icon: RocketLaunchIcon },
    { name: '반도체', icon: CpuChipIcon },
    { name: '바이오', icon: BeakerIcon },
    { name: 'IT', icon: TvIcon },
    { name: '금속', icon: QueueListIcon },
    { name: '엔터', icon: PaintBrushIcon },
    { name: '금융', icon: CurrencyDollarIcon },
    { name: '음식', icon: CakeIcon },
  ];

  return (
    <div>
      <div>
        {categoryList.map((data, index) => {
          const IconComponent = data.icon;
          return (
            <div key={index}>
              <IconComponent /> {/* 이제 정상적으로 렌더링됨 */}
              {data.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};
