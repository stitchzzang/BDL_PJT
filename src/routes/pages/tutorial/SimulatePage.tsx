import { DayHistory } from '@/components/stock-tutorial/day-history';
import { StockProgress } from '@/components/stock-tutorial/stock-progress';
import { StockTutorialComment } from '@/components/stock-tutorial/stock-tutorial-comment';
import { StockTutorialConclusion } from '@/components/stock-tutorial/stock-tutorial-conclusion';
import { StockTutorialInfo } from '@/components/stock-tutorial/stock-tutorial-info';
import { StockTutorialMoneyInfo } from '@/components/stock-tutorial/stock-tutorial-money-info';
import { StockTutorialNews } from '@/components/stock-tutorial/stock-tutorial-news';
import { TutorialOrderStatus } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status';
import ChartComponent from '@/components/ui/chart';
import { dummyMinuteData, dummyPeriodData } from '@/mocks/dummy-data';
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TutorialEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeRate: number;
  onConfirmResultClick: () => void;
  onEndTutorialClick: () => void;
}

const TutorialEndModal = ({
  isOpen,
  onClose,
  changeRate,
  onConfirmResultClick,
  onEndTutorialClick,
}: TutorialEndModalProps) => {
  const isPositive = changeRate >= 0;
  const rateColor = isPositive ? 'text-[#E5404A]' : 'text-blue-500';
  const formattedRate = `${isPositive ? '+' : ''}${changeRate.toFixed(1)}%`;

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[450px] rounded-lg bg-[#1A1A25] p-6 text-white border-none">
        <div className="mb-4 rounded-md bg-[#101017] p-4 text-center">
          <span className={`text-3xl font-bold ${rateColor}`}>{formattedRate}</span>
        </div>
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-xl font-semibold">
            모의교육이 종료되었습니다.
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-gray-400">
            모의교육 결과는 마이페이지에서 전체 확인이 가능합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex justify-between sm:justify-between">
          <AlertDialogCancel
            onClick={onConfirmResultClick}
            className="flex-1 mr-2 bg-[#333342] hover:bg-[#444452] text-white border-none"
          >
            결과 확인하기
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onEndTutorialClick}
            className="flex-1 ml-2 bg-[#4A90E2] hover:bg-[#5AA0F2] text-white border-none"
          >
            교육 종료하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const SimulatePage = () => {
  const navigate = useNavigate();
  const h3Style = 'text-[20px] font-bold';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalChangeRate, setFinalChangeRate] = useState(32.2);

  const handleOpenModal = () => {
    setFinalChangeRate(32.2);
    setIsModalOpen(true);
  };

  const handleOpenNegativeModal = () => {
    setFinalChangeRate(-15.8);
    setIsModalOpen(true);
  };

  const handleNavigateToResult = () => {
    navigate('/member/stock-tutorial-result');
    setIsModalOpen(false);
  };

  const handleNavigateToSelect = () => {
    navigate('/tutorial/select');
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="my-4 flex gap-4">
        <Button onClick={handleOpenModal} variant="secondary">
          임시: 튜토리얼 종료 (수익 +)
        </Button>
        <Button onClick={handleOpenNegativeModal} variant="destructive">
          임시: 튜토리얼 종료 (수익 -)
        </Button>
      </div>
      <div>
        <StockTutorialInfo category={'반도체'} />
        <div className="my-[25px]">
          <StockProgress />
        </div>
        <div className="mb-[25px] flex justify-between">
          <StockTutorialMoneyInfo />
          <div className="flex items-center gap-2">
            <p className="text-border-color">진행 기간 : </p>
            <div className="flex gap-3 rounded-xl bg-modal-background-color px-[20px] py-[15px]">
              <p>2024-03-21</p>
              <span className="font-bold text-border-color"> - </span>
              <p>2024-11-21</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-3">
        <div className="col-span-8">
          <ChartComponent minuteData={dummyMinuteData} periodData={dummyPeriodData} height={600} />
        </div>
        <div className="col-span-2">
          <TutorialOrderStatus />
        </div>
      </div>
      <div>
        <div className="my-[30px]">
          <h3 className={`${h3Style} mb-[15px]`}>일간 히스토리</h3>
          <DayHistory />
        </div>
      </div>
      <div>
        <StockTutorialComment />
      </div>
      <div className="mt-[25px] grid grid-cols-6 gap-3 ">
        <div className="col-span-5">
          <StockTutorialNews />
        </div>
        <div className="col-span-1">
          <StockTutorialConclusion />
        </div>
      </div>
      <TutorialEndModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        changeRate={finalChangeRate}
        onConfirmResultClick={handleNavigateToResult}
        onEndTutorialClick={handleNavigateToSelect}
      />
    </div>
  );
};
