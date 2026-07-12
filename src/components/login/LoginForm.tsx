import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import { useAuthStore } from '../../store/useAuthStore';

// 로그인 폼 — 이메일/비밀번호 입력, 로그인 버튼, 계정 찾기/회원가입 링크
export default function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[24px]">
        <h1 className="text-[28px] leading-[40px] font-bold tracking-[-0.01em] text-center text-[#0A0C11]">
          로그인
        </h1>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="h-[64px] px-[24px] py-[12px] bg-[#F3F4F6] rounded-lg text-base font-medium text-[#0A0C11] placeholder:text-[#747883] outline-none"
        />

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="h-[64px] px-[24px] py-[12px] bg-[#F3F4F6] rounded-lg text-base font-medium text-[#0A0C11] placeholder:text-[#747883] outline-none"
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          weight="bold"
          width="100%"
          className="!bg-[linear-gradient(139deg,#7962ED_30%,#BDB9F9_100%)]"
        >
          로그인
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" className="text-base font-medium text-[#747883] underline">
          아이디/비밀번호 찾기
        </button>
        <button type="button" className="text-base font-medium text-[#747883] underline">
          회원가입
        </button>
      </div>
    </form>
  );
}
