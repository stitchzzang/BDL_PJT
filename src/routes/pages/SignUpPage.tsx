import { CalendarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { useSignup } from '@/api/auth.api';
import { SignupRequest } from '@/api/types/auth';
import { QuestionsCombobox } from '@/components/member-info/questions-combo-box';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// 회원가입 폼 유효성 검사를 위한 스키마 정의
const signUpSchema = z
  .object({
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    passwordConfirm: z.string(),
    nickname: z
      .string()
      .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
      .max(5, '닉네임은 최대 5자까지 가능합니다.')
      .refine((value) => /^[가-힣a-zA-Z0-9]+$/.test(value), {
        message: '특수문자 및 자음/모음은 사용할 수 없습니다.',
      }),
    birthDate: z.date(),
    phoneNumber: z.string().optional(),
    question: z.number().min(1, '질문을 선택해주세요.'),
    answer: z.string().min(1, '답변을 입력해주세요.').max(10, '답변은 최대 10자까지 가능합니다.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { mutate: signup } = useSignup();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      nickname: '',
      birthDate: new Date(),
      phoneNumber: '',
      question: 0,
      answer: '',
    },
    mode: 'onChange', // 입력값이 변경될 때마다 유효성 검사 수행
  });

  // 폼 필드의 유효성 검사 결과
  const {
    formState: { isValid, errors, dirtyFields },
  } = form;

  // 모든 필드가 수정되었고 유효성 검사가 통과되었는지 확인
  const allFieldsFilled =
    dirtyFields.email &&
    dirtyFields.password &&
    dirtyFields.passwordConfirm &&
    dirtyFields.nickname &&
    dirtyFields.question &&
    dirtyFields.answer;

  const formIsValidAndFilled = isValid && allFieldsFilled;

  // 처음 로드 시 모든 필드 검증 실행
  useEffect(() => {
    // 모든 필드에 대해 검증 트리거
    form.trigger();
  }, [form]);

  const onSubmit = (data: SignUpFormValues) => {
    const signupRequest: SignupRequest = {
      email: data.email,
      password: data.password,
      nickname: data.nickname,
      question: data.question,
      answer: data.answer,
    };

    signup(signupRequest, {
      onSuccess: () => {
        navigate('/signup/success');
      },
      onError: (error) => {
        toast.error('회원가입에 실패했습니다.');
      },
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="mb-5 text-3xl font-bold">회원가입</h1>
      <div className="w-full max-w-96 rounded-lg bg-modal-background-color p-6 shadow-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-center gap-3"
          >
            <h1 className="w-full text-left text-lg font-bold text-primary-color">이메일</h1>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const isValid = !errors.email && dirtyFields.email;
                const hasError = !!errors.email && dirtyFields.email;
                return (
                  <FormItem className="w-full">
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="이메일" className="h-12 pr-10" {...field} />
                      </FormControl>
                      {isValid && (
                        <CheckCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-green-color" />
                      )}
                      {hasError && (
                        <XCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-red-color" />
                      )}
                    </div>
                    <p className="text-sm text-text-main-color">
                      이메일은 example@domain.com 형식이어야 합니다.
                    </p>
                  </FormItem>
                );
              }}
            />
            <hr className="w-full border-none" />
            <div className="flex w-full flex-col gap-2">
              <h1 className="w-full text-left text-lg font-bold text-primary-color">비밀번호</h1>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  const isValid = !errors.password && dirtyFields.password;
                  const hasError = !!errors.password && dirtyFields.password;
                  return (
                    <FormItem className="w-full">
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="비밀번호"
                            className="h-12 pr-10"
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
                      <p className="text-sm text-text-main-color">
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
                            placeholder="비밀번호 확인"
                            className="h-12 pr-10"
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
                            'text-sm',
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
            <hr className="w-full border-none" />
            <div className="flex w-full flex-col gap-1">
              <h1 className="w-full text-left text-lg font-bold text-primary-color">닉네임</h1>
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => {
                  const isValid = !errors.nickname && dirtyFields.nickname;
                  const hasError = !!errors.nickname && dirtyFields.nickname;
                  return (
                    <FormItem className="w-full">
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="닉네임 작성" className="h-12 pr-10" {...field} />
                        </FormControl>
                        {isValid && (
                          <CheckCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-green-color" />
                        )}
                        {hasError && (
                          <XCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-red-color" />
                        )}
                      </div>
                      <p className="text-sm text-text-main-color">
                        닉네임은 2자 이상 5자 이하여야 하며,
                      </p>
                      <span className="text-sm text-text-main-color">
                        특수문자 및 자음/모음은 사용할 수 없습니다.
                      </span>
                    </FormItem>
                  );
                }}
              />
            </div>
            <hr className="w-full border-none" />
            <div className="flex w-full flex-col gap-1">
              <h1 className="w-full text-left text-lg font-bold text-primary-color">생년월일</h1>
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="생년월일"
                              className="h-12 pr-10"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                if (!isNaN(date.getTime())) {
                                  field.onChange(date);
                                }
                              }}
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-border-color" />
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-fit p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            // 날짜 선택 후 팝오버 닫기
                            setCalendarOpen(false);
                          }}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          className="w-auto"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          initialFocus
                          defaultMonth={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-text-main-color">1900년 이후만 가능합니다.</p>
                  </FormItem>
                )}
              />
            </div>
            <hr className="w-full border-none" />
            <div className="flex w-full flex-col gap-2">
              <h1 className="w-full text-left text-lg font-bold text-primary-color">
                질문 및 답변
              </h1>
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <div className="relative">
                        <FormControl>
                          <QuestionsCombobox
                            onSelect={(question) => field.onChange(Number(question))}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => {
                  const isValid = !errors.answer && dirtyFields.answer;
                  const hasError = !!errors.answer && dirtyFields.answer;
                  return (
                    <FormItem className="w-full">
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="비밀번호 찾기 답변"
                            className="h-12 pr-10"
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
                      <p className="text-sm text-text-main-color">
                        답변은 1자 이상 10자 이하여야 합니다.
                      </p>
                    </FormItem>
                  );
                }}
              />
            </div>
            <Button
              type="submit"
              variant="blue"
              className="mt-5 w-full"
              disabled={!formIsValidAndFilled}
            >
              회원가입
            </Button>
          </form>
        </Form>
        <p className="mt-5 flex w-full flex-row items-baseline justify-end gap-2 text-center text-sm text-border-color">
          이미 회원이신가요?
          <button
            type="button"
            className="text-base font-semibold text-primary-color hover:text-primary-color/80"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
};
