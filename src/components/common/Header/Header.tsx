import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import BackButton from './BackButton';
import Notification from './Notification';
import NotificationPanel from './NotificationPanel';
import AuthButtons from './AuthButtons';
import logo from '../../../assets/logo.svg';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { getUnreadNotificationCount } from '../../../api/notification/count';
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
  // const hasUnread = useNotificationStore((state) => state.unreadCount() > 0);
  const handleNotificationClick = onNotificationClick ?? togglePanel;
  // 로고 클릭 시 기본은 홈(/)으로 이동, 페이지에서 onLogoClick으로 재정의 가능
  const handleLogoClick = onLogoClick ?? (() => navigate('/'));

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return; 

    const fetchNotificationCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setHasUnread(count > 0);
      } catch (error) {
        console.error("알림 개수 연동 실패:", error);
      }
    };

    fetchNotificationCount();
  }, [isLoggedIn]);

  // logoOnly / isLoggedIn / isSearchMode 조합에 따라 헤더 우측 영역 내용을 결정
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

  // 스크롤을 내려도 상단바가 화면 위에 붙어 있게 고정한다.
  // sticky가 아니라 fixed를 쓰는 이유 — sticky는 부모 박스 밖으로 못 나가서
  // 루트에 h-[1024px] 같은 고정 높이를 준 페이지에선 그만큼만 붙어 있다가 딸려 올라간다.
  // fixed는 화면(뷰포트) 기준이라 페이지 파일을 안 고쳐도 전 페이지에서 동일하게 동작한다.
  // z-50: 스크롤된 본문이 헤더 위로 겹쳐 그려지지 않도록 페이지 드롭다운(z-40)보다 높게 둠
  return (
    <>
      <header className="bg-white w-full h-[80px] fixed top-0 left-0 z-50">

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

      {/* 위 헤더가 fixed라 문서 흐름에서 빠져 있으므로, 헤더 높이만큼 자리를 대신 채운다.
          이게 없으면 모든 페이지 내용이 80px 위로 올라가 헤더에 가려진다.
          shrink-0: 루트가 flex-col인 페이지에서 이 칸이 찌그러지지 않게 방지 */}
      <div className="h-[80px] shrink-0" aria-hidden="true" />
    </>
  );
}
