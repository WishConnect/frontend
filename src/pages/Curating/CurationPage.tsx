import { useSearchParams } from 'react-router-dom';
import GuestCurationPage from './GuestCurationPage';
import MemberCurationPage from './MemberCurationPage';
import CurationSearchPage from './CurationSearch';

export default function CurationPage() {
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') ?? '';

  const isLoggedIn = true;

  if (keyword) {
    return <CurationSearchPage query={keyword} />;
  }

  // TODO: 게스트/회원 페이지 분기는 아직 하드코딩. 헤더는 유저 스토어를 따라가지만 본문 분기는 그대로임
  if (!isLoggedIn) {
    return <GuestCurationPage />;
  }

  return <MemberCurationPage />;
}
