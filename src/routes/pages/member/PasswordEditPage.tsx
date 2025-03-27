import { useState } from 'react';

import { useUpdateMemberPassword } from '@/api/member.api';
import { QuestionsCombobox } from '@/components/member-info/questions-combo-box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const PasswordEditPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { mutate: updateMemberPassword } = useUpdateMemberPassword({
    memberId: '1',
    data: {
      question,
      answer,
      newPassword,
    },
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="mb-4 text-2xl font-bold">비밀번호 수정</h1>
      <div className="flex min-w-[400px] flex-col items-center gap-5 rounded-2xl border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <div className="flex w-full flex-col items-center gap-4">
          <QuestionsCombobox onSelect={(selectedQuestion) => setQuestion(selectedQuestion)} />
          <Input
            type="text"
            placeholder="답변을 입력해주세요."
            className="h-14"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Input
            type="password"
            placeholder="새로운 비밀번호를 입력해주세요."
            className="h-14"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호를 확인해주세요."
            className="h-14"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button variant="blue" className="m-4 w-full" onClick={() => updateMemberPassword()}>
          비밀번호 변경
        </Button>
      </div>
    </div>
  );
};
