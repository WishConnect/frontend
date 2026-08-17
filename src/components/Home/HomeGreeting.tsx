import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Profile from '../../assets/icons/Profile.svg';
import Mypage from '../../assets/icons/HomeMypage.svg';
import Logout from '../../assets/icons/logout.svg';

import { logout } from '../../api/login/auth';
import { useUserStore } from '../../store/user/user';
import { tokenStorage } from '../../utils/token';

interface HomeGreetingProps {
  isLoggedIn: boolean;
  name?: string;
}

export default function HomeGreeting({ isLoggedIn, name }: HomeGreetingProps) {
  const navigate = useNavigate();

  const clearUser = useUserStore((state) => state.clearUser);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMyPage = () => {
    setIsProfileOpen(false);
    navigate('/mypage');
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);

    try {
      await logout();
    } catch {
      // 서버 로그아웃 실패 여부와 관계없이
      // 클라이언트 로그인 정보는 제거
    } finally {
      clearUser();
      tokenStorage.clearTokens();
      navigate('/login');
    }
  };

  return (
    <div className="relative flex items-start justify-between">
      {/* 왼쪽 인사말 */}
      <div>
        <h1 className="h-[52px] text-[40px] font-bold leading-[52px] text-[#10131A]">
          안녕하세요
          {isLoggedIn && name && (
            <>
              , <span className="text-[#7962ED]">{name}</span>
              <span>님!</span>
            </>
          )}
        </h1>

        <p className="mt-[4px] h-[24px] text-[16px] font-medium leading-[24px] text-[#555964]">
          오늘의 장학금을 확인해보세요.
        </p>
      </div>

      {/* 오른쪽 프로필 */}
      {isLoggedIn && (
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex h-[40px] w-[40px] items-center justify-center"
            aria-label="프로필 메뉴"
          >
            <img src={Profile} alt="프로필" className="h-[40px] w-[40px]" />
          </button>

          {/* 프로필 드롭다운 */}
          {isProfileOpen && (
            <div className="absolute right-0 top-[48px] z-50 h-[141px] w-[151px] overflow-hidden rounded-[16px] border border-[#D2D4DA] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              {/* 마이페이지 */}
              <button
                type="button"
                onClick={handleMyPage}
                className="flex h-[70px] w-full items-center gap-[12px] px-[24px] text-[16px] font-medium text-[#747883] hover:bg-[#F7F7F8]"
              >
                <img src={Mypage} alt="" className="h-[20px] w-[20px]" />

                <span className="whitespace-nowrap">마이페이지</span>
              </button>

              {/* 구분선 */}
              <div className="mx-[12px] h-px bg-[#D2D4DA]" />

              {/* 로그아웃 */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-[69px] w-full items-center gap-[12px] px-[24px] text-[16px] font-medium text-[#FF5A65] hover:bg-[#FFF5F6]"
              >
                <img src={Logout} alt="" className="h-[20px] w-[20px]" />

                <span className="whitespace-nowrap">로그아웃</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
