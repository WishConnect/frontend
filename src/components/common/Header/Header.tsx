import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import BackButton from './BackButton';
import Notification from './Notification';
import NotificationPanel from './NotificationPanel';
import AuthButtons from './AuthButtons';
import logo from '../../../assets/logo.svg';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useUserStore } from '../../../store/user/user';

interface HeaderProps {
  searchPlaceholder?: string;
  searchInitialValue?: string;
  isSearchMode?: boolean;
  /** 로그인 여부. 안 넘기면 useUserStore의 실제 로그인 상태를 따라감 (넘기면 강제 지정) */
  isLoggedIn?: boolean;
  logoOnly?: boolean;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
  onBack?: () => void;
  onLogoClick?: () => void;
  onNotificationClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

// GNB 상단바: 피그마 수치 기준 (1440px 기준 설계)
export default function Header({
  searchPlaceholder,
  searchInitialValue,
  isSearchMode = false,
  isLoggedIn,
  logoOnly = false,
  onSearch,
  onQueryChange,
  onBack,
  onLogoClick,
  onNotificationClick,
  onLoginClick,
  onSignupClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const togglePanel = useNotificationStore((state) => state.togglePanel);
  const hasUnread = useNotificationStore((state) => state.unreadCount() > 0);
  const handleNotificationClick = onNotificationClick ?? togglePanel;
  // 로고 클릭 시 기본은 홈(/)으로 이동, 페이지에서 onLogoClick으로 재정의 가능
  const handleLogoClick = onLogoClick ?? (() => navigate('/'));

  // 실제 로그인 여부: prop이 있으면 그 값 우선, 없으면 전역 유저 스토어를 따라감
  const storeLoggedIn = useUserStore((state) => state.isLoggedIn);
  const loggedIn = isLoggedIn ?? storeLoggedIn;

  // 로그인/회원가입 버튼 기본 동작 (페이지에서 prop으로 재정의 가능)
  const handleLoginClick = onLoginClick ?? (() => navigate('/login'));
  const handleSignupClick = onSignupClick ?? (() => navigate('/sign'));

  // logoOnly / loggedIn / isSearchMode 조합에 따라 헤더 우측 영역 내용을 결정
  let content = null;

  if (!logoOnly) {
    if (!loggedIn) {
      // 비로그인 상태: 검색바 또는 뒤로가기 버튼 + 로그인/회원가입 버튼을 left: 333px ~ right: 64px 사이에 정렬
      content = (
        <div
          className={`absolute left-[333px] right-[64px] top-1/2 -translate-y-1/2 flex items-center ${
            isSearchMode ? 'justify-between' : 'gap-[32px]'
          }`}
        >
          {isSearchMode ? (
            <BackButton onClick={onBack} />
          ) : (
            <SearchBar
              placeholder={searchPlaceholder}
              initialValue={searchInitialValue}
              onSearch={onSearch}
              onQueryChange={onQueryChange}
              className="flex-1 min-w-0"
            />
          )}
          <AuthButtons onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
        </div>
      );
    } else if (isSearchMode) {
      content = (
        <>
          {/* 돌아가기 상태 (left: 333px, top: 30px) */}
          <div className="absolute left-[333px] top-[30px]">
            <BackButton onClick={onBack} />
          </div>
          <div className="absolute right-[64px] top-[24px]">
            <Notification onClick={handleNotificationClick} isActive={hasUnread} />
          </div>
          <NotificationPanel />
        </>
      );
    } else {
      // 기본 상태: 검색바 + 벨을 left: 333px ~ right: 64px 사이에서 수직 중앙 정렬, 검색바는 남는 폭만큼 늘어남
      content = (
        <>
          <div className="absolute left-[333px] right-[64px] top-1/2 -translate-y-1/2 flex items-center gap-[32px]">
            <SearchBar
              placeholder={searchPlaceholder}
              initialValue={searchInitialValue}
              onSearch={onSearch}
              onQueryChange={onQueryChange}
              className="flex-1 min-w-0"
            />
            <Notification onClick={handleNotificationClick} isActive={hasUnread} />
          </div>
          <NotificationPanel />
        </>
      );
    }
  }

  return (
    <header className="bg-white w-full h-[80px] relative z-20">

      {/* 로고 (left: 64px, top: 24px, h: 32px), 클릭 시 홈 이동 */}
      <button
        type="button"
        onClick={handleLogoClick}
        aria-label="홈으로 이동"
        className="absolute left-[64px] top-[24px] cursor-pointer"
      >
        <img src={logo} alt="WISHCONNECT" className="h-[32px]" />
      </button>

      {content}

    </header>
  );
}
