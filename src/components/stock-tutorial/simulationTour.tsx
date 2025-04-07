import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

// 필요한 이미지들 임포트
import LineExplainImg from '@/assets/product-tour/Line_explain.png';
import MoneyExplainImg from '@/assets/product-tour/Money_explain.png';
import OHLCExplainImg from '@/assets/product-tour/OHLC_explain.png';
import OHLCGraphImg from '@/assets/product-tour/OHLC_graph.png';
import PointExplainImg from '@/assets/product-tour/Point_explain.png';

interface SimulationTourProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

export const SimulationTour = ({ run, setRun }: SimulationTourProps) => {
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    // 투어 스텝 정의
    setSteps([
      {
        target: 'body',
        content: (
          <div className="p-4">
            <h2 className="mb-8 text-[25px] font-bold">주식 튜토리얼에 오신 것을 환영합니다!</h2>
            <p className="text-[18px]">실제 주식 차트와 데이터를 기반으로</p>
            <p className="text-[18px]">주식 투자를 안전하게 경험해 볼 수 있습니다.</p>
            <br />
            <p className="text-[18px]">해당 도움말을 통해 주요 기능을 소개해 드리겠습니다.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: 'body',
        content: (
          <div className="p-2">
            <h2 className="mb-5 text-[25px] font-bold">변곡점 설명</h2>
            <div className="mb-8 flex justify-center">
              <img src={PointExplainImg} alt="변곡점 설명" className="h-auto max-w-full" />
            </div>
            <p className="text-[18px]">
              주식 차트에서 중요한 변화가 발생하는 시점을 변곡점이라고 합니다.
            </p>
            <p className="mt-2 text-[18px]">
              튜토리얼에서는 총 3개의 변곡점을 기준으로 4단계로 진행됩니다.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: 'body',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">OHLC 설명</h2>
            <div className="mb-8 flex justify-center">
              <img src={OHLCExplainImg} alt="OHLC 설명" className="h-auto max-w-full" />
            </div>
            <p className="text-[18px]">
              주식 차트는 OHLC(시가, 고가, 저가, 종가) 정보를 담고 있습니다.
            </p>
            <p className="mt-2 text-[18px]">
              이 정보를 통해 해당 날짜의 주가 변동을 파악할 수 있습니다.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: 'body',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">OHLC 그래프</h2>
            <div className="mb-8 flex justify-center">
              <img src={OHLCGraphImg} alt="OHLC 그래프" className="h-auto max-w-full" />
            </div>
            <p className="text-[18px]">
              캔들차트는 시가, 고가, 저가, 종가를 한눈에 볼 수 있도록 표현합니다.
            </p>
            <p className="mt-2 text-[18px]">빨간색은 상승, 파란색은 하락을 의미합니다.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: 'body',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">이평선 설명</h2>
            <div className="mb-8 flex justify-center">
              <img src={LineExplainImg} alt="이평선 설명" className="h-auto max-w-full" />
            </div>
            <p className="text-[18px]">이동평균선(이평선)은 일정 기간 동안의</p>
            <p className="mt-2 text-[18px]">평균 가격을 나타내는 지표입니다.</p>
            <p className="mt-2 text-[18px]">주가의 추세를 파악하는 데 도움이 됩니다.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.stock-tutorial-info',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">기업 정보</h2>
            <p className="text-[18px]">현재 선택된 기업의 정보와 주가를 확인할 수 있습니다.</p>
            <p className="mt-2 text-[18px]">
              튜토리얼 시작 버튼을 클릭하면 시뮬레이션이 시작됩니다.
            </p>
          </div>
        ),
        disableBeacon: true,
        spotlightClicks: true,
        placement: 'bottom',
      },
      {
        target: '.stock-tutorial-money-info',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">자산 정보</h2>
            <div className="mb-8 flex justify-center">
              <img src={MoneyExplainImg} alt="자산 정보" className="h-auto max-w-full" />
            </div>
            <p className="text-[18px]">현재 보유 중인 자산 정보를 확인할 수 있습니다.</p>
            <p className="mt-2 text-[18px]">
              주문 가능 금액, 현재 총 자산, 총 수익률을 확인하세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'bottom',
        spotlightClicks: true,
      },
      {
        target: '.stock-progress',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">진행 정보</h2>
            <p className="text-[18px]">튜토리얼의 진행 상황과 현재 단계를 확인할 수 있습니다.</p>
            <p className="mt-2 text-[18px]">진행률과 날짜 범위를 통해 현재 위치를 파악하세요.</p>
          </div>
        ),
        disableBeacon: true,
        placement: 'bottom',
        spotlightClicks: true,
      },
      {
        target: '.chart-tutorial',
        content: (
          <div className="p-4">
            <h2 className="mb-3 text-[20px] font-bold">주식 차트</h2>
            <p className="text-[16px]">
              실제 주가 데이터를 기반으로 한 차트를 확인할 수 있습니다.
              <br />
              캔들 차트와 이동평균선을 통해 주가 흐름을 분석해보세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        spotlightClicks: true,
        placement: 'center',
      },
      {
        target: '.stock-tutorial-order',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">거래 체결</h2>
            <p className="text-[18px]">이 영역에서 주식을 구매, 판매, 관망할 수 있습니다.</p>
            <p className="mt-2 text-[18px]">각 단계마다 한 번만 거래할 수 있습니다.</p>
          </div>
        ),
        disableBeacon: true,
        placement: 'left',
        spotlightClicks: true,
      },
      {
        target: '.stock-tutorial-comment',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">AI 코멘트</h2>
            <p className="text-[18px]">
              AI가 현재 시장 상황과 뉴스를 분석하여 제공하는 코멘트입니다.
            </p>
            <p className="mt-2 text-[18px]">투자 결정에 참고할 수 있는 정보를 확인하세요.</p>
          </div>
        ),
        disableBeacon: true,
        spotlightClicks: true,
        placement: 'top',
      },
      {
        target: '.day-history',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">뉴스 히스토리</h2>
            <p className="text-[18px]">현재 단계까지의 뉴스 히스토리를 확인할 수 있습니다.</p>
            <p className="mt-2 text-[18px]">뉴스와 주가 변동의 연관성을 분석해보세요.</p>
          </div>
        ),
        disableBeacon: true,
        spotlightClicks: true,
        placement: 'right',
      },
      {
        target: '.stock-tutorial-news',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">교육용 뉴스</h2>
            <p className="text-[18px]">각 변곡점의 주요 뉴스를 제공합니다.</p>
            <p className="mt-2 text-[18px]">실제 뉴스가 주가에 어떤 영향을 미쳤는지 학습하세요.</p>
          </div>
        ),
        disableBeacon: true,
        placement: 'top',
        spotlightClicks: true,
      },
      {
        target: '.stock-tutorial-conclusion',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">체결 내역</h2>
            <p className="text-[18px]">지금까지의 거래 내역을 확인할 수 있습니다.</p>
            <p className="mt-2 text-[18px]">
              각 단계별 구매/판매/관망 결정을 한눈에 볼 수 있습니다.
            </p>
          </div>
        ),
        disableBeacon: true,
        spotlightClicks: true,
        placement: 'bottom',
      },
      {
        target: 'body',
        content: (
          <div className="p-4">
            <h2 className="mb-7 text-[25px] font-bold">도움말을 마칩니다!</h2>
            <p className="text-[18px]">이제 실제 튜토리얼을 진행해보세요.</p>
            <p className="mt-2 text-[18px]">
              도움말 버튼을 클릭하면 언제든지 이 투어를 다시 볼 수 있습니다.
            </p>
            <p className="mt-2 text-[18px]">
              주식 튜토리얼을 통해 안전하게 투자 경험을 쌓아보세요!
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: true,
      },
    ]);
  }, []);

  // 투어 콜백 핸들러
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status as string)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      spotlightClicks
      disableOverlayClose
      spotlightPadding={10}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#5676F5',
          backgroundColor: '#121729',
          arrowColor: '#121729',
          textColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.65)',
        },
        tooltip: {
          width: '600px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: '#5676F5',
          color: '#ffffff',
        },
        buttonBack: {
          color: '#ffffff',
        },
        buttonSkip: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      }}
      locale={{
        back: '이전',
        close: '닫기',
        last: '완료',
        next: '다음',
        skip: '건너뛰기',
      }}
    />
  );
};
