// pages/Curation/CurationPage.tsx
import { useSearchParams } from 'react-router-dom';
import GuestCurationPage from './GuestCurationPage';
import MemberCurationPage from './MemberCurationPage';
import CurationSearchPage from './CurationSearch';
import { useUserStore } from '../../store/user/user';

export default function CurationPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';

  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  if (keyword) {
    return <CurationSearchPage query={keyword} isLoggedIn={isLoggedIn} />;
  }

  if (!isLoggedIn) {
    return <GuestCurationPage />;
  }

  return <MemberCurationPage isLoggedIn={isLoggedIn} />;
}
