import { CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useSignup } from '@/api/auth.api';
import { SignupRequest } from '@/api/types/auth';
import { QuestionsCombobox } from '@/components/member-info/questions-combo-box';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SignUpFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  birthDate: Date;
  phoneNumber: string;
  question: number;
  answer: string;
}

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { mutate: signup } = useSignup();

  const form = useForm<SignUpFormValues>({
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
  });

  const onSubmit = (data: SignUpFormValues) => {
    if (data.password !== data.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

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
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-96 rounded-lg bg-modal-background-color p-6 shadow-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-center gap-3"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input placeholder="이메일" className="h-12" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input type="password" placeholder="비밀번호" className="h-12" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="비밀번호 확인"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input placeholder="닉네임 작성" className="h-12" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Popover>
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
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        className="w-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <QuestionsCombobox onSelect={(question) => field.onChange(Number(question))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input placeholder="비밀번호 찾기 답변" className="h-12" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" variant="blue" className="mt-5 w-full">
              회원가입
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
