import { NewsResponse } from '@/api/types/tutorial';

export interface DayHistoryCardProps {
  newsItem: NewsResponse;
}

export const DayHistoryCard = ({ newsItem }: DayHistoryCardProps) => {
  // 뉴스 아이템 유효성 검사
  if (!newsItem) {
    console.log('[DayHistoryCard] 뉴스 아이템이 null 또는 undefined입니다.');
    return null;
  }

  // 뉴스 데이터 디버깅
  console.log('[DayHistoryCard] 렌더링 중:', newsItem);

  // 변동률에 따른 스타일 결정
  const hasChangeRate = typeof newsItem.changeRate === 'number';
  const changeRate = hasChangeRate ? newsItem.changeRate : 0;
  const changeStyle = changeRate >= 0 ? 'text-btn-red-color' : 'text-btn-blue-color';
  const changeSymbol = changeRate >= 0 ? '+' : '';

  // 날짜 포맷팅 - YYYY-MM-DD 형식
  let formattedDate = '';
  try {
    if (newsItem.newsDate) {
      const date = new Date(newsItem.newsDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } else {
        formattedDate = '날짜 형식 오류';
        console.warn('[DayHistoryCard] 날짜 파싱 실패:', newsItem.newsDate);
      }
    } else {
      formattedDate = '날짜 없음';
      console.warn('[DayHistoryCard] 날짜 필드 없음:', newsItem);
    }
  } catch (error) {
    formattedDate = '날짜 없음';
    console.error('[DayHistoryCard] 날짜 처리 중 오류:', error);
  }

  // 뉴스 제목이 없는 경우 기본값 사용
  const title = newsItem.newsTitle || '제목 없음';

  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-btn-green-color bg-transparent px-6 py-3 text-btn-red-color shadow-sm transition-colors">
      <p className="mr-3 line-clamp-2 flex-1 font-bold text-white">{title}</p>
      <div className="ml-4 flex shrink-0 items-center whitespace-nowrap">
        {hasChangeRate && (
          <>
            <span className={`font-semibold ${changeStyle}`}>
              {changeSymbol}
              {changeRate.toFixed(2)}%
            </span>
            <span className="mx-3 text-white">|</span>
          </>
        )}
        <span className="text-white">{formattedDate}</span>
      </div>
    </div>
  );
};
