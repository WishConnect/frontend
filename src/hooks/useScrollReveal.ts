import { useEffect, useRef, useState } from 'react';

/**
 * 요소가 화면에 들어왔는지 알려주는 훅. 랜딩의 "스크롤하면 나타나는" 효과에 쓴다.
 *
 * 한 번 보이면 관찰을 멈춘다. 위아래로 스크롤할 때마다 다시 사라졌다 나타나면
 * 읽는 흐름이 끊기고 산만하기 때문이다.
 *
 * 사용자가 OS에서 "동작 줄이기"를 켜둔 경우에는 애니메이션 없이 바로 보이게 한다.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      // 요소가 조금 올라온 뒤에 시작해야 자연스럽다(화면 맨 아래에서 바로 켜지면 놓치기 쉽다).
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
