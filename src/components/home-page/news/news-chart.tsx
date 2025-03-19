import { NewsChartMain } from '@/components/home-page/news/news-chart-main';
import { NewsChartSub } from '@/components/home-page/news/news-chart-sub';

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
      <div className="mb-[12px] inline-block rounded-xl bg-modal-background-color px-[12px] py-[8px]">
        <div className="rounded-xl bg-btn-blue-color bg-opacity-40 p-[12px]">
          <h3 className="text-[16px]">현재뉴스</h3>
        </div>
      </div>
      <div>
        <div>
          <NewsChartMain newsMainInfo={NewsLists[0]} />
        </div>
        <div>
          <NewsChartSub newsSubInfo={NewsLists[1]} />
        </div>
      </div>
    </div>
  );
};
