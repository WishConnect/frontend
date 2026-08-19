import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import { useUserStore } from '../../store/user/user';
import { hasSeenLanding } from '../../utils/landingVisit';

/**
 * "/" 로 들어왔을 때 랜딩을 보여줄지 홈을 보여줄지 결정한다.
 *
 * 랜딩은 접속당 한 번만 보여주고, 이미 로그인한 사용자는 매번 소개를 거칠 이유가 없어 바로 홈으로 보낸다.
 * 주소를 /landing 으로 바꿔서 이동하므로, 그 화면에서 새로고침해도 랜딩이 그대로 유지된다.
 *
 * "봤다"는 기록은 랜딩 화면(LandingPage)이 직접 남긴다.
 * 여기서 남기면 /landing 으로 바로 들어온 사람은 기록이 없어, 시작하기를 눌러도 다시 랜딩으로 돌아온다.
 */
export default function HomeEntry() {
    // 판단은 처음 한 번만 한다. 화면을 보는 도중 로그인 상태가 바뀌었다고 화면이 뒤바뀌면 곤란하다.
    const [showLanding] = useState(() => {
        if (useUserStore.getState().isLoggedIn) return false;
        return !hasSeenLanding();
    });

    // replace: 뒤로가기로 "/"에 돌아왔을 때 다시 /landing 으로 튕기는 왕복을 막는다.
    if (showLanding) return <Navigate to="/landing" replace />;

    // 나타나는 연출은 App에서 모든 화면에 공통으로 걸어둬서 여기서는 따로 하지 않는다.
    return <HomePage />;
}
