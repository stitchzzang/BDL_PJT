import { Squares2X2Icon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { _ky } from '@/api/instance';
import {
  useGetEndPointId,
  useGetStartPointId,
  useGetTop3Points,
  useInitSession,
} from '@/api/tutorial.api';
import { ApiResponse } from '@/api/types/common';
import TestImage from '@/assets/test/stock-test.png';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { CategoryName, getCategoryIcon } from '@/utils/categoryMapper';
import { addCommasToThousand } from '@/utils/numberFormatter';

// API 응답 형식에 맞게 타입 정의
interface CompanyProfileResponse {
  companyImage: string;
  companyName: string;
  categories: string[];
}

// 변곡점 데이터 타입 정의
interface InflectionPoint {
  stockCandleId: number;
  date: string;
}

// 주가 데이터 타입 정의
interface StockCandleData {
  stockCandleId: number;
  companyId: string;
  openPrice: number;
  openPricePercent: number;
  highPrice: number;
  highPricePercent: number;
  lowPrice: number;
  lowPricePercent: number;
  closePrice: number;
  closePricePercent: number;
  accumulatedVolume: number;
  accumulatedTradeAmount: number;
  tradingDate: string;
  periodType: number;
  fiveAverage: number;
  twentyAverage: number;
}

export interface StockInfoProps {
  companyId: number;
  isTutorialStarted?: boolean;
  onTutorialStart?: () => void;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// 카테고리 정규화 매핑 (서버 이름 -> 프론트엔드 카테고리)
const CATEGORY_MAPPING: Record<string, CategoryName> = {
  전체: '전체',
  반도체: '반도체',
  자동차: '자동차',
  IT: 'IT',
  금융: '금융',
  엔터: '엔터',
  엔터테인먼트: '엔터',
  방위: '방위',
  방산: '방위',
  화장품: '화장품',
  음식: '음식',
  음식료: '음식',
  금속: '금속',
  바이오: '바이오',
};

export const StockTutorialInfo = ({
  companyId,
  isTutorialStarted = false,
  onTutorialStart,
  dateRange,
}: StockInfoProps) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [normalizedCategories, setNormalizedCategories] = useState<CategoryName[]>(['전체']);
  const [inflectionPoints, setInflectionPoints] = useState<InflectionPoint[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number>(0);
  const _authData = useAuthStore();
  const initSessionMutation = useInitSession();

  // 1년전 시작 일봉 ID와 최근 일봉 ID 가져오기
  const { data: startPointData } = useGetStartPointId(companyId);
  const { data: endPointData } = useGetEndPointId(companyId);
  const { data: top3PointsData } = useGetTop3Points(companyId);

  // 회사 정보 가져오기
  const { data: companyInfo } = useQuery<CompanyProfileResponse>({
    queryKey: ['company', companyId, 'profile'],
    queryFn: async () => {
      try {
        const response = await _ky.get(`company/${companyId}`);
        return response.json<ApiResponse<CompanyProfileResponse>>().then((res) => res.result);
      } catch {
        // 기본 데이터 반환
        return {
          companyImage: TestImage,
          companyName: `회사 ${companyId}`,
          categories: ['전체'],
        } as CompanyProfileResponse;
      }
    },
    enabled: !!companyId,
  });

  // API에서 가져온 TOP3 변곡점 데이터를 InflectionPoint로 변환
  useEffect(() => {
    if (top3PointsData?.result?.PointResponseList) {
      const points = top3PointsData.result.PointResponseList;
      const convertedPoints: InflectionPoint[] = points.map((point) => ({
        stockCandleId: point.stockCandleId,
        date: new Date(point.pointId).toLocaleDateString(), // pointId를 날짜로 가정. 실제로는 API에서 제공하는 날짜 필드 사용
      }));
      setInflectionPoints(convertedPoints);
    }
  }, [top3PointsData, companyId]);

  // 현재 가격 정보를 가져오기 위한 API 호출
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        if (!startPointData || !endPointData) {
          return;
        }

        // 선택된 세그먼트에 따라 시작점과 끝점 결정
        let startId: number;
        let endId: number;
        const startPointId = startPointData.result;
        const endPointId = endPointData.result;
        const points = top3PointsData?.result?.PointResponseList || [];

        switch (selectedSegment) {
          case 0: // 첫 번째 구간: 시작 지점 ~ 변곡점 1
            startId = startPointId;
            endId = points.length > 0 ? points[0].stockCandleId : endPointId;
            break;
          case 1: // 두 번째 구간: 변곡점 1 ~ 변곡점 2
            startId = points.length > 0 ? points[0].stockCandleId : startPointId;
            endId = points.length > 1 ? points[1].stockCandleId : endPointId;
            break;
          case 2: // 세 번째 구간: 변곡점 2 ~ 변곡점 3
            startId = points.length > 1 ? points[1].stockCandleId : startPointId;
            endId = points.length > 2 ? points[2].stockCandleId : endPointId;
            break;
          case 3: // 네 번째 구간: 변곡점 3 ~ 최근 지점
            startId = points.length > 2 ? points[2].stockCandleId : startPointId;
            endId = endPointId;
            break;
          default:
            startId = startPointId;
            endId = endPointId;
        }

        // 시작점이 끝점보다 크면 두 값을 swap
        if (startId > endId) {
          [startId, endId] = [endId, startId];
        }

        // 선택된 구간에 따라 가격 데이터 조회
        const response = await _ky
          .get(
            `stocks/${companyId}/tutorial?startStockCandleId=${startId}&endStockCandleId=${endId}`,
          )
          .json<ApiResponse<{ data: StockCandleData[] }>>();

        // 데이터 배열에서 가장 최신 값(마지막 값)의 closePrice 가져오기
        const latestData = response.result.data[response.result.data.length - 1];
        setCurrentPrice(latestData.closePrice);
      } catch {
        // 오류 발생 시 기본 가격 설정 (예: 50000원)
        setCurrentPrice(50000);
      }
    };

    if (companyId) {
      fetchPrice();
    }
  }, [companyId, top3PointsData, selectedSegment, startPointData, endPointData]);

  // 회사 카테고리 정규화 처리
  useEffect(() => {
    let categories: CategoryName[] = ['전체'];

    if (companyInfo?.categories && companyInfo.categories.length > 0) {
      // 서버로부터 받은 카테고리를 정규화
      const normalized = companyInfo.categories
        .map((cat) => {
          // 원본 카테고리명을 정규화된 이름으로 변환 (매핑 테이블 활용)
          return CATEGORY_MAPPING[cat] || null;
        })
        .filter((cat): cat is CategoryName => cat !== null);

      if (normalized.length > 0) {
        categories = normalized;
      }
    }

    // 중복 제거
    const uniqueCategories = Array.from(new Set(categories));
    setNormalizedCategories(uniqueCategories);
  }, [companyInfo]); // companyInfo가 변경될 때만 실행

  // 카테고리 아이콘 렌더링 함수
  const renderCategoryIcon = (categoryName: CategoryName) => {
    try {
      const IconComponent = getCategoryIcon(categoryName);
      return <IconComponent />;
    } catch {
      return <Squares2X2Icon />;
    }
  };

  const handleTutorialStart = async () => {
    try {
      const memberId = 1;

      await initSessionMutation.mutateAsync({
        memberId,
        companyId,
      });

      if (onTutorialStart) {
        onTutorialStart();
      }
    } catch {
      // 오류 처리
    }
  };

  // 구간 선택 버튼 핸들러
  const handleSegmentChange = (segmentIndex: number) => {
    setSelectedSegment(segmentIndex);
  };

  return (
    <div>
      <div className="flex items-center">
        <div className="flex w-full items-start gap-[20px] sm:items-center">
          <div className="max-h-[70px] max-w-[70px] overflow-hidden rounded-xl">
            <img
              src={companyInfo?.companyImage || TestImage}
              alt={`${companyInfo?.companyName || '회사'}-로고`}
            />
          </div>
          <div className="flex w-full flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-[20px] font-medium text-white">
                {companyInfo?.companyName || '회사명'}
              </h3>
            </div>

            <div className="flex flex-col gap-[18px] sm:flex-row">
              <h3 className="text-[30px] font-medium text-white">
                {addCommasToThousand(currentPrice || 0)}원
              </h3>
              <div className="flex flex-wrap gap-3">
                {normalizedCategories.map((categoryName, index) => (
                  <div
                    key={`${categoryName}-${index}`}
                    className="flex items-center justify-center gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]"
                  >
                    <div className="min-h-[25px] min-w-[25px]">
                      {renderCategoryIcon(categoryName)}
                    </div>
                    <p className="text-border-color">{categoryName}</p>
                  </div>
                ))}
              </div>
            </div>
            {inflectionPoints.length > 0 && (
              <div className="mt-2 flex gap-2">
                <Button
                  variant={selectedSegment === 0 ? 'default' : 'outline'}
                  onClick={() => handleSegmentChange(0)}
                  size="sm"
                >
                  구간 1
                </Button>
                <Button
                  variant={selectedSegment === 1 ? 'default' : 'outline'}
                  onClick={() => handleSegmentChange(1)}
                  size="sm"
                >
                  구간 2
                </Button>
                <Button
                  variant={selectedSegment === 2 ? 'default' : 'outline'}
                  onClick={() => handleSegmentChange(2)}
                  size="sm"
                >
                  구간 3
                </Button>
                <Button
                  variant={selectedSegment === 3 ? 'default' : 'outline'}
                  onClick={() => handleSegmentChange(3)}
                  size="sm"
                >
                  구간 4
                </Button>
              </div>
            )}
            <div className="mt-2">
              <Button
                className="max-w-[225px]"
                variant={'green'}
                size={'lg'}
                onClick={handleTutorialStart}
                disabled={isTutorialStarted || initSessionMutation.isPending}
              >
                {isTutorialStarted
                  ? '튜토리얼 진행중'
                  : initSessionMutation.isPending
                    ? '초기화 중...'
                    : '튜토리얼 시작하기'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
