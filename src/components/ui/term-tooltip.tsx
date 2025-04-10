import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getAllTermsList, getTermDefinition, TermDefinition } from '@/utils/tooltipTerms';

interface TermTooltipProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

/**
 * 금융 용어에 마우스를 올렸을 때 용어 설명이 보이는 툴팁 컴포넌트
 * @param term - 툴팁으로 보여줄 용어 키값
 * @param children - 툴팁 트리거로 사용할 컴포넌트 (없을 경우 용어 자체를 표시)
 * @param className - 툴팁 트리거에 적용할 클래스
 * @param side - 툴팁이 표시될 위치 ('top' | 'right' | 'bottom' | 'left')
 * @param sideOffset - 툴팁과 트리거 사이의 간격 (픽셀)
 */
export const TermTooltip: React.FC<TermTooltipProps> = ({
  term,
  children,
  className = '',
  side = 'bottom',
  sideOffset = 5,
}) => {
  const termDefinition: TermDefinition | undefined = getTermDefinition(term);

  if (!termDefinition) {
    // 정의가 없는 경우 그냥 children 또는 term 표시
    return <>{children || term}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={`inline-flex cursor-help items-center whitespace-nowrap ${className}`}
        >
          <span className="flex items-center">
            {children || term}
            <QuestionMarkCircleIcon className="mx-1 h-4 w-4 text-white" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} sideOffset={sideOffset}>
          <p className="whitespace-pre-line">{termDefinition.definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * 텍스트 내에서 등록된 금융 용어를 자동으로 툴팁으로 변환하는 컴포넌트
 * @param text - 변환할 텍스트
 * @param className - 텍스트에 적용할 클래스
 */
export const AutoTermTooltip: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  // 텍스트 내에서 등록된 용어들을 찾아 툴팁으로 변환
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // 모든 용어를 길이 내림차순으로 정렬하여 먼저 검색 (긴 용어가 짧은 용어를 포함할 수 있으므로)
  const allTerms = getAllTermsList().sort((a, b) => b.length - a.length);

  for (let i = 0; i < text.length; i++) {
    for (const term of allTerms) {
      if (text.substring(i, i + term.length) === term) {
        // 용어 앞 텍스트 추가
        if (i > lastIndex) {
          parts.push(text.substring(lastIndex, i));
        }

        // 용어 툴팁 추가
        parts.push(
          <TermTooltip key={`${term}-${i}`} term={term}>
            {term}
          </TermTooltip>,
        );

        lastIndex = i + term.length;
        i = lastIndex - 1; // 다음 문자부터 다시 검색하도록 인덱스 조정
        break;
      }
    }
  }

  // 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
