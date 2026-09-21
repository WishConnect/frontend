// pages/Curation/CurationPage.tsx
import { useSearchParams } from 'react-router-dom';
import GuestCurationPage from './GuestCurationPage';
import MemberCurationPage from './MemberCurationPage';
import CurationSearchPage from './CurationSearch';
import { useUserStore } from '../../store/user/user';
import { useEffect } from 'react';

export default function CurationPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';

  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  useEffect(() => {
    const meta = document.createElement('meta');

    meta.name = 'robots';
    meta.content = 'noindex,follow';

    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);
  if (keyword) {
    return <CurationSearchPage query={keyword} isLoggedIn={isLoggedIn} />;
  }

  if (!isLoggedIn) {
    return <GuestCurationPage />;
  }

  return <MemberCurationPage isLoggedIn={isLoggedIn} />;
}
