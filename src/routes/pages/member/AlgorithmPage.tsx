import { useGetAlgorithm } from '@/api/algorithm.api';
import { Algorithm } from '@/api/types/algorithm';
import { MyAlgorithmItem } from '@/components/member-info/my-algorithm-item';

export const AlgorithmPage = () => {
  const { data: algorithms } = useGetAlgorithm('1'); // 임시 1번 유저

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-4">
      <div className="w-full">
        <h1 className="text-2xl font-bold">알고리즘</h1>
        <hr className="my-3 w-full border-t border-btn-primary-inactive-color" />
        {algorithms && (
          <div className="flex flex-col gap-4">
            {algorithms.map((algorithm: Algorithm) => (
              <MyAlgorithmItem key={algorithm.algorithmId} algorithm={algorithm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
