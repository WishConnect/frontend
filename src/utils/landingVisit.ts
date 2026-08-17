// 이번 접속에서 랜딩을 봤는지 기록한다.
//
// localStorage가 아니라 sessionStorage인 이유: 브라우저를 껐다 켜면 다시 보여주기로 했다(2026-08-17 결정).
//   - 같은 탭에서 새로고침(F5) → 유지되므로 홈에 있다가 랜딩으로 튕기지 않는다
//   - 탭을 닫고 새로 열거나 브라우저를 재실행 → 다시 랜딩부터
// 크롬의 '이전 세션 복원'이나 탭 복제로 열면 이 값도 함께 복원돼 랜딩을 건너뛴다(브라우저 동작).
//
// 저장소 접근이 막힌 환경(일부 브라우저 설정)에서는 "이미 봤다"고 답한다.
// 기록을 남길 수 없는데 계속 보여주면 홈으로 갈 방법이 없어지기 때문이다.
const LANDING_SEEN_KEY = 'wishconnect:landing-seen';

export function hasSeenLanding(): boolean {
  try {
    return sessionStorage.getItem(LANDING_SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

export function markLandingSeen(): void {
  try {
    sessionStorage.setItem(LANDING_SEEN_KEY, '1');
  } catch {
    // 기록에 실패해도 화면 동작은 그대로 진행한다.
  }
}
