import { QuestionsCombobox } from '@/components/member-info/questions-combo-box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const PasswordEditPage = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="mb-4 text-2xl font-bold">비밀번호 수정</h1>
      <div className="flex min-w-[400px] flex-col items-center gap-5 rounded-2xl border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <div className="flex w-full flex-col items-center gap-4">
          <QuestionsCombobox />
          <Input type="text" placeholder="답변을 입력해주세요." className="h-14" />
          <Input type="password" placeholder="새로운 비밀번호를 입력해주세요." className="h-14" />
          <Input type="password" placeholder="비밀번호를 확인해주세요." className="h-14" />
        </div>
        <Button variant="blue" className="m-4 w-full">
          비밀번호 변경
        </Button>
      </div>
    </div>
  );
};
