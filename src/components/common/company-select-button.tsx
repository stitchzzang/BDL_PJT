export const CompanySelectButton = () => {
  return (
    <button className="min-h-[60px] min-w-[200px] rounded-[20px] border border-btn-primary-inactive-color bg-modal-background-color p-5 hover:bg-transparent active:bg-transparent sm:min-w-[600px]">
      <div className="flex flex-row items-center gap-4">
        <img
          src="https://placehold.co/50x50"
          alt="company-identifier"
          className="h-[50px] w-[50px] rounded-xl"
        />
        <p className="text-base">회사명</p>
      </div>
    </button>
  );
};
