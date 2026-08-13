import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import SocialCallbackPage from './pages/Login/SocialCallbackPage';
import NotificationSettingsPage from './pages/NotificationSettings/NotificationSettingsPage';
import ArchivingPage from './pages/Archiving/ArchivingPage';
import Home from './pages/Home/HomePage';
import CurationPage from './pages/Curating/CurationPage';
import Detail from './pages/Curating/Detail';
import InsightPage1 from './pages/Insight/InsightPage1';
import MoreInfoPage from './pages/Insight/MoreInfo';
import WritePage from './pages/WritePage/WritePage';
import SignPage from './pages/SignPage';
import FindIdPage from './pages/FindAccount/FindIdPage';
import FindPasswordPage from './pages/FindAccount/FindPasswordPage';
import OnboardingAcademicInfo from './pages/OnBoarding/OnboardingAcademicInfo';
import OnboardingHouseholdInfo from './pages/OnBoarding/OnboardingHouseholdInfo';
import OnboardingComplete from './pages/OnBoarding/OnboardingComplete';
import MyPage from './pages/MyPage';
import EditProfile from './pages/EditProfile';
import EditProfileEmail from './pages/EditProfileEmail';
import './App.css';

import Complete from './pages/WritePage/Complete';

function App() {
  return (
    <Routes>
      {/* 홈 */}
      <Route path="/" element={<Home />} />

      {/* 로그인 */}
      <Route path="/login" element={<LoginPage />} />
      {/* 소셜 로그인 콜백 (:provider = kakao/google/naver)
          경로는 서버 설정(KAKAO_REDIRECT_URI 등)과 반드시 동일해야 함 */}
      <Route path="/auth/:provider/callback" element={<SocialCallbackPage />} />
      {/* 회원가입 */}
      <Route path="/sign" element={<SignPage />} />
      {/* 계정 찾기 (로그인 전). 아이디 = 가입 이메일 */}
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />

      {/* 알림 설정 (헤더 알림창 톱니바퀴에서 진입) */}
      <Route path="/notifications/settings" element={<NotificationSettingsPage />} />

      {/* 아카이빙 (내 장학금 보관함) */}
      <Route path="/archiving" element={<ArchivingPage />} />

      {/* 큐레이션 목록 */}
      <Route path="/curation" element={<CurationPage />} />
      {/* 장학금 상세 (:id는 장학금 식별자) */}
      <Route path="/curation/:id" element={<Detail />} />

      {/* 자기소개서 작성 */}
      <Route path="/write/:applicationId" element={<WritePage />} />
      <Route path="/complete/:applicationId" element={<Complete />} />

      {/* 이메일 수정하기*/}
      <Route path="/mypage/edit-email" element={<EditProfileEmail />} />

      {/* 온보딩 1: 학적 정보 */}
      <Route path="/onboarding" element={<OnboardingAcademicInfo />} />

      {/* 인사이트 */}
      <Route path="/insight" element={<InsightPage1 />} />
      {/* 인사이트 - 참고하면 좋아요 */}
      <Route path="/insight/reference" element={<MoreInfoPage />} />

      {/* 온보딩 1: 학적 정보 */}
      <Route path="/onboarding" element={<OnboardingAcademicInfo />} />
      {/* 온보딩 2: 가구 정보 */}
      <Route path="/onboarding/household" element={<OnboardingHouseholdInfo />} />
      {/* 온보딩 3: 완료 */}
      <Route path="/onboarding/complete" element={<OnboardingComplete />} />

      {/* 프로필 수정하기 */}
      <Route path="/mypage/edit" element={<EditProfile />} />

      {/* 마이페이지 */}
      <Route path="/mypage" element={<MyPage />} />
    </Routes>
  );
}

export default App;
