import {
  BeakerIcon,
  CakeIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  EyeDropperIcon,
  PaintBrushIcon,
  QueueListIcon,
  RocketLaunchIcon,
  TruckIcon,
  TvIcon,
} from '@heroicons/react/24/solid';
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
      <div className="grid max-w-[660px] grid-cols-5 gap-[10px]">
        {categoryList.map((data, index) => {
          const IconComponent = data.icon;
          return (
            <div
              className="flex items-center justify-center gap-2 rounded-xl bg-modal-background-color px-[14px] py-[12px]"
              key={index}
            >
              <div className="min-h-[25px] min-w-[25px]">
                <IconComponent /> {/* 이제 정상적으로 렌더링됨 */}
              </div>
              <p className="text-[16px] text-border-color">{data.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
