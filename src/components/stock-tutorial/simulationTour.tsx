import React, { useEffect, useLayoutEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

// helpNewsImage 추가
import helpNewsImage from '@/assets/product-tour/helpNewsImage.png';
// 필요한 이미지들 임포트
import LineExplainImg from '@/assets/product-tour/Line_explain.png';
import MoneyExplainImg from '@/assets/product-tour/Money_explain.png';
import OHLCExplainImg from '@/assets/product-tour/OHLC_explain.png';
import OHLCGraphImg from '@/assets/product-tour/OHLC_graph.png';
import PointExplainImg from '@/assets/product-tour/Point_explain.png';
import { DayHistory } from '@/components/stock-tutorial/day-history';
import { StockProgress } from '@/components/stock-tutorial/stock-progress';
import { StockTutorialComment } from '@/components/stock-tutorial/stock-tutorial-comment';
import { StockTutorialConclusion } from '@/components/stock-tutorial/stock-tutorial-conclusion';
// 필요한 모든 컴포넌트 임포트
import { StockTutorialInfo } from '@/components/stock-tutorial/stock-tutorial-info';
import { StockTutorialMoneyInfo } from '@/components/stock-tutorial/stock-tutorial-money-info';
import { StockTutorialNews } from '@/components/stock-tutorial/stock-tutorial-news';
import { TutorialOrderStatusBuy } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-buy';
// 차트 컴포넌트 임포트
import ChartComponent, { StockCandle } from '@/components/ui/chart-help';
// 더미 데이터 임포트
import { DUMMY_DAILY_CHART_DATA } from '@/mocks/dummy-data';

// 튜토리얼 스톡 응답 타입 정의
interface TutorialStockResponse {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockCandle[];
}

// 거래 기록 타입 정의
type TradeAction = 'buy' | 'sell' | 'wait';

interface TradeRecord {
  action: TradeAction;
  price: number;
  quantity: number;
  timestamp: Date;
  stockCandleId: number;
  turnNumber: number;
}

// 뉴스 타입 정의
interface NewsResponse {
  newsId: number;
  newsTitle: string;
  newsContent: string;
  newsDate: string;
  stockCandleId: number;
  changeRate: number;
}

interface NewsResponseWithThumbnail extends NewsResponse {
  newsThumbnailUrl: string;
  inflectionPointTurn?: number;
}

interface SimulationTourProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

export const SimulationTour = ({ run, setRun }: SimulationTourProps) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  // 더미 데이터 상태 관리
  const [showDemo, setShowDemo] = useState(false);
  const [isTutorialStarted, setIsTutorialStarted] = useState(true);
  const [currentTurn, setCurrentTurn] = useState(2);
  const [isCurrentTurnCompleted, setIsCurrentTurnCompleted] = useState(true);

  // 더미 데이터
  const dummyCompanyInfo = {
    companyId: 1,
    companyName: '삼성전자',
    companyCode: '005930',
    companyImage: 'https://via.placeholder.com/50',
    categories: ['전체', 'IT', '반도체'],
    previousClosePrice: 78000,
  };

  const latestPrice = 79500;

  const dummyMoneyInfo = {
    initialAsset: 10000000,
    availableOrderAsset: 8500000,
    currentTotalAsset: 10200000,
    totalReturnRate: 2.0,
  };

  const dummyTradeRecord: TradeRecord[] = [
    {
      action: 'buy',
      price: 75000,
      quantity: 10,
      timestamp: new Date('2023-04-01'),
      stockCandleId: 1,
      turnNumber: 1,
    },
    {
      action: 'sell',
      price: 79000,
      quantity: 5,
      timestamp: new Date('2023-04-15'),
      stockCandleId: 2,
      turnNumber: 2,
    },
  ];

  const dummyNewsData: NewsResponseWithThumbnail = {
    newsId: 1,
    newsTitle: '삼성전자, 신형 반도체 생산량 확대 예정',
    newsContent:
      '삼성전자가 차세대 반도체 생산량을 확대할 예정이라고 밝혔습니다. 이는 글로벌 반도체 수요 증가에 대응하기 위한 전략으로, 향후 시장 점유율 확대를 노리고 있습니다.',
    newsDate: '2023-04-01',
    newsThumbnailUrl: helpNewsImage,
    stockCandleId: 123,
    changeRate: 1.5,
    inflectionPointTurn: 2,
  };

  const dummyPastNews: NewsResponse[] = [
    {
      newsId: 1,
      newsTitle: '삼성전자, 신형 반도체 생산량 확대 예정',
      newsContent: '삼성전자가 차세대 반도체 생산량을 확대할 예정이라고 밝혔습니다.',
      newsDate: '2023-04-01',
      stockCandleId: 123,
      changeRate: 1.5,
    },
    {
      newsId: 2,
      newsTitle: '갤럭시 신제품 출시 호조, 주가 상승세',
      newsContent:
        '삼성전자의 갤럭시 신제품이 시장에서 호평을 받으며 주가가 상승세를 보이고 있습니다.',
      newsDate: '2023-03-15',
      stockCandleId: 100,
      changeRate: 0.8,
    },
  ];

  const dummyAIComment =
    '[뉴스 분위기]\n- 긍정 뉴스: 신제품 출시, 수익성 개선, 글로벌 시장 진출\n- 부정 뉴스: 인력 감축, 국내 시장 침체\n\n[주가 추세 요약]\n- 기간 내 주가: 상승세 지속\n- 투자자 반응: 긍정적, 매수세 강화';

  // 프로그레스 정보
  const progress = 50;
  const pointDates = ['230215', '230401', '230515'];
  const defaultStartDate = '230101';
  const defaultEndDate = '230630';

  // 변곡점 정보 추가
  const inflectionPoints = [
    { date: '230215', label: '변곡점1', index: 10 },
    { date: '230401', label: '변곡점2', index: 20 },
    { date: '230515', label: '변곡점3', index: 30 },
  ];

  // 일봉 데이터 형식으로 변환 (TutorialStockResponse 형식에 맞춤)
  const dummyDailyChartDataConverted: TutorialStockResponse = {
    companyId: DUMMY_DAILY_CHART_DATA.companyId,
    limit: DUMMY_DAILY_CHART_DATA.limit,
    cursor: DUMMY_DAILY_CHART_DATA.cursor || '',
    data: DUMMY_DAILY_CHART_DATA.data.map((item) => ({
      stockCandleId: Number(item.stockCandleId),
      companyId: item.companyId,
      openPrice: item.openPrice,
      openPricePercent: item.openPricePercent,
      highPrice: item.highPrice,
      highPricePercent: item.highPricePercent,
      lowPrice: item.lowPrice,
      lowPricePercent: item.lowPricePercent,
      closePrice: item.closePrice,
      closePricePercent: item.closePricePercent,
      accumulatedVolume: item.accumulatedVolume,
      accumulatedTradeAmount: item.accumulatedTradeAmount,
      tradingDate: item.tradingDate,
      periodType: item.periodType,
      fiveAverage: item.fiveAverage,
      twentyAverage: item.twentyAverage,
    })),
  };

  // 진행 중인 턴의 날짜 범위 계산
  const getTurnDateRange = (turn: number) => {
    if (turn <= 0 || pointDates.length < 3) {
      return { start: defaultStartDate, end: defaultEndDate };
    }

    const subtractOneDay = (dateStr: string): string => {
      try {
        // 날짜 형식이 'YYMMDD'라고 가정
        const year = parseInt('20' + dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4)) - 1; // 0-based 월
        const day = parseInt(dateStr.substring(4, 6));

        const date = new Date(year, month, day);
        date.setDate(date.getDate() - 1);

        // 다시 'YYMMDD' 형식으로 변환
        const adjustedYear = date.getFullYear().toString().substring(2);
        const adjustedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const adjustedDay = date.getDate().toString().padStart(2, '0');

        return adjustedYear + adjustedMonth + adjustedDay;
      } catch (e) {
        return dateStr; // 오류 시 원본 날짜 반환
      }
    };

    switch (turn) {
      case 1:
        return {
          start: defaultStartDate,
          end: subtractOneDay(pointDates[0]),
        };
      case 2:
        return {
          start: pointDates[0],
          end: subtractOneDay(pointDates[1]),
        };
      case 3:
        return {
          start: pointDates[1],
          end: subtractOneDay(pointDates[2]),
        };
      case 4:
        return {
          start: pointDates[2],
          end: defaultEndDate,
        };
      default:
        return { start: defaultStartDate, end: defaultEndDate };
    }
  };

  // 날짜 포맷팅 함수
  const formatYYMMDDToYYYYMMDD = (date: string): string => {
    if (date && date.length === 6) {
      return `20${date.substring(0, 2)}.${date.substring(2, 4)}.${date.substring(4, 6)}`;
    }
    return date;
  };

  // CSS 오버라이드를 위한 스타일 태그 추가
  useLayoutEffect(() => {
    // 기존 스타일 태그가 있으면 제거
    const existingStyle = document.getElementById('joyride-custom-styles');
    if (existingStyle) existingStyle.remove();

    // 새로운 스타일 태그 생성 및 추가
    const styleTag = document.createElement('style');
    styleTag.id = 'joyride-custom-styles';
    const isLastStep = stepIndex === steps.length - 1;

    styleTag.innerHTML = `
      /* 다음 버튼 스타일 오버라이드 */
      .react-joyride__tooltip button[data-action="primary"] {
        position: relative;
        background-color: transparent !important;
        color: transparent !important;
        width: 225px !important;
        height: 45px !important;
        margin-left: 5px !important;
      }
      
      .react-joyride__tooltip button[data-action="primary"]::after {
        content: "${isLastStep ? '완료' : '다음'}";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${isLastStep ? '#1CAB55' : '#5676F5'};
        border-radius: 6px;
        color: white;
        font-size: 16px;
      }
      
      /* 이전 버튼 숨기기 */
      .react-joyride__tooltip button[data-action="back"] {
        display: none !important;
      }
      
      /* Step 텍스트 제거 */
      .react-joyride__tooltip div[class*="__step-count"] {
        display: none !important;
      }
      
      /* 버튼 텍스트 숨기기 */
      .react-joyride__tooltip button span {
        opacity: 0 !important;
        visibility: hidden !important;
      }
      
      /* 스크롤바 숨기기 */
      .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
      }
      
      .scrollbar-hide::-webkit-scrollbar {
        display: none;  /* Chrome, Safari, Opera */
      }
      
      /* 차트 영역의 툴팁 위치 조정 */
      #chart-tutorial + div > div {
        margin-left: 450px !important;
        transform: translateX(40%) !important;
      }
      
      /* 차트 영역에 표시되는 툴팁의 화살표 방향 조정 */
      #chart-tutorial + div .react-joyride__tooltip {
        position: relative;
        z-index: 10001 !important;
      }
      
      /* 차트 튜토리얼 스팟라이트 조정 */
      #chart-tutorial {
        position: relative !important;
        z-index: 1 !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      // 컴포넌트 언마운트 시 스타일 태그 제거
      const styleToRemove = document.getElementById('joyride-custom-styles');
      if (styleToRemove) styleToRemove.remove();
    };
  }, [stepIndex, steps.length]);

  // 투어 시작 시 더미 화면 표시
  useEffect(() => {
    if (run) {
      setShowDemo(true);
    } else {
      // 투어가 종료된 후에도 잠시 동안 컴포넌트를 표시(UI 깜빡임 방지)
      const timer = setTimeout(() => {
        setShowDemo(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [run]);

  // 튜토리얼 버튼 클릭 핸들러
  const handleTutorialButtonClick = () => {
    // 더미 구현이므로 아무 동작도 하지 않습니다
  };

  useEffect(() => {
    // 투어 스텝 정의
    setSteps([
      {
        target: 'body',
        content: (
          <div className="p-4">
            <h2 className="mb-8 text-[25px] font-bold">
              안녕하세요! <br />
              주식 튜토리얼에 오신 것을 환영합니다.
            </h2>
            <p className="animate-fadeIn text-[18px]">실제 주식 차트와 데이터를 기반으로</p>
            <p className="animate-fadeIn text-[18px]">
              주식 투자를 안전하게 경험해 볼 수 있습니다.
            </p>
            <br />
            <p className="animate-fadeIn text-[18px]">
              해당 도움말을 통해 주요 기능을 소개해 드리겠습니다.
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
          <div className="p-2">
            <h2 className="mb-5 text-[25px] font-bold">변곡점 설명</h2>
            <div className="mb-8 flex justify-center">
              <img src={PointExplainImg} alt="변곡점 설명" className="w-[600px] max-w-[100%]" />
            </div>
            <p className="text-[18px]">변곡점이란 주가의 흐름 중에서 상승에서 하락으로,</p>
            <p className="text-[18px]">혹은 하락에서 상승으로 전환되는 지점을 말합니다.</p>
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
        target: '#stock-tutorial-info',
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
        target: '#stock-tutorial-money-info',
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
        target: '#stock-progress',
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
        target: '#chart-tutorial',
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
        placement: 'top',
      },
      {
        target: '#stock-tutorial-order',
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
        target: '#stock-tutorial-comment',
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
        target: '#day-history',
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
        target: '#stock-tutorial-news',
        content: (
          <div className="p-4">
            <h2 className="mb-5 text-[25px] font-bold">교육용 뉴스</h2>
            <p className="text-[18px]">각 변곡점의 주요 뉴스를 제공합니다.</p>
            <p className="mt-2 text-[18px]">실제 뉴스가 주가에 어떤 영향을 미쳤는지 학습하세요.</p>
          </div>
        ),
        disableBeacon: true,
        placement: 'bottom',
        spotlightClicks: true,
      },
      {
        target: '#stock-tutorial-conclusion',
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
            <h2 className="mb-7 animate-bounce text-[25px] font-bold">도움말을 마칩니다!</h2>
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
    const { status, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    // 단계 변경 시에만 인덱스 업데이트 (조건 변경)
    if (type === 'step:after') {
      setStepIndex(index + 1); // 다음 스텝으로 명시적 설정

      // 다음 스텝이 특정 컴포넌트를 대상으로 할 경우 스크롤 조정
      if (steps[index + 1] && steps[index + 1].target && steps[index + 1].target !== 'body') {
        setTimeout(() => {
          const targetElement = document.querySelector(steps[index + 1].target as string);
          if (targetElement && showDemo) {
            const container = document.querySelector('.tour-modal-container');
            if (container) {
              const targetRect = targetElement.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();

              // 컨테이너 내 스크롤 계산 (타겟이 컨테이너 중앙에 오도록)
              const scrollPosition =
                targetRect.top +
                window.scrollY -
                containerRect.top -
                containerRect.height / 2 +
                targetRect.height / 2;

              (container as HTMLElement).scrollTo({
                top: Math.max(0, scrollPosition),
                behavior: 'smooth',
              });
            }
          }
        }, 50);
      }
    } else if (type === 'tour:start') {
      setStepIndex(0); // 투어 시작 시 명시적으로 0으로 설정
    }

    if (finishedStatuses.includes(status as string)) {
      setRun(false);
    }
  };

  return (
    <>
      {/* 투어 컴포넌트 */}
      <Joyride
        key="tutorial-joyride"
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep={false}
        showProgress
        showSkipButton
        steps={steps}
        stepIndex={stepIndex}
        spotlightClicks
        disableOverlayClose
        spotlightPadding={10}
        hideBackButton={true}
        floaterProps={{
          disableAnimation: false,
          offset: 0,
          styles: {
            floater: {
              filter: 'none',
              zIndex: 10001,
            },
          },
        }}
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
            width: '650px',
            padding: '20px',
          },
          buttonNext: {
            backgroundColor: '#5676F5',
            color: '#ffffff',
          },
          buttonBack: {
            display: 'none',
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
          skip: '종료',
        }}
      />

      {/* 데모 화면 - 투어 실행 시에만 표시 */}
      {showDemo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80">
          <div
            className="tour-modal-container scrollbar-hide w-full max-w-[1400px] overflow-y-auto"
            style={{ maxHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}
          >
            <div className="mx-auto w-full max-w-[1400px] rounded-xl bg-background-color p-8">
              <h1 className="mb-8 text-center text-[30px] font-bold">주식 튜토리얼 가이드</h1>

              <div className="flex h-full w-full flex-col">
                <div
                  className="stock-tutorial-info mb-8 flex items-center justify-between"
                  id="stock-tutorial-info"
                >
                  <StockTutorialInfo
                    companyId={dummyCompanyInfo.companyId}
                    isTutorialStarted={isTutorialStarted}
                    onTutorialStart={handleTutorialButtonClick}
                    onMoveToNextTurn={handleTutorialButtonClick}
                    currentTurn={currentTurn}
                    isCurrentTurnCompleted={isCurrentTurnCompleted}
                    latestPrice={latestPrice}
                    showButtonInInfoSection={false}
                  />
                </div>
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:justify-between">
                  <div
                    className="stock-tutorial-money-info w-full md:w-5/12"
                    id="stock-tutorial-money-info"
                  >
                    <StockTutorialMoneyInfo
                      initialAsset={dummyMoneyInfo.initialAsset}
                      availableOrderAsset={dummyMoneyInfo.availableOrderAsset}
                      currentTotalAsset={dummyMoneyInfo.currentTotalAsset}
                      totalReturnRate={dummyMoneyInfo.totalReturnRate}
                    />
                  </div>
                  <div className="stock-progress w-full md:w-7/12" id="stock-progress">
                    <StockProgress
                      progress={progress}
                      currentTurn={currentTurn}
                      startDate={getTurnDateRange(currentTurn).start}
                      endDate={getTurnDateRange(currentTurn).end}
                      formatDateFn={formatYYMMDDToYYYYMMDD}
                      pointDates={pointDates}
                      defaultStartDate={defaultStartDate}
                      defaultEndDate={defaultEndDate}
                    />
                  </div>
                </div>
                <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="col-span-1 h-full lg:col-span-9">
                    <div
                      className="chart-tutorial relative h-[520px] rounded-xl bg-[#0D192B] text-white"
                      id="chart-tutorial"
                    >
                      <ChartComponent
                        periodData={dummyDailyChartDataConverted}
                        inflectionPoints={inflectionPoints}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 h-full lg:col-span-3">
                    <div
                      className="stock-tutorial-order h-[520px] rounded-xl bg-modal-background-color p-4"
                      id="stock-tutorial-order"
                    >
                      <TutorialOrderStatusBuy
                        onBuy={(price, quantity) => console.log('가상 매수:', price, quantity)}
                        companyId={dummyCompanyInfo.companyId}
                        latestPrice={latestPrice}
                        availableOrderAsset={dummyMoneyInfo.availableOrderAsset}
                        ownedStockCount={10}
                        isActive={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-[45px] grid grid-cols-6 gap-6">
                  <div className="stock-tutorial-comment col-span-3" id="stock-tutorial-comment">
                    <StockTutorialComment
                      comment={dummyAIComment}
                      isTutorialStarted={isTutorialStarted}
                    />
                  </div>
                  <div className="day-history col-span-3" id="day-history">
                    <DayHistory
                      news={dummyPastNews}
                      height={320}
                      isTutorialStarted={isTutorialStarted}
                    />
                  </div>
                </div>
                <div className="mt-[35px] grid grid-cols-6 gap-6">
                  <div className="stock-tutorial-news col-span-4" id="stock-tutorial-news">
                    <StockTutorialNews
                      currentNews={dummyNewsData}
                      companyId={dummyCompanyInfo.companyId}
                      currentTurn={currentTurn}
                    />
                  </div>
                  <div
                    className="stock-tutorial-conclusion col-span-2"
                    id="stock-tutorial-conclusion"
                  >
                    <StockTutorialConclusion trades={dummyTradeRecord} isCompleted={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
