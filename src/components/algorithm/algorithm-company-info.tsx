import { CompanyProfile } from '@/api/types/algorithm';
import { CategoryName, getCategoryIcon } from '@/utils/categoryMapper';

interface AlgorithmCompanyInfoProps {
  companyProfile: CompanyProfile | null;
}

export const AlgorithmCompanyInfo = ({ companyProfile }: AlgorithmCompanyInfoProps) => {
  return (
    <div className="flex animate-fadeIn items-center">
      <div className="flex w-full items-start gap-[20px] sm:items-center">
        <div className="flex w-full items-center gap-3">
          <div className="max-h-[50px] max-w-[50px] overflow-hidden rounded-xl">
            {/* 이미지 */}
            <img src={companyProfile?.companyImage} alt="stock-icon" />
          </div>
          <div className="flex w-full flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-medium text-white">{companyProfile?.companyName}</h3>
              <p className="text-[14px] font-light text-border-color">
                {companyProfile?.companyCode}
              </p>
            </div>
            <div className="flex w-full flex-col items-start justify-start gap-[18px] sm:flex-row sm:items-center sm:justify-between">
              <div className="ite flex flex-col gap-1 sm:flex-row">
                <div className="flex items-center justify-center gap-[15px] rounded-lg border border-border-color border-opacity-20 bg-modal-background-color p-1">
                  {companyProfile?.categories.map((name: CategoryName, index) => {
                    const IconComponent = getCategoryIcon(name);
                    return (
                      <div
                        className="flex min-h-[25px] min-w-[25px] items-center justify-center gap-1"
                        key={index}
                      >
                        <div className="h-4 w-4">
                          {IconComponent ? (
                            <div className="h-4 w-4">
                              <IconComponent />
                            </div>
                          ) : (
                            <div className="h-4 w-4">{/* 기본 아이콘 또는 빈 요소 */}</div>
                          )}
                        </div>
                        <p className="text-[12px] text-border-color">{name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
