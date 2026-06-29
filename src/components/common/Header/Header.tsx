import SearchBar from './SearchBar';
import BackButton from './BackButton';
import Notification from './Notification';
import logo from '../../../assets/logo.svg';

interface HeaderProps {
  searchPlaceholder?: string;
  isSearchMode?: boolean;
  onSearch?: (query: string) => void;
  onBack?: () => void;
  onNotificationClick?: () => void;
}

// GNB 상단바 — 피그마 수치 기준 (1440px 기준 설계)
export default function Header({
  searchPlaceholder,
  isSearchMode = false,
  onSearch,
  onBack,
  onNotificationClick,
}: HeaderProps) {
  return (
    <header className="bg-white w-full h-[80px] relative">

      {/* 로고 — left: 64px, top: 24px, h: 32px */}
      <img
        src={logo}
        alt="WISHCONNECT"
        className="absolute left-[64px] top-[24px] h-[32px]"
      />

      {isSearchMode ? (
        <>
          {/* 돌아가기 상태 — left: 333px, top: 30px */}
          <div className="absolute left-[333px] top-[30px]">
            <BackButton onClick={onBack} />
          </div>
          <div className="absolute right-[64px] top-[24px]">
            <Notification onClick={onNotificationClick} />
          </div>
        </>
      ) : (
        /* 기본 상태 — 검색바 + 벨을 right: 64px에 수직 중앙 */
        <div className="absolute right-[64px] top-1/2 -translate-y-1/2 flex items-center gap-[32px]">
          <SearchBar placeholder={searchPlaceholder} onSearch={onSearch} />
          <Notification onClick={onNotificationClick} />
        </div>
      )}

    </header>
  );
}
