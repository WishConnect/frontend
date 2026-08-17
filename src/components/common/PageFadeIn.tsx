import { useEffect, useState, type ReactNode } from 'react';

/**
 * 화면이 처음 그려질 때 부드럽게 나타나게 감싸는 껍데기.
 * App에서 Routes 전체를 감싸고 있어 페이지를 옮길 때마다 적용된다(경로를 key로 줘서 다시 마운트됨).
 *
 * transform이 아니라 opacity만 쓴다. transform을 주면 안에 있는 fixed 요소(헤더 등)의
 * 기준이 이 요소로 바뀌어 위치가 어긋난다.
 *
 * 300ms인 이유: 화면마다 데이터를 받아 그리는 곳이 많아서, 길게 잡으면
 * 페이드가 끝나기도 전에 내용이 채워지며 두 번 깜빡이는 것처럼 보인다.
 */
export default function PageFadeIn({ children }: { children: ReactNode }) {
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        // 첫 페인트 다음 프레임에 켜야 전환이 실제로 보인다(같은 프레임에 바꾸면 그냥 나타난다).
        const frame = requestAnimationFrame(() => setIsShown(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div className={`transition-opacity duration-300 ease-out ${isShown ? 'opacity-100' : 'opacity-0'}`}>
            {children}
        </div>
    );
}
