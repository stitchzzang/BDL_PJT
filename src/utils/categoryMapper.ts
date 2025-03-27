import {
  BeakerIcon,
  CakeIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  EyeDropperIcon,
  PaintBrushIcon,
  QueueListIcon,
  RocketLaunchIcon,
  Squares2X2Icon,
  TruckIcon,
  TvIcon,
} from '@heroicons/react/24/solid';
import { type ComponentType } from 'react';

/**
 * 애플리케이션에서 사용되는 카테고리 이름들의 유니온 타입
 * 각 카테고리는 특정 산업 분야를 나타냄
 */
export type CategoryName =
  | '전체' // 전체 회사
  | '자동차' // 자동차 산업
  | '화장품' // 화장품 산업
  | '방위' // 방위 산업
  | '반도체' // 반도체 산업
  | '바이오' // 바이오/제약 산업
  | 'IT' // IT/기술 산업
  | '금속' // 금속/재료 산업
  | '엔터' // 엔터테인먼트 산업
  | '금융' // 금융 산업
  | '음식'; // 식품/음식 산업

/**
 * 카테고리 이름과 해당 아이콘 컴포넌트를 매핑하는 객체
 * @type {Record<CategoryName, ComponentType>} 각 카테고리 이름을 키로, 해당 아이콘 컴포넌트를 값으로 가짐
 */
const categoryIconMap: Record<CategoryName, ComponentType> = {
  전체: Squares2X2Icon,
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

/**
 * 카테고리 이름에 해당하는 아이콘 컴포넌트를 반환하는 함수
 *
 * @param {CategoryName} categoryName - 아이콘을 가져올 카테고리 이름
 * @returns {ComponentType} 해당 카테고리의 아이콘 컴포넌트
 *
 * @example
 * // 자동차 카테고리의 아이콘 가져오기
 * const AutoIcon = getCategoryIcon('자동차');
 * // JSX에서 사용
 * <AutoIcon className="w-6 h-6" />
 */
export const getCategoryIcon = (categoryName: CategoryName): ComponentType => {
  return categoryIconMap[categoryName];
};

/**
 * 모든 카테고리 이름의 배열을 반환하는 함수
 *
 * @returns {CategoryName[]} 모든 카테고리 이름이 담긴 배열
 *
 * @example
 * // 모든 카테고리 목록 가져오기
 * const categories = getCategoryNames();
 * // 카테고리 목록을 순회하며 사용
 * categories.map(category => (
 *   <div key={category}>{category}</div>
 * ))
 */
export const getCategoryNames = (): CategoryName[] => {
  return Object.keys(categoryIconMap) as CategoryName[];
};
