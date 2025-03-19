import { NewsChartMain } from '@/components/home-page/news/news-chart-main';

export interface NewsList {
  imgUrl: string | null;
  title: string;
  subject: string;
}

const NewsLists: NewsList[] = [
  {
    imgUrl: null,
    title: 'AI 신흥강자 브로드컴 호실적, 월가 강세 전망 강화…주가 8%↑',
    subject: '뉴스내용 뉴스내용 뉴스내용 뉴스내용 뉴스내용 뉴스내용 뉴스내용 ',
  },
  {
    imgUrl: null,
    title: 'AI 신흥강자 브로드컴 호실적, 월가 강세 전망 강화…주가 8%↑',
    subject: '뉴스내용 뉴스내용 뉴스내용 뉴스내용 뉴스내용 뉴스내용 뉴스내용 ',
  },
];

export const NewsChart = () => {
  return (
    <div>
      <div>
        <NewsChartMain />
      </div>
    </div>
  );
};
