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
import { type ComponentType } from 'react';

export type CategoryName =
  | '자동차'
  | '화장품'
  | '방위'
  | '반도체'
  | '바이오'
  | 'IT'
  | '금속'
  | '엔터'
  | '금융'
  | '음식';

const categoryIconMap: Record<CategoryName, ComponentType> = {
  자동차: TruckIcon,
  화장품: EyeDropperIcon,
  방위: RocketLaunchIcon,
  반도체: CpuChipIcon,
  바이오: BeakerIcon,
  IT: TvIcon,
  금속: QueueListIcon,
  엔터: PaintBrushIcon,
  금융: CurrencyDollarIcon,
  음식: CakeIcon,
};

export const getCategoryIcon = (categoryName: CategoryName): ComponentType => {
  return categoryIconMap[categoryName];
};

export const getCategoryNames = (): CategoryName[] => {
  return Object.keys(categoryIconMap) as CategoryName[];
};
