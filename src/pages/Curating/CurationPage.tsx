import { useSearchParams } from 'react-router-dom';
import GuestCurationPage from './GuestCurationPage';
import MemberCurationPage from './MemberCurationPage';
import CurationSearchPage from './CurationSearch';

export default function CurationPage() {
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') ?? '';

  const isLoggedIn = true;

  if (keyword) {
    return <CurationSearchPage query={keyword} isLoggedIn={isLoggedIn} />;
  }

  if (!isLoggedIn) {
    return <GuestCurationPage />;
  }

  return <MemberCurationPage isLoggedIn={isLoggedIn} />;
}
