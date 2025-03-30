import { useState } from 'react';
import { format } from 'date-fns';

import NoneLogo from '/none-img/none-logo.png';
import { useGetCompaniesByCategory } from '@/api/category.api';
import { TutorialAnimation } from '@/components/common/tutorial-animation';
import { CategoryList } from '@/components/common/category-list';
import { CompanySelectButton } from '@/components/common/company-select-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

export const SelectPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('0');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // 현재 날짜와 1년 전 날짜 계산
  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  // 날짜 포맷팅 (YYYY-MM-DD)
  const startDate = format(oneYearAgo, 'yyyy-MM-dd');
  const endDate = format(currentDate, 'yyyy-MM-dd');

  const {
    data: companies = [],
    isLoading,
    isFetching,
    isError,
  } = useGetCompaniesByCategory(selectedCategory);

  const isLoadingData = isLoading || isFetching;
  const hasCompanies = companies && companies.length > 0;

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    // 여기에 확인 버튼 클릭 시 실행할 로직 추가
    // 예: 선택한 기업 정보와 함께 다음 페이지로 이동
    if (selectedCompany) {
      navigate(`/tutorial/simulation/${selectedCompany.companyId}`);
    }
    setIsDialogOpen(false);
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
      <div className="mt-[50px] flex flex-col items-center gap-4 w-full">
        {isLoadingData ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-[16px]">기업 목록을 불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <p className="text-[16px]">데이터를 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-[14px] text-gray-400 mt-2">잠시 후 다시 시도해주세요.</p>
          </div>
        ) : hasCompanies ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-[600px]">
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
          <div className="flex flex-col items-center justify-center h-[200px]">
            <p className="text-[16px]">데이터가 없습니다.</p>
            <p className="text-[14px] text-gray-400 mt-2">다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>

      {/* 기업 선택 완료 모달 */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-[#171A2E] text-white border-none">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <AlertDialogTitle className="text-[28px] font-bold">기업 선택 완료</AlertDialogTitle>
            <AlertDialogDescription className="mt-6 text-[16px]">
              <div className="text-center">
                <p className="mt-2">기업 선택을 완료했습니다.</p>
                <p className="mt-1">주식 튜토리얼의 시간대는 다음과 같습니다.</p>
                <div className="flex justify-center items-center gap-4 my-8">
                  <span className="text-[#4CAF50] text-[20px]">{startDate}</span>
                  <span className="text-[16px]">-</span>
                  <span className="text-[#F44336] text-[20px]">{endDate}</span>
                </div>
                <p>튜토리얼은 실제 데이터를 바탕으로 진행됩니다.</p>
                <p className="mt-3">저희는 해당 데이터를 바탕으로</p>
                <p>여러분에게 도움이 될 수 있는 3가지 변곡점을 보여드리겠습니다.</p>
                <p className="mt-3">저희가 제시한 정보를 바탕으로 자유롭게 선택해보세요.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col items-center justify-center mt-8">
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-[#5676F5] hover:bg-[#4A67DE] text-white py-3 px-12 rounded-full text-[18px]"
            >
              선택완료
            </AlertDialogAction>
            <br />
            <p className="text-center text-[14px] text-gray-400 mt-4">
              선택완료 버튼 클릭시 주식 튜토리얼이 시작됩니다.
            </p>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
