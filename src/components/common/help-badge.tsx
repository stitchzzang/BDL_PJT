// 도움말 배지 ui
// title: 제목
// description: 설명
// bgColor: 배경색

export const HelpBadge = ({
  title,
  description,
  bgColor = 'bg-modal-background-color',
}: {
  title: string;
  description: string;
  bgColor?: string;
}) => {
  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-2xl border border-btn-primary-inactive-color p-5 ${bgColor}`}
    >
      <p className="text-lg font-bold">{title}</p>
      <p className="whitespace-pre-line text-sm">{description}</p>
    </div>
  );
};
