import Header from '../../components/common/Header/Header';
import LoginForm from '../../components/login/LoginForm';
import SocialLogin from '../../components/login/SocialLogin';

// 로그인 페이지 — Figma node 1314:2713
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header logoOnly />
      <div className="w-[596px] mx-auto mt-[144px] flex flex-col gap-[52px]">
        <LoginForm />
        <SocialLogin />
      </div>
    </div>
  );
}
