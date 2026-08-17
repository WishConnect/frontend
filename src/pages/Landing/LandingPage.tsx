import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHero from '../../components/landing/LandingHero';
import LandingProblem from '../../components/landing/LandingProblem';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingStats from '../../components/landing/LandingStats';
import LandingSteps from '../../components/landing/LandingSteps';
import LandingStartButton from '../../components/landing/LandingStartButton';
import LandingTopLogo from '../../components/landing/LandingTopLogo';
import { markLandingSeen } from '../../utils/landingVisit';

/**
 * 랜딩페이지 (Figma 1175:1493 + 1175:1546).
 * 첫 화면(히어로)에서 아래로 스크롤하면 문제제기 → 기능 소개 → 시장 현황 → 이용 흐름이 이어진다.
 *
 * 내용은 다른 화면과 같은 1440px 기준으로 두되, 배경(그라디언트·사진)은 화면 폭을 꽉 채운다.
 * 그래서 각 섹션이 "배경은 w-full, 내용은 mx-auto w-[1440px]" 구조를 공통으로 가진다.
 * 섹션에 min-w-[1440px]을 함께 주는 이유: 1440보다 좁은 화면에서 가로 스크롤을 했을 때
 * 배경이 뷰포트 폭에서 끊겨 흰 여백이 드러나는 걸 막기 위해서다.
 */
// 홈으로 넘어가기 전 화면이 사라지는 시간. 아래 duration-500과 같은 값이어야 한다.
const LEAVE_DURATION_MS = 500;

export default function LandingPage() {
    const navigate = useNavigate();
    // 버튼을 누르면 바로 이동하지 않고, 화면이 부드럽게 사라진 뒤에 이동한다.
    const [isLeaving, setIsLeaving] = useState(false);
    const leaveTimer = useRef<number | null>(null);

    const handleStart = () => {
        if (isLeaving) return; // 연타로 타이머가 여러 개 걸리는 걸 막는다

        // "동작 줄이기"를 켠 사용자에게는 연출 없이 바로 이동한다.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            navigate('/');
            return;
        }

        setIsLeaving(true);
        leaveTimer.current = window.setTimeout(() => navigate('/'), LEAVE_DURATION_MS);
    };

    // 연출 도중 뒤로가기 등으로 화면을 떠나면 타이머를 정리한다(이미 없는 화면에서 이동이 일어나지 않게).
    useEffect(() => {
        return () => {
            if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
        };
    }, []);

    // 랜딩을 봤다는 기록은 이 화면에서 남긴다. "/"에서 넘어온 경우든 /landing 으로 바로 들어온 경우든
    // 똑같이 기록돼야, 시작하기를 눌렀을 때 홈이 다시 랜딩으로 돌려보내지 않는다.
    useEffect(() => {
        markLandingSeen();
    }, []);

    // 이 화면에서만 스크롤바를 숨긴다(스크롤 자체는 그대로 된다).
    // index.css는 팀 규칙상 건드리지 않기로 해서 페이지에서 직접 넣고 빼는 방식으로 처리했다.
    // 다른 화면으로 이동하면 원래 값으로 되돌린다.
    useEffect(() => {
        const root = document.documentElement;
        const previous = root.style.scrollbarWidth;
        root.style.scrollbarWidth = 'none';

        return () => {
            root.style.scrollbarWidth = previous;
        };
    }, []);

    return (
        /* 떠날 때 전체가 서서히 흐려진다. transform(scale 등) 대신 opacity만 쓰는 이유:
           transform을 주면 fixed로 띄운 로고·버튼의 기준이 이 요소로 바뀌어 위치가 튄다. */
        <div
            className={`w-full bg-white font-['Pretendard'] transition-opacity duration-500 ease-out ${
                isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
        >
            {/* 로고는 스크롤과 무관하게 화면 위에 붙어 있고, 뒤 배경 밝기에 따라 색이 바뀐다 */}
            <LandingTopLogo />

            <LandingHero />
            <LandingProblem />
            <LandingFeatures />
            <LandingStats />
            <LandingSteps />

            {/* 시작하기 버튼은 스크롤과 무관하게 화면 아래에 계속 떠 있는다.
                섹션이 아니라 페이지에 두는 이유: 특정 섹션 소속이 아니라 화면에 붙는 요소라서다. */}
            <LandingStartButton onStart={handleStart} />
        </div>
    );
}
