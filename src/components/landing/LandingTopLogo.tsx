import { useEffect, useState } from 'react';
import logo from '../../assets/landing/logo.png';

// 로고가 놓이는 자리(화면 왼쪽 135px, 위 24px, 188x32). 이 사각형이 어두운 영역과 겹치는지 본다.
// 135px은 히어로의 3D 오브젝트가 오른쪽 벽과 벌어진 간격이다(좌우 여백을 맞추려고 같은 값을 쓴다).
const LOGO_LEFT = 135;
const LOGO_RIGHT = LOGO_LEFT + 188;
const LOGO_TOP = 24;
const LOGO_BOTTOM = LOGO_TOP + 32;

/**
 * 화면 위에 계속 떠 있는 로고.
 *
 * 랜딩은 어두운 구간(히어로·문제제기·시장현황 카드)과 흰 구간이 번갈아 나오는데,
 * 로고가 고정되어 있으면 흰 구간에서 흰 로고가 안 보이고, 어두운 구간에서 보라 로고가 묻힌다.
 * 그래서 로고 뒤에 어두운 영역이 깔려 있는 동안에만 흰색으로 바꾼다.
 *
 * 어두운 영역은 각 섹션에 붙여둔 data-landing-dark 속성으로 찾는다.
 * (섹션 목록을 여기에 좌표로 적어두면 위쪽 섹션 높이가 바뀔 때마다 같이 고쳐야 한다)
 */
export default function LandingTopLogo() {
    const [isOnDark, setIsOnDark] = useState(true);

    useEffect(() => {
        const darkAreas = Array.from(document.querySelectorAll<HTMLElement>('[data-landing-dark]'));

        const update = () => {
            // 가로도 함께 본다. 시장현황 카드는 화면 가운데 1312px짜리라, 넓은 화면에서는
            // 로고가 카드 왼쪽 바깥(흰 배경)에 놓인다. 세로만 보면 그때도 흰 로고가 돼 안 보인다.
            const overlapped = darkAreas.some((area) => {
                const rect = area.getBoundingClientRect();
                const overlapsY = rect.top < LOGO_BOTTOM && rect.bottom > LOGO_TOP;
                const overlapsX = rect.left < LOGO_RIGHT && rect.right > LOGO_LEFT;
                return overlapsY && overlapsX;
            });
            setIsOnDark(overlapped);
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <img
            src={logo}
            alt="위시커넥트"
            /* 화면 왼쪽에서 135px. 히어로 문구도 같은 값이라 두 요소의 왼쪽 세로선이 나란하다.
               (화면 가운데 1440px 상자 기준이 아니라 화면 기준이라, 넓은 화면에서도 왼쪽에 붙는다) */
            className={`fixed left-[135px] top-[24px] z-50 h-[32px] w-[188px] transition-[filter] duration-300 ${
                /* 보라 로고를 흰색으로 바꾼다. 색을 지운 뒤(brightness-0) 반전(invert)시키는 방식이라
                   흰색 버전 이미지를 따로 두지 않아도 된다. */
                isOnDark ? 'brightness-0 invert' : ''
            }`}
        />
    );
}
