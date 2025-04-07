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
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">주식 튜토리얼에 오신 것을 환영합니다!</h2>
            <p>
              실제 주식 차트와 데이터를 기반으로 주식 투자를 안전하게 경험해 볼 수 있습니다.
              <br />이 투어를 통해 페이지의 주요 기능들을 소개해 드리겠습니다.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: 'body',
        content: (
          <div className="max-w-[400px] p-2">
            <h2 className="mb-2 text-[18px] font-bold">변곡점 설명</h2>
            <div className="mb-2 flex justify-center">
              <img src={PointExplainImg} alt="변곡점 설명" className="h-auto max-w-full" />
            </div>
            <p>
              주식 차트에서 중요한 변화가 발생하는 시점을 변곡점이라고 합니다.
              <br />
              튜토리얼에서는 총 3개의 변곡점을 기준으로 4단계로 진행됩니다.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: 'body',
        content: (
          <div className="max-w-[400px] p-2">
            <h2 className="mb-2 text-[18px] font-bold">OHLC 설명</h2>
            <div className="mb-2 flex justify-center">
              <img src={OHLCExplainImg} alt="OHLC 설명" className="h-auto max-w-full" />
            </div>
            <p>
              주식 차트는 OHLC(시가, 고가, 저가, 종가) 정보를 담고 있습니다.
              <br />이 정보를 통해 해당 날짜의 주가 변동을 파악할 수 있습니다.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: 'body',
        content: (
          <div className="max-w-[400px] p-2">
            <h2 className="mb-2 text-[18px] font-bold">OHLC 그래프</h2>
            <div className="mb-2 flex justify-center">
              <img src={OHLCGraphImg} alt="OHLC 그래프" className="h-auto max-w-full" />
            </div>
            <p>
              캔들차트는 시가, 고가, 저가, 종가를 한눈에 볼 수 있도록 표현합니다.
              <br />
              빨간색은 상승, 파란색은 하락을 의미합니다.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: 'body',
        content: (
          <div className="max-w-[400px] p-2">
            <h2 className="mb-2 text-[18px] font-bold">이평선 설명</h2>
            <div className="mb-2 flex justify-center">
              <img src={LineExplainImg} alt="이평선 설명" className="h-auto max-w-full" />
            </div>
            <p>
              이동평균선(이평선)은 일정 기간 동안의 평균 가격을 나타내는 지표입니다.
              <br />
              주가의 추세를 파악하는 데 도움이 됩니다.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.stock-tutorial-info',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">기업 정보</h2>
            <p>
              현재 선택된 기업의 정보와 주가를 확인할 수 있습니다.
              <br />
              튜토리얼 시작 버튼을 클릭하면 시뮬레이션이 시작됩니다.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'left-start',
        offset: 20,
      },
      {
        target: '.stock-tutorial-money-info',
        content: (
          <div className="max-w-[400px] p-2">
            <h2 className="mb-2 text-[18px] font-bold">자산 정보</h2>
            <div className="mb-2 flex justify-center">
              <img src={MoneyExplainImg} alt="자산 정보" className="h-auto max-w-full" />
            </div>
            <p>
              현재 보유 중인 자산 정보를 확인할 수 있습니다.
              <br />
              주문 가능 금액, 현재 총 자산, 총 수익률을 확인하세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'top-start',
        offset: 15,
      },
      {
        target: '.stock-progress',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">진행 정보</h2>
            <p>
              튜토리얼의 진행 상황과 현재 단계를 확인할 수 있습니다.
              <br />
              진행률과 날짜 범위를 통해 현재 위치를 파악하세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'top-end',
        offset: 15,
      },
      {
        target: '.chart-tutorial',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">주식 차트</h2>
            <p>
              실제 주가 데이터를 기반으로 한 차트를 확인할 수 있습니다.
              <br />
              캔들 차트와 이동평균선을 통해 주가 흐름을 분석해보세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'right',
        offset: 20,
      },
      {
        target: '.stock-tutorial-order',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">거래 체결</h2>
            <p>
              이 영역에서 주식을 매수, 매도, 관망할 수 있습니다.
              <br />각 단계마다 한 번의 거래 선택이 가능합니다.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'left',
        offset: 20,
      },
      {
        target: '.stock-tutorial-comment',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">AI 코멘트</h2>
            <p>
              AI가 현재 시장 상황과 뉴스를 분석하여 제공하는 코멘트입니다.
              <br />
              투자 결정에 참고할 수 있는 정보를 확인하세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'top',
        offset: 15,
      },
      {
        target: '.day-history',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">뉴스 히스토리</h2>
            <p>
              현재 단계까지의 뉴스 히스토리를 확인할 수 있습니다.
              <br />
              뉴스와 주가 변동의 연관성을 분석해보세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'top',
        offset: 15,
      },
      {
        target: '.stock-tutorial-news',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">교육용 뉴스</h2>
            <p>
              각 변곡점의 주요 뉴스를 제공합니다.
              <br />
              실제 뉴스가 주가에 어떤 영향을 미쳤는지 학습하세요.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'top-start',
        offset: 15,
      },
      {
        target: '.stock-tutorial-conclusion',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">체결 내역</h2>
            <p>
              지금까지의 거래 내역을 확인할 수 있습니다.
              <br />각 단계별 매수/매도/관망 결정을 한눈에 볼 수 있습니다.
            </p>
          </div>
        ),
        disableBeacon: true,
        placement: 'left',
        offset: 15,
      },
      {
        target: 'body',
        content: (
          <div className="p-2">
            <h2 className="mb-2 text-[18px] font-bold">투어를 마칩니다!</h2>
            <p>
              이제 실제 튜토리얼을 진행해보세요.
              <br />
              도움말 버튼을 클릭하면 언제든지 이 투어를 다시 볼 수 있습니다.
              <br />
              주식 튜토리얼을 통해 안전하게 투자 경험을 쌓아보세요!
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
    ]);
  }, []);

  // 투어 콜백 핸들러
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
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
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#5676F5',
          textColor: '#ffffff',
          backgroundColor: '#121729',
          arrowColor: '#121729',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
        },
        spotlight: {
          backgroundColor: 'transparent',
        },
        tooltip: {
          borderRadius: '8px',
        },
        buttonNext: {
          backgroundColor: '#5676F5',
          borderRadius: '4px',
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
