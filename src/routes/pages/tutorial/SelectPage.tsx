import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetCompaniesByCategory } from '@/api/category.api';
import { Company } from '@/api/types/category';
import { CategoryList } from '@/components/common/category-list';
import { CompanySelectButton } from '@/components/common/company-select-button';
import { ErrorScreen } from '@/components/common/error-screen';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { TutorialAnimation } from '@/components/common/tutorial-animation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const SelectPage = () => {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const categoryQuery = urlParams.get('category') || '0';
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryQuery);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    setSelectedCategory(categoryQuery);
  }, [categoryQuery]);

  // 어제 날짜와 1년 전 날짜 계산
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1); // 어제 날짜로 설정
  const oneYearAgo = new Date(currentDate); // 어제 날짜 복사
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1); // 어제로부터 1년 전

  // 날짜 포맷팅 (YYYY-MM-DD)
  const startDate = format(oneYearAgo, 'yyyy-MM-dd');
  const endDate = format(currentDate, 'yyyy-MM-dd');

  const {
    data: companies = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCompaniesByCategory(selectedCategory);

  const isLoadingData = isLoading || isFetching;
  const hasCompanies = companies && companies.length > 0;

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    // 여기에 확인 버튼 클릭 시 실행할 로직 추가
    // 예: 선택한 기업 정보와 함께 다음 페이지로 이동
    if (selectedCompany) {
      navigate(`/tutorial/simulate/${selectedCompany.companyId}`);
    }
    setIsDialogOpen(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="group flex flex-col items-center justify-center gap-3">
        <div className="flex w-full flex-col items-center justify-center">
          <h1 className="mb-[10px] text-[28px] font-bold">주식 튜토리얼</h1>
          <div className="flex w-full items-center justify-center gap-4 rounded-xl border border-border-color border-opacity-40 p-2 py-4 transition-all duration-300 group-hover:border-btn-blue-color">
            <div>
              <TutorialAnimation />
            </div>
            <div>
              <p className="text-[16px]">주식에 익숙하지 않은 당신을 위한 튜토리얼 환경입니다.</p>
              <p>
                <span className="text-[16px] font-bold text-btn-blue-color">안전한 환경에서</span>{' '}
                주식시장을 경험해보세요.
              </p>
              <p className="text-[16px]">
                먼저 경험하고 싶은{' '}
                <span className="text-[16px] font-bold text-btn-blue-color">카테고리</span>를
                골라볼까요?
              </p>
            </div>
          </div>
        </div>
        <div>
          <CategoryList setCategoryId={setSelectedCategory} activeCategoryId={selectedCategory} />
        </div>
      </div>
      <div className="mt-[50px] flex w-full flex-col items-center gap-4">
        {isLoadingData ? (
          <div className="flex h-20 items-center justify-center">
            <LoadingAnimation />
          </div>
        ) : isError ? (
          <ErrorScreen onRefresh={refetch} />
        ) : hasCompanies ? (
          <div className="flex w-full max-w-[600px] flex-col items-center gap-4">
            <h2 className="text-[20px] font-bold">기업 선택</h2>
            {companies.map((company) => (
              <CompanySelectButton
                key={company.companyId}
                company={company}
                onClick={() => handleCompanySelect(company)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center">
            <p className="text-[16px]">데이터가 없습니다.</p>
            <p className="mt-2 text-[14px] text-gray-400">다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>

      {/* 기업 선택 완료 모달 */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="mx-auto max-w-lg overflow-hidden rounded-2xl border-none bg-[#121729] p-0 text-white">
          <DialogHeader className="flex flex-col items-center pb-5 pt-10 text-center">
            <DialogTitle className="mb-1 text-[28px] font-bold">기업 선택 완료</DialogTitle>

            {/* 접근성을 위한 설명 (스크린 리더용) */}
            <DialogDescription className="sr-only">
              기업 선택 완료 후 튜토리얼 시간대와 안내 사항을 확인하세요.
            </DialogDescription>
          </DialogHeader>

          {/* 실제 모달 콘텐츠 */}
          <div className="flex flex-col items-center px-5 pb-5 pt-0 text-center">
            <div className="flex flex-col text-[16px] text-white">
              <span>기업 선택을 완료했습니다.</span>
              <span className="mt-2">주식 튜토리얼의 시간대는 다음과 같습니다.</span>
            </div>

            <div className="my-10 flex w-full items-center justify-center gap-5 rounded-lg bg-[#041021] p-4">
              <span className="text-[22px] font-bold text-[#4CAF50]">{startDate}</span>
              <span className="mx-1 text-[22px] text-white">-</span>
              <span className="text-[22px] font-bold text-[#F44336]">{endDate}</span>
            </div>

            <div className="flex flex-col text-[16px] text-white">
              <span>튜토리얼은 실제 데이터를 바탕으로 진행됩니다.</span>
              <span className="mt-2">저희는 해당 데이터를 바탕으로</span>
              <span>여러분에게 도움이 될 수 있는 3가지 변곡점을 보여드리겠습니다.</span>
              <span className="mt-2">저희가 제시한 정보를 바탕으로 자유롭게 선택해보세요.</span>
            </div>

            <div className="mt-10 flex w-full flex-col items-center">
              <Button
                className="w-full max-w-[400px] rounded-full bg-[#5676F5] px-8 py-4 text-[18px] font-bold text-white hover:bg-[#4A67DE]"
                onClick={handleConfirm}
              >
                선택완료
              </Button>
              <span className="mb-4 mt-4 text-center text-[13px] text-gray-500">
                선택완료 버튼 클릭시 주식 튜토리얼이 시작됩니다.
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
