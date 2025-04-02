import { Squares2X2Icon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import { useGetCompanyProfile } from '@/api/company.api';
import { _ky } from '@/api/instance';
import { useGetPointDate, useGetTop3Points, useInitSession } from '@/api/tutorial.api';
import { ApiResponse } from '@/api/types/common';
import { Point } from '@/api/types/tutorial';
import TestImage from '@/assets/test/stock-test.png';
import { StockTutorialHelp } from '@/components/stock-tutorial/stock-tutorial-help';
import { Button } from '@/components/ui/button';
// import { useAuthStore } from '@/store/useAuthStore';
import { CategoryName, getCategoryIcon } from '@/utils/categoryMapper';
import { addCommasToThousand } from '@/utils/numberFormatter';

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

// YYMMDD 형식의 날짜 생성 함수
const formatDateToYYMMDD = (date: Date): string => {
  const yy = date.getFullYear().toString().slice(2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

export const StockTutorialInfo = ({
  companyId,
  isTutorialStarted = false,
  onTutorialStart,
}: StockInfoProps) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [normalizedCategories, setNormalizedCategories] = useState<CategoryName[]>(['전체']);
  const [inflectionPoints, setInflectionPoints] = useState<InflectionPoint[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number>(0);
  // const _authData = useAuthStore();
  const initSessionMutation = useInitSession();

  // 오늘부터 1년 전까지의 날짜 범위 계산
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const startDate = formatDateToYYMMDD(oneYearAgo);
  const endDate = formatDateToYYMMDD(today);

  // 변곡점 TOP3 가져오기
  const { data: top3PointsData } = useGetTop3Points(companyId);

  // 변곡점 날짜 가져오기
  const pointStockCandleIds =
    top3PointsData?.result?.PointResponseList?.map((point: Point) => point.stockCandleId) || [];

  // 각 변곡점에 대한 날짜 정보 가져오기
  const point1DateQuery = useGetPointDate(pointStockCandleIds[0] || 0);
  const point2DateQuery = useGetPointDate(pointStockCandleIds[1] || 0);
  const point3DateQuery = useGetPointDate(pointStockCandleIds[2] || 0);

  // 변경: useGetCompanyProfile 훅 사용
  const { data: companyInfo } = useGetCompanyProfile(String(companyId));

  // API에서 가져온 TOP3 변곡점 데이터를 InflectionPoint로 변환
  useEffect(() => {
    if (
      top3PointsData?.result?.PointResponseList &&
      Array.isArray(top3PointsData.result.PointResponseList)
    ) {
      const points = top3PointsData.result.PointResponseList;
      const convertedPoints: InflectionPoint[] = [];

      // 각 변곡점에 대해 날짜 정보 추가
      if (points.length > 0 && point1DateQuery.data?.result) {
        convertedPoints.push({
          stockCandleId: points[0].stockCandleId,
          date: point1DateQuery.data.result,
        });
      }

      if (points.length > 1 && point2DateQuery.data?.result) {
        convertedPoints.push({
          stockCandleId: points[1].stockCandleId,
          date: point2DateQuery.data.result,
        });
      }

      if (points.length > 2 && point3DateQuery.data?.result) {
        convertedPoints.push({
          stockCandleId: points[2].stockCandleId,
          date: point3DateQuery.data.result,
        });
      }

      // 변경된 경우에만 상태 업데이트 (길이 비교 및 각 항목 비교)
      let hasChanged = convertedPoints.length !== inflectionPoints.length;

      // 길이가 같으면 각 항목 비교
      if (!hasChanged && convertedPoints.length > 0) {
        for (let i = 0; i < convertedPoints.length; i++) {
          if (
            convertedPoints[i].stockCandleId !== inflectionPoints[i]?.stockCandleId ||
            convertedPoints[i].date !== inflectionPoints[i]?.date
          ) {
            hasChanged = true;
            break;
          }
        }
      }

      // 변경된 경우만 상태 업데이트
      if (hasChanged) {
        setInflectionPoints(convertedPoints);
      }
    }
  }, [
    top3PointsData,
    point1DateQuery.data,
    point2DateQuery.data,
    point3DateQuery.data,
    inflectionPoints,
  ]);

  // 현재 가격 정보를 가져오기 위한 API 호출
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // 현재 선택된 세그먼트에 따라 날짜 범위 결정
        let segStartDate = startDate;
        let segEndDate = endDate;

        // 변곡점이 로드되었을 경우 구간별 날짜 설정
        if (inflectionPoints.length > 0) {
          switch (selectedSegment) {
            case 0: // 첫 번째 구간: 시작 지점 ~ 변곡점 1
              segStartDate = startDate;
              segEndDate = inflectionPoints[0]?.date || endDate;
              break;
            case 1: // 두 번째 구간: 변곡점 1 ~ 변곡점 2
              segStartDate = inflectionPoints[0]?.date || startDate;
              segEndDate = inflectionPoints[1]?.date || endDate;
              break;
            case 2: // 세 번째 구간: 변곡점 2 ~ 변곡점 3
              segStartDate = inflectionPoints[1]?.date || startDate;
              segEndDate = inflectionPoints[2]?.date || endDate;
              break;
            case 3: // 네 번째 구간: 변곡점 3 ~ 최근 지점
              segStartDate = inflectionPoints[2]?.date || startDate;
              segEndDate = endDate;
              break;
            default:
              segStartDate = startDate;
              segEndDate = endDate;
          }
        }

        // 선택된 구간에 따라 가격 데이터 조회
        const response = await _ky
          .get(`stocks/${companyId}/tutorial?startDate=${segStartDate}&endDate=${segEndDate}`)
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
  }, [companyId, inflectionPoints, selectedSegment, startDate, endDate]);

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

    // 현재 상태와 비교하여 변경된 경우에만 업데이트 (길이 및 항목 직접 비교)
    let hasChanged = uniqueCategories.length !== normalizedCategories.length;

    // 길이가 같다면 각 항목 비교
    if (!hasChanged) {
      for (let i = 0; i < uniqueCategories.length; i++) {
        if (uniqueCategories[i] !== normalizedCategories[i]) {
          hasChanged = true;
          break;
        }
      }
    }

    // 변경된 경우에만 상태 업데이트
    if (hasChanged) {
      setNormalizedCategories(uniqueCategories);
    }
  }, [companyInfo, normalizedCategories]); // companyInfo가 변경될 때만 실행

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
    <div className="flex items-center">
      <div className="flex w-full items-start gap-[20px] sm:items-center">
        <div className="max-h-[70px] max-w-[70px] overflow-hidden rounded-xl">
          <img
            src={companyInfo?.companyImage || TestImage}
            alt={`${companyInfo?.companyName || '회사'}-로고`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] font-medium text-white">
              {companyInfo?.companyName || '회사명'}
            </h3>
            <h3 className="text-[14px] font-light text-border-color">
              {companyInfo?.companyCode || '회사코드'}
            </h3>
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-[18px] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-[18px] sm:flex-row sm:items-center">
              <h3 className="text-[30px] font-medium text-white">
                {addCommasToThousand(currentPrice || 0)}원
              </h3>
              <div className="flex flex-wrap gap-2">
                {normalizedCategories.map((categoryName, index) => (
                  <div
                    key={`${categoryName}-${index}`}
                    className="flex items-center justify-center gap-2 rounded-lg bg-modal-background-color px-3 py-2"
                  >
                    <div className="h-5 w-5">{renderCategoryIcon(categoryName)}</div>
                    <p className="text-sm text-border-color">{categoryName}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {inflectionPoints.length > 0 && (
                <div className="flex gap-2">
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
              <div className="flex items-center gap-4">
                <StockTutorialHelp />
                <Button
                  className="max-h-[45px] w-[225px]"
                  variant={'green'}
                  size={'lg'}
                  onClick={handleTutorialStart}
                  disabled={isTutorialStarted || initSessionMutation.isPending || !companyInfo}
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
    </div>
  );
};
