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
  const authData = useAuthStore();
  const initSessionMutation = useInitSession();

  // 회사 정보 가져오기
  const { data: companyInfo } = useQuery<CompanyProfileResponse>({
    queryKey: ['company', companyId, 'profile'],
    queryFn: () =>
      _ky
        .get(`company/${companyId}`)
        .json<ApiResponse<CompanyProfileResponse>>()
        .then((res) => res.result),
    enabled: !!companyId,
  });

  // 현재 가격 정보를 가져오기 위한 API 호출을 추가
  useEffect(() => {
    // 기존 가격 정보를 임시 데이터로 설정 (실제로는 API에서 받아와야 함)
    const fetchPrice = async () => {
      try {
        // 실제 API 연동 시 아래 코드를 사용
        const response = await _ky.get(`stock/price/${companyId}`).json<ApiResponse<number>>();
        setCurrentPrice(response.result);
      } catch (error) {
        // console.error('가격 정보 가져오기 실패:', error); // Linter 오류 방지를 위해 주석 처리 또는 삭제
      }
    };

    if (companyId) {
      fetchPrice();
    }
  }, [companyId]); // companyId가 변경될 때만 실행

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
