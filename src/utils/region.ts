import type { Region } from '../types/region';

// 2026-08-19 백엔드 개편(539c0ae)으로 GET /users/me/profile, GET /users/me 의 region이
// 문자열에서 객체로 바뀔 예정이었지만, 실제로는 GET /users/me가 아직 이전 문자열 포맷
// ("제주 제주시")을 그대로 준다(같은 날 F12로 직접 확인). 두 포맷이 섞여 오는 동안 깨지지
// 않도록, 문자열이 오면 공백 기준으로 시도/시군구를 나눠 Region과 같은 모양으로 맞춘다.
export function normalizeRegion(region: Region | string | null | undefined): Region | null {
  if (!region) return null;
  if (typeof region !== 'string') return region;

  const [sido, ...rest] = region.trim().split(' ');
  if (!sido) return null;
  const sigungu = rest.join(' ');
  return sigungu
    ? { regionId: -1, name: sigungu, parentName: sido }
    : { regionId: -1, name: sido, parentName: null };
}

// 거주지역을 화면에 보여줄 한 줄짜리 문자열로 만든다.
// 시군구면 "서울 중구", 시도만이면 "서울", 값이 없으면 빈 문자열.
//
// 서버로 보낼 때도 같은 형식을 쓴다 — 요청 DTO(SignupRequest·ProfileBasicRequest)의 region 은
// 여전히 문자열 하나이고, RegionResolver 가 "시도 시군구" 조합을 가장 먼저 보기 때문이다.
export function formatRegionLabel(region: Region | string | null | undefined): string {
  const normalized = normalizeRegion(region);
  if (!normalized) return '';
  return normalized.parentName ? `${normalized.parentName} ${normalized.name}` : normalized.name;
}
