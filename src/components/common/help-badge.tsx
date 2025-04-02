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
  description: string | React.ReactNode;
  bgColor?: string;
}) => {
  const descriptionParts =
    typeof description === 'string' ? description.split('\n\n') : [description];

  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-2xl border border-btn-primary-inactive-color p-5 ${bgColor}`}
    >
      <p className="text-lg font-bold">{title}</p>
      <div className="flex flex-col gap-2">
        {descriptionParts.map((part, index) => (
          <>
            <p
              key={index}
              className={`whitespace-pre-line text-sm ${index > 0 ? 'text-btn-primary-active-color' : ''}`}
            >
              {part}
            </p>
            {index < descriptionParts.length - 1 && (
              <hr className="my-1 border-btn-primary-active-color" />
            )}
          </>
        ))}
      </div>
    </div>
  );
};
