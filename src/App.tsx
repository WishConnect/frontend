import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import NotificationSettingsPage from './pages/NotificationSettings/NotificationSettingsPage';
import ArchivingPage from './pages/Archiving/ArchivingPage';
import SearchPage from './pages/Search/SearchPage';
import Home from './pages/Home/HomePage';
import CurationPage from './pages/Curating/CurationPage';
import Detail from './pages/Curating/Detail';
import InsightPage1 from './pages/Insight/InsightPage1';
import MoreInfoPage from './pages/Insight/MoreInfo';
import WrtiePage from './pages/WritePage/WritePage';
import SignPage from './pages/SignPage';
import OnboardingAcademicInfo from './pages/OnBoarding/OnboardingAcademicInfo';
import OnboardingHouseholdInfo from './pages/OnBoarding/OnboardingHouseholdInfo';
import OnboardingComplete from './pages/OnBoarding/OnboardingComplete';
import './App.css';

function App() {
  return (
    <Routes>
      {/* 홈 */}
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
      <Route path="/archiving" element={<ArchivingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/sign" element={<SignPage />} />

      {/* 큐레이션 */}
      <Route path="/curation" element={<CurationPage />} />
      <Route path="/write" element={<WrtiePage />} />

      {/* 장학금 상세 */}
      <Route path="/curation/:id" element={<Detail />} />

      {/* 인사이트 */}
      <Route path="/insight" element={<InsightPage1 />} />

      {/* 참고하면 좋아요 */}
      <Route path="/insight/reference" element={<MoreInfoPage />} />

      {/* 온보딩 */}
      <Route path="/onboarding" element={<OnboardingAcademicInfo />} />
      <Route path="/onboarding/household" element={<OnboardingHouseholdInfo />} />
      <Route path="/onboarding/complete" element={<OnboardingComplete />} />
    </Routes>
  );
}

export default App;
