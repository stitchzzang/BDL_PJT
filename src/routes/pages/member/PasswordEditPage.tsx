import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useUpdateMemberPassword } from '@/api/member.api';
import { QuestionsCombobox } from '@/components/member-info/questions-combo-box';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

// 비밀번호 변경 폼 유효성 검사를 위한 스키마 정의
const passwordEditSchema = z
  .object({
    newPassword: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type PasswordEditFormValues = z.infer<typeof passwordEditSchema>;

export const PasswordEditPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // form 관련 설정
  const form = useForm<PasswordEditFormValues>({
    resolver: zodResolver(passwordEditSchema),
    defaultValues: {
      newPassword: '',
      passwordConfirm: '',
    },
    mode: 'onChange',
  });

  // 폼 필드의 유효성 검사 결과
  const {
    formState: { isValid, errors, dirtyFields },
  } = form;

  // 모든 필드가 수정되었고 유효성 검사가 통과되었는지 확인
  const passwordFieldsFilled = dirtyFields.newPassword && dirtyFields.passwordConfirm;

  const formIsValidAndFilled = isValid && passwordFieldsFilled && question && answer;

  // 처음 로드 시 모든 필드 검증 실행
  useEffect(() => {
    form.trigger();
  }, [form]);

  const onSubmit = (data: PasswordEditFormValues) => {
    updateMemberPassword();
  };

  const { mutate: updateMemberPassword } = useUpdateMemberPassword({
    memberId: userData.memberId?.toString() ?? '',
    data: {
      question,
      answer,
      newPassword: form.getValues().newPassword,
    },
    navigateTo: () => navigate('/member'),
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="mb-4 text-2xl font-bold">비밀번호 수정</h1>
      <div className="flex min-w-[400px] flex-col items-center gap-5 rounded-2xl border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-center gap-4"
          >
            <div className="w-full">
              <h1 className="mb-2 w-full text-left text-lg font-bold text-primary-color">
                질문 및 답변
              </h1>
              <QuestionsCombobox
                onSelect={(selectedQuestion) => setQuestion(selectedQuestion.toString())}
              />
            </div>

            <div className="w-full">
              <Input
                type="text"
                placeholder="답변을 입력해주세요."
                className="h-14"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <h1 className="w-full text-left text-lg font-bold text-primary-color">비밀번호</h1>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => {
                  const isValid = !errors.newPassword && dirtyFields.newPassword;
                  const hasError = !!errors.newPassword && dirtyFields.newPassword;
                  return (
                    <FormItem className="w-full">
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="새로운 비밀번호를 입력해주세요."
                            className="h-14 pr-10"
                            {...field}
                          />
                        </FormControl>
                        {isValid && (
                          <CheckCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-green-color" />
                        )}
                        {hasError && (
                          <XCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-red-color" />
                        )}
                      </div>
                      <p className="text-xs text-text-main-color">
                        비밀번호는 최소 8자 이상이어야 합니다.
                      </p>
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => {
                  const isValid = !errors.passwordConfirm && dirtyFields.passwordConfirm;
                  const hasError = !!errors.passwordConfirm && dirtyFields.passwordConfirm;
                  return (
                    <FormItem className="w-full">
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="비밀번호를 확인해주세요."
                            className="h-14 pr-10"
                            {...field}
                          />
                        </FormControl>
                        {isValid && (
                          <CheckCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-green-color" />
                        )}
                        {hasError && (
                          <XCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-red-color" />
                        )}
                      </div>
                      {dirtyFields.passwordConfirm && (
                        <FormMessage
                          className={cn(
                            'text-xs',
                            hasError
                              ? 'text-btn-red-color'
                              : isValid
                                ? 'text-btn-green-color'
                                : 'text-text-main-color',
                          )}
                        >
                          {hasError
                            ? '비밀번호가 일치하지 않습니다.'
                            : isValid
                              ? '비밀번호가 일치합니다.'
                              : '비밀번호와 정확히 일치해야 합니다.'}
                        </FormMessage>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>
            <Button
              type="submit"
              variant="blue"
              className="m-4 w-full"
              disabled={!formIsValidAndFilled}
            >
              비밀번호 변경
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
