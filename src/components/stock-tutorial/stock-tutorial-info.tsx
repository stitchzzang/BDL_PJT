import { Squares2X2Icon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { _ky } from '@/api/instance';
import { useInitSession } from '@/api/tutorial.api';
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
}: StockInfoProps) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [normalizedCategories, setNormalizedCategories] = useState<CategoryName[]>(['전체']);
  const [inflectionPoints, setInflectionPoints] = useState<InflectionPoint[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number>(0);
  const authData = useAuthStore();
  const initSessionMutation = useInitSession();

  // 회사 정보 가져오기
  const { data: companyInfo } = useQuery<CompanyProfileResponse>({
    queryKey: ['company', companyId, 'profile'],
    queryFn: async () => {
      try {
        const response = await _ky.get(`company/${companyId}`);
        return response.json<ApiResponse<CompanyProfileResponse>>().then((res) => res.result);
      } catch (error) {
        console.error(`회사 정보 가져오기 실패 (CompanyID: ${companyId}):`, error);
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

  // 변곡점 정보 가져오기
  useEffect(() => {
    const fetchInflectionPoints = async () => {
      try {
        // 기존 API를 활용하여 데이터를 가져온 후 변곡점을 계산
        const response = await _ky
          .get(`stocks/${companyId}/tutorial?startStockCandleId=1&endStockCandleId=1000`)
          .json<ApiResponse<{ data: StockCandleData[] }>>();

        // 받아온 데이터에서 변곡점 계산 (예: 가격 변화가 큰 지점)
        const stockData = response.result.data;
        const calculatedPoints: InflectionPoint[] = [];

        if (stockData.length > 0) {
          // 전체 데이터를 5개 구간으로 나누어 각 구간의 중요 지점을 찾기
          const chunkSize = Math.floor(stockData.length / 5);

          for (let i = 1; i < 4; i++) {
            // TOP3 변곡점만 필요
            const startIndex = i * chunkSize;
            const endIndex = Math.min((i + 1) * chunkSize, stockData.length - 1);

            // 구간 내에서 가장 가격 변화가 큰 포인트 찾기
            let maxChangePoint = stockData[startIndex];
            let maxChange = 0;

            for (let j = startIndex; j < endIndex; j++) {
              const priceChange = Math.abs(
                stockData[j].closePrice - stockData[j > 0 ? j - 1 : 0].closePrice,
              );
              if (priceChange > maxChange) {
                maxChange = priceChange;
                maxChangePoint = stockData[j];
              }
            }

            calculatedPoints.push({
              stockCandleId: maxChangePoint.stockCandleId,
              date: maxChangePoint.tradingDate,
            });
          }
        }

        setInflectionPoints(calculatedPoints);
        console.log(`회사 ${companyId}의 변곡점 정보 계산 완료:`, calculatedPoints);
      } catch (error) {
        console.error(`회사 ${companyId}의 주가 데이터 가져오기 실패:`, error);
        setInflectionPoints([]);
      }
    };

    if (companyId) {
      fetchInflectionPoints();
    }
  }, [companyId]);

  // 현재 가격 정보를 가져오기 위한 API 호출
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        if (inflectionPoints.length === 0) {
          // 변곡점 정보가 없는 경우 기본 범위로 조회
          const response = await _ky
            .get(`stocks/${companyId}/tutorial?startStockCandleId=30&endStockCandleId=100`)
            .json<ApiResponse<{ data: StockCandleData[] }>>();

          const latestData = response.result.data[response.result.data.length - 1];
          setCurrentPrice(latestData.closePrice);
          return;
        }

        // 선택된 세그먼트에 따라 시작점과 끝점 결정
        let startId: number;
        let endId: number;

        // 기본 시작점과 끝점 (고정 값 대체)
        const initialPoint = 1; // 가장 초기 지점 (ID 1번으로 가정)
        const latestPoint = 1000; // 가장 최근 지점 (ID 1000번으로 가정)

        switch (selectedSegment) {
          case 0: // 첫 번째 구간: 초기 지점 ~ 변곡점 1
            startId = initialPoint;
            endId = inflectionPoints[0]?.stockCandleId || 100;
            break;
          case 1: // 두 번째 구간: 변곡점 1 ~ 변곡점 2
            startId = inflectionPoints[0]?.stockCandleId || 100;
            endId = inflectionPoints[1]?.stockCandleId || 200;
            break;
          case 2: // 세 번째 구간: 변곡점 2 ~ 변곡점 3
            startId = inflectionPoints[1]?.stockCandleId || 200;
            endId = inflectionPoints[2]?.stockCandleId || 300;
            break;
          case 3: // 네 번째 구간: 변곡점 3 ~ 최근 지점
            startId = inflectionPoints[2]?.stockCandleId || 300;
            endId = latestPoint;
            break;
          default:
            startId = initialPoint;
            endId = latestPoint;
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
        console.log(
          `회사 ${companyId}의 가격 정보 로드 성공 (구간 ${selectedSegment}):`,
          latestData.closePrice,
        );
      } catch (error) {
        console.error(`회사 ${companyId}의 튜토리얼 가격 정보 가져오기 실패:`, error);
        // 오류 발생 시 기본 가격 설정 (예: 50000원)
        setCurrentPrice(50000);
      }
    };

    if (companyId) {
      fetchPrice();
    }
  }, [companyId, inflectionPoints, selectedSegment]); // companyId, inflectionPoints, selectedSegment가 변경될 때 실행

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
    } catch (error) {
      console.error(`카테고리 아이콘 렌더링 오류: ${categoryName}`, error);
      return <Squares2X2Icon />;
    }
  };

  const handleTutorialStart = async () => {
    // 인증 체크 부분 임시 주석 처리
    // if (!authData.isLogin) {
    //   console.error('로그인이 필요합니다.');
    //   return;
    // }

    try {
      // 현재는 memberId를 1로 고정하여 테스트합니다.
      // 실제 환경에서는 사용자 ID를 가져와야 합니다.
      const memberId = 1;

      // 튜토리얼 세션 초기화 API 호출
      await initSessionMutation.mutateAsync({
        memberId,
        companyId,
      });

      // 초기화 성공 후 부모 컴포넌트에 알림
      if (onTutorialStart) {
        onTutorialStart();
      }
    } catch (error) {
      console.error('튜토리얼 초기화 실패:', error);
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
