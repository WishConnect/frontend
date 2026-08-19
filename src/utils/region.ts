import type { Region } from '../types/region';

// 거주지역 객체를 화면에 보여줄 한 줄짜리 문자열로 만든다.
// 시군구면 "서울 중구", 시도만이면 "서울", 값이 없으면 빈 문자열.
//
// 서버로 보낼 때도 같은 형식을 쓴다 — 요청 DTO(SignupRequest·ProfileBasicRequest)의 region 은
// 여전히 문자열 하나이고, RegionResolver 가 "시도 시군구" 조합을 가장 먼저 보기 때문이다.
export function formatRegionLabel(region: Region | null | undefined): string {
  if (!region) return '';
  return region.parentName ? `${region.parentName} ${region.name}` : region.name;
}
