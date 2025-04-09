import { Squares2X2Icon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import { useGetCompanyBasicInfo, useGetCompanyProfile } from '@/api/company.api';
import { useInitSession } from '@/api/tutorial.api';
import { StockTutorialHelp } from '@/components/stock-tutorial/stock-tutorial-help';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryName, getCategoryIcon } from '@/utils/categoryMapper';
import { addCommasToThousand } from '@/utils/numberFormatter';

export interface StockInfoProps {
  companyId: number;
  isTutorialStarted?: boolean;
  onTutorialStart?: () => void;
  onMoveToNextTurn?: () => void;
  currentTurn?: number;
  isCurrentTurnCompleted?: boolean;
  buttonText?: string;
  latestPrice?: number;
  showButtonInInfoSection?: boolean;
  isLoading?: boolean;
  onHelpClick?: () => void;
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
  음식료: '음식료',
  금속: '금속',
  바이오: '바이오',
};

export const StockTutorialInfo = ({
  companyId,
  isTutorialStarted = false,
  onTutorialStart,
  onMoveToNextTurn,
  currentTurn = 0,
  isCurrentTurnCompleted = false,
  buttonText = '튜토리얼 시작하기',
  latestPrice,
  showButtonInInfoSection = false,
  isLoading = false,
  onHelpClick,
}: StockInfoProps) => {
  const [initialPrice, setInitialPrice] = useState<number>(0);
  const [normalizedCategories, setNormalizedCategories] = useState<CategoryName[]>(['전체']);
  const initSessionMutation = useInitSession();

  // 오늘부터 1년 전까지의 날짜 범위 계산
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // 변경: useGetCompanyProfile 훅 사용
  const { data: companyInfo, isLoading: isCompanyInfoLoading } = useGetCompanyProfile(
    String(companyId),
  );
  // 추가: useGetCompanyBasicInfo 훅을 사용하여 전일종가 정보 가져오기
  const { data: companyBasicInfo, isLoading: isCompanyBasicInfoLoading } = useGetCompanyBasicInfo(
    String(companyId),
  );

  // 모든 데이터 로딩 상태 통합
  const isDataLoading = isLoading || isCompanyInfoLoading || isCompanyBasicInfoLoading;

  // 현재 가격 정보를 가져오기 위한 API 호출 - 튜토리얼 시작 전에만 사용됨
  useEffect(() => {
    // 기존 API 호출이 필요 없는 경우 초기 가격을 전일종가로 설정
    if (companyBasicInfo && companyBasicInfo.previousClosePrice) {
      setInitialPrice(companyBasicInfo.previousClosePrice);
    }
  }, [companyBasicInfo]);

  // 렌더링에 사용할 현재 가격 결정
  // 튜토리얼 시작 전: 전일종가 사용
  // 튜토리얼 시작 후: props로 전달받은 턴별 최신 가격
  const displayPrice = isTutorialStarted
    ? latestPrice !== undefined && latestPrice !== null && latestPrice > 0
      ? latestPrice
      : initialPrice
    : companyBasicInfo?.previousClosePrice || initialPrice;

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

  // 버튼 클릭 처리 함수 수정
  const handleButtonClick = () => {
    if (!isTutorialStarted) {
      // 튜토리얼이 시작되지 않은 경우 시작
      handleTutorialStart();
    } else if (isCurrentTurnCompleted) {
      // 현재 턴이 완료된 경우 다음 턴으로 이동
      onMoveToNextTurn?.();
    }
  };

  // 버튼 텍스트 결정 로직 (원래 코드 유지)
  const buttonTextContent =
    buttonText ||
    (isTutorialStarted
      ? currentTurn === 4
        ? '튜토리얼 완료'
        : currentTurn > 0
          ? '다음 턴으로'
          : '튜토리얼 진행중'
      : initSessionMutation.isPending
        ? '초기화 중...'
        : '튜토리얼 시작하기');

  if (isDataLoading) {
    return (
      <div className="flex animate-fadeIn items-center">
        <div className="flex w-full items-start gap-[20px] sm:items-center">
          <div className="flex w-full items-center gap-3">
            <Skeleton
              className="h-[50px] w-[50px] rounded-xl"
              style={{ backgroundColor: '#0D192B' }}
            />
            <div className="flex w-full flex-col">
              <div className="mb-1 flex items-center gap-2">
                <Skeleton className="h-6 w-[120px]" style={{ backgroundColor: '#0D192B' }} />
                <Skeleton className="h-5 w-[80px]" style={{ backgroundColor: '#0D192B' }} />
              </div>
              <div className="flex w-full flex-col items-start justify-start gap-[18px] sm:flex-row sm:items-center sm:justify-between">
                <div className="ite flex flex-col gap-1 sm:flex-row">
                  <div className="flex flex-col items-center gap-2 text-[14px] sm:flex-row">
                    <Skeleton className="h-8 w-[150px]" style={{ backgroundColor: '#0D192B' }} />
                  </div>
                  <div className="ml-4 flex flex-wrap items-center justify-center gap-[15px] rounded-lg border border-border-color border-opacity-20 bg-modal-background-color px-3 py-1">
                    <Skeleton className="h-7 w-[120px]" style={{ backgroundColor: '#0D192B' }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {showButtonInInfoSection && (
                    <Skeleton
                      className="h-[45px] w-[225px]"
                      style={{ backgroundColor: '#0D192B' }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-fadeIn items-center">
      <div className="flex w-full items-start gap-[20px] sm:items-center">
        <div className="flex w-full items-center gap-3">
          <div className="max-h-[50px] max-w-[50px] overflow-hidden rounded-xl">
            {companyInfo?.companyImage ? (
              <img
                src={companyInfo.companyImage}
                alt={`${companyInfo.companyName || '회사'}-로고`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Skeleton className="h-[50px] w-[50px]" style={{ backgroundColor: '#0D192B' }} />
            )}
          </div>
          <div className="flex w-full flex-col">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-[16px] font-medium text-white">
                {companyInfo?.companyName || '회사명'}
              </h3>
              <p className="text-[14px] font-light text-border-color">
                {companyInfo?.companyCode || '회사코드'}
              </p>
            </div>
            <div className="flex w-full flex-col items-start justify-start gap-[17px] sm:flex-row sm:items-center sm:justify-between">
              <div className="ite flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-col items-center gap-2 text-[14px] sm:flex-row">
                  <h3 className="text-[22px] font-medium text-white">
                    {addCommasToThousand(displayPrice || 0)}원
                  </h3>
                  {!isTutorialStarted && (
                    <div className="ml-2 flex justify-center gap-2 rounded-lg bg-[#2A2A3C] px-2 py-1">
                      <p className="text-border-color">전일종가</p>
                    </div>
                  )}
                  {isTutorialStarted && currentTurn > 0 && (
                    <div className="ml-2 flex justify-center gap-2 rounded-lg bg-[#2A2A3C] px-2 py-1">
                      <p className="text-border-color">{currentTurn}단계 현재가</p>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-wrap items-center justify-center gap-[15px] rounded-lg border border-border-color border-opacity-20 bg-modal-background-color px-3 py-1">
                  {normalizedCategories.map((categoryName, index) => (
                    <div
                      key={`${categoryName}-${index}`}
                      className="flex h-7 min-h-[25px] min-w-[25px] items-center justify-center gap-1"
                    >
                      <div className="h-4 w-4">{renderCategoryIcon(categoryName)}</div>
                      <p className="ml-1 text-[13px] text-border-color">{categoryName}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {showButtonInInfoSection && (
                  <Button
                    className="max-h-[45px] max-w-[225px]"
                    variant={'green'}
                    size={'lg'}
                    onClick={handleButtonClick}
                    disabled={
                      (isTutorialStarted && !isCurrentTurnCompleted) ||
                      initSessionMutation.isPending ||
                      !companyInfo
                    }
                  >
                    {buttonTextContent}
                  </Button>
                )}
                <StockTutorialHelp onClick={onHelpClick} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
