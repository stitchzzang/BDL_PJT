import React from 'react';

import { AutoTermTooltip, TermTooltip } from '@/components/ui/TermTooltip';

/**
 * 금융 용어 툴팁 사용 예시 컴포넌트
 */
export const TermExample: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">개별 용어 툴팁 사용 예시</h2>
        <p className="text-gray-700">
          이 페이지에서는 <TermTooltip term="코스피">코스피</TermTooltip>와{' '}
          <TermTooltip term="코스닥">코스닥</TermTooltip> 데이터를 확인할 수 있습니다.
        </p>
        <p className="text-gray-700">
          <TermTooltip term="현재가" side="top">
            <span className="font-medium text-blue-500">현재가</span>
          </TermTooltip>
          와{' '}
          <TermTooltip term="등락률" side="top">
            <span className="font-medium text-red-500">등락률</span>
          </TermTooltip>
          을 분석하여 투자 결정에 참고하세요.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">자동 용어 감지 툴팁 예시</h2>
        <div className="rounded-md bg-gray-100 p-4">
          <AutoTermTooltip
            text="코스피와 코스닥 시장의 현재가, 등락률, 거래대금을 확인하여 투자 전략을 수립하세요. 
            알고리즘 LAB에서는 이익률과 손절매, 청산 전략을 실험해볼 수 있습니다."
            className="text-gray-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">카테고리별 용어 예시</h2>

        <div className="rounded-md bg-blue-50 p-4">
          <h3 className="mb-2 font-medium">주식 튜토리얼 용어</h3>
          <p className="text-gray-700">
            <AutoTermTooltip text="기업 코드를 확인하고 변곡점을 분석하여 시드머니를 효율적으로 운용하세요." />
          </p>
        </div>

        <div className="rounded-md bg-green-50 p-4">
          <h3 className="mb-2 font-medium">모의 주식 용어</h3>
          <p className="text-gray-700">
            <AutoTermTooltip
              text="종가, 시가, 고가, 저가의 패턴을 분석하고 거래량 추이를 확인하세요. 
              상장시가총액과 액면가도 중요한 참고 지표입니다."
            />
          </p>
        </div>

        <div className="rounded-md bg-purple-50 p-4">
          <h3 className="mb-2 font-medium">마이페이지 용어</h3>
          <p className="text-gray-700">
            <AutoTermTooltip text="평가금과 원금을 비교하여 수익률을 확인하고, 1주 평균 금액을 참고하여 추가 매수 여부를 결정하세요." />
          </p>
        </div>
      </div>
    </div>
  );
};
