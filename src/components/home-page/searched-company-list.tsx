import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchedCompanyResponse } from '@/api/types/home';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface SearchedCompanyListItemProps {
  company: SearchedCompanyResponse;
}

export const SearchedCompanyListItem = ({ company }: SearchedCompanyListItemProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isPositive = company.closePricePercent > 0;
  const isNegative = company.closePricePercent < 0;

  const handleMockInvestment = () => {
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    navigate(`/investment/simulate/${company.companyId}`);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex h-16 w-full items-center justify-between border-b border-border-color px-4 hover:bg-modal-background-color">
        <div className="flex items-center gap-4">
          <img
            src={company.companyImage || 'https://placehold.co/40x40'}
            alt={`${company.companyName}-logo`}
            className="h-10 w-10 rounded-lg"
          />
          <div className="flex flex-col">
            <p className="text-base font-medium">{company.companyName}</p>
            <div className="flex items-center gap-2">
              <span className="text-text-sub-color text-xs">종목코드</span>
              <p className="text-text-sub-color text-xs">{company.companyCode}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-text-sub-color text-xs">현재가</span>
            <p className="text-base font-medium">{company.closePrice.toLocaleString()}원</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-text-sub-color text-xs">등락률</span>
            <p
              className={`text-sm font-medium ${
                isPositive
                  ? 'text-btn-green-color'
                  : isNegative
                    ? 'text-btn-red-color'
                    : 'text-text-main-color'
              }`}
            >
              {isPositive ? '+' : ''}
              {company.closePricePercent.toFixed(2)}%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="blue" size="sm" onClick={handleMockInvestment} className="text-xs">
              모의투자
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="mx-auto max-w-lg overflow-hidden rounded-2xl border-none bg-[#121729] p-0 text-white">
          <AlertDialogHeader className="flex flex-col items-center pb-5 pt-10 text-center">
            <AlertDialogTitle className="mb-1 text-[28px] font-bold">
              모의투자 안내
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              선택한 기업에 대한 모의투자 안내 사항을 확인하세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center px-5 pb-5 pt-0 text-center">
            <div className="flex flex-col items-center text-[16px] text-white">
              <div className="flex items-center gap-2">
                <img
                  src={company.companyImage}
                  alt={company.companyName}
                  className="h-10 w-10 rounded-lg"
                />
                <span className="font-bold">{company.companyName}</span>
              </div>
              <span className="mt-2">기업에 대한 모의투자를 진행하시겠습니까?</span>
            </div>

            <div className="my-10 flex w-full items-center justify-center gap-5 rounded-lg bg-[#041021] p-4">
              <span className="text-[22px] font-bold text-[#4CAF50]">
                {company.closePrice.toLocaleString()}원
              </span>
              <span className="text-[22px] text-white">
                ({company.closePricePercent.toFixed(2)}%)
              </span>
            </div>

            <div className="flex flex-col text-[16px] text-white">
              <span>모의투자는 실제 투자와 동일한 환경에서 진행됩니다.</span>
              <span className="mt-2">투자 전 기업의 재무제표와 투자 정보를</span>
              <span>충분히 확인하시기 바랍니다.</span>
            </div>

            <div className="mt-10 flex w-full flex-col items-center gap-4">
              <AlertDialogAction
                className="w-full max-w-[400px] rounded-full bg-[#5676F5] px-8 py-4 text-[18px] font-bold text-white hover:bg-[#4A67DE]"
                onClick={handleConfirm}
              >
                모의투자 시작하기
              </AlertDialogAction>
              <AlertDialogCancel className="w-full max-w-[400px] rounded-full px-8 py-4 text-[18px] font-bold">
                취소하기
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
