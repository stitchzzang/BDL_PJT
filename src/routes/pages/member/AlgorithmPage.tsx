import { MyAlgorithmItem } from '@/components/member-info/my-algorithm-item';

export const AlgorithmPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-4">
      <div className="w-full">
        <h1 className="text-2xl font-bold">알고리즘</h1>
        <hr className="my-3 w-full border-t border-btn-primary-inactive-color" />
        <MyAlgorithmItem />
        <MyAlgorithmItem />
        <MyAlgorithmItem />
      </div>
    </div>
  );
};
