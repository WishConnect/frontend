// 거주지역 표기 규칙. 서버는 region 을 문자열 하나로 주고받는다.
//
// 시군구까지 저장했으면 "서울 중구", 시도만이면 "서울" 형식이다(백엔드 UserProfileService.toRegionName).
// 시군구 이름만으로는 특정할 수 없어서(중구는 6개 시도에 있다) 상위 시도를 항상 함께 붙인다.
//
// ⚠️ 2026-08-19 하루 사이 서버 응답이 문자열 → 객체 → 다시 문자열로 두 번 바뀌었다.
//    지금 형식은 문자열이며, 요청(SignupRequest·ProfileBasicRequest)도 처음부터 문자열이었다.

/** 시도/시군구를 서버로 보낼 한 줄로 합친다. 시군구가 없으면 시도만 보낸다. */
export function joinRegionLabel(sido: string, sigungu: string): string {
  const trimmedSido = sido.trim();
  const trimmedSigungu = sigungu.trim();
  return trimmedSigungu ? `${trimmedSido} ${trimmedSigungu}` : trimmedSido;
}

/**
 * 서버가 준 한 줄을 시도/시군구로 나눈다.
 *
 * 공백이 있으면 마지막 조각이 시군구다("서울 중구"). 조각이 하나면 시도만 저장한 것이다("서울").
 * 값이 없으면 둘 다 빈 문자열 — 임의의 지역으로 채우지 않고 사용자가 직접 고르게 둔다.
 */
export function splitRegionLabel(raw: string | null | undefined): {
  region: string;
  sigungu: string;
} {
  const value = (raw ?? '').trim().replace(/\s+/g, ' ');
  if (!value) return { region: '', sigungu: '' };

  const lastSpace = value.lastIndexOf(' ');
  if (lastSpace <= 0) return { region: value, sigungu: '' };

  return { region: value.slice(0, lastSpace), sigungu: value.slice(lastSpace + 1) };
}
