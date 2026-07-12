import SearchBar from './SearchBar';
import BackButton from './BackButton';
import Notification from './Notification';
import NotificationPanel from './NotificationPanel';
import AuthButtons from './AuthButtons';
import logo from '../../../assets/logo.svg';
import { useNotificationStore } from '../../../store/useNotificationStore';

interface HeaderProps {
  searchPlaceholder?: string;
  searchInitialValue?: string;
  isSearchMode?: boolean;
  isLoggedIn?: boolean;
  logoOnly?: boolean;
  onSearch?: (query: string) => void;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

// GNB 상단바 — 피그마 수치 기준 (1440px 기준 설계)
export default function Header({
  searchPlaceholder,
  searchInitialValue,
  isSearchMode = false,
  isLoggedIn = true,
  logoOnly = false,
  onSearch,
  onBack,
  onNotificationClick,
  onLoginClick,
  onSignupClick,
}: HeaderProps) {
  const togglePanel = useNotificationStore((state) => state.togglePanel);
  const hasUnread = useNotificationStore((state) => state.unreadCount() > 0);
  const handleNotificationClick = onNotificationClick ?? togglePanel;

  // logoOnly / isLoggedIn / isSearchMode 조합에 따라 헤더 우측 영역 내용을 결정
  let content = null;

  if (!logoOnly) {
    if (!isLoggedIn) {
      // 비로그인 상태 — 검색바 또는 뒤로가기 버튼 + 로그인/회원가입 버튼을 left: 333px ~ right: 64px 사이에 정렬
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
              className="flex-1 min-w-0"
            />
          )}
          <AuthButtons onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
        </div>
      );
    } else if (isSearchMode) {
      content = (
        <>
          {/* 돌아가기 상태 — left: 333px, top: 30px */}
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
      // 기본 상태 — 검색바 + 벨을 left: 333px ~ right: 64px 사이에서 수직 중앙 정렬, 검색바는 남는 폭만큼 늘어남
      content = (
        <>
          <div className="absolute left-[333px] right-[64px] top-1/2 -translate-y-1/2 flex items-center gap-[32px]">
            <SearchBar
              placeholder={searchPlaceholder}
              initialValue={searchInitialValue}
              onSearch={onSearch}
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
    <header className="bg-white w-full h-[80px] relative">

      {/* 로고 — left: 64px, top: 24px, h: 32px */}
      <img
        src={logo}
        alt="WISHCONNECT"
        className="absolute left-[64px] top-[24px] h-[32px]"
      />

      {content}

    </header>
  );
}
