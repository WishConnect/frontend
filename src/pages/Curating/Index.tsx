import GuestCurationPage from './GuestCurationPage';
import MemberCurationPage from './MemberCurationPage';

export default function CurationPage() {
  const isLoggedIn = false;
  const isOnboarded = false;

  if (!isLoggedIn) {
    return <GuestCurationPage />;
  }

  return <MemberCurationPage isOnboarded={isOnboarded} />;
}
