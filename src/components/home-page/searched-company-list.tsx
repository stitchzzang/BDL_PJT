import { useNavigate } from 'react-router-dom';

import { SearchedCompanyResponse } from '@/api/types/home';
import { Button } from '@/components/ui/button';

interface SearchedCompanyListItemProps {
  company: SearchedCompanyResponse;
  categoryId: string;
}

export const SearchedCompanyListItem = ({ company, categoryId }: SearchedCompanyListItemProps) => {
  const navigate = useNavigate();
  const isPositive = company.closePricePercent > 0;
  const isNegative = company.closePricePercent < 0;

  const handleMockInvestment = () => {
    navigate(`/investment/select?category=${categoryId}`);
  };

  const handleTutorial = () => {
    navigate(`/tutorial/select?category=${categoryId}`);
  };

  return (
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
          <Button variant="blue" size="sm" onClick={handleTutorial} className="text-xs">
            튜토리얼
          </Button>
        </div>
      </div>
    </div>
  );
};
