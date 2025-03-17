export const SectionNavBar = () => {
  return (
    <nav className="flex flex-row gap-2">
      <button className="rounded-lg px-4 py-2 text-[18px] text-text-border-color hover:bg-modal-background-color hover:text-text-main-color active:bg-modal-background-color active:text-text-main-color">
        투자 교육 결과
      </button>
      <button className="rounded-lg px-4 py-2 text-[18px] text-text-border-color hover:bg-modal-background-color hover:text-text-main-color active:bg-modal-background-color active:text-text-main-color">
        알고리즘
      </button>
      <button className="rounded-lg px-4 py-2 text-[18px] text-text-border-color hover:bg-modal-background-color hover:text-text-main-color active:bg-modal-background-color active:text-text-main-color">
        투자 리포트
      </button>
    </nav>
  );
};
