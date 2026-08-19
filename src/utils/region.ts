import type { Region } from '../types/region';

// 거주지역 표기 규칙.
//
// 시군구까지 저장했으면 "서울 중구", 시도만이면 "서울" 형식이다(백엔드 UserProfileService.toRegionName).
// 시군구 이름만으로는 특정할 수 없어서(중구는 6개 시도에 있다) 상위 시도를 항상 함께 붙인다.
//
// ⚠️ 2026-08-19 하루 사이 응답이 문자열 → 객체 → 다시 문자열로 두 번 뒤집혔고, 엔드포인트마다
//    반영 시점이 달라 한동안 두 포맷이 섞여 왔다. 그래서 읽기 경로는 어느 쪽이 와도 깨지지 않게
//    normalizeRegion 으로 한 번 통일한 뒤 쓴다. 요청 DTO(SignupRequest·ProfileBasicRequest)는
//    처음부터 문자열 하나뿐이라 보낼 땐 joinRegionLabel 로 합쳐서 보낸다.

/** 문자열이든 객체든 Region 한 가지 모양으로 맞춘다. 값이 없으면 null. */
export function normalizeRegion(region: Region | string | null | undefined): Region | null {
  if (!region) return null;
  if (typeof region !== 'string') return region;

  // 앞 한 토막이 시도, 나머지가 시군구다. "경기 성남시 분당구"처럼 시군구가 두 단어인 경우가
  // 있어서 뒤에서 자르면 안 된다(뒤에서 자르면 시도가 "경기 성남시"가 되어버린다).
  const [sido, ...rest] = region.trim().replace(/\s+/g, ' ').split(' ');
  if (!sido) return null;
  const sigungu = rest.join(' ');
  return sigungu
    ? { regionId: -1, name: sigungu, parentName: sido }
    : { regionId: -1, name: sido, parentName: null };
}

// 거주지역을 화면에 보여줄 한 줄짜리 문자열로 만든다.
// 시군구면 "서울 중구", 시도만이면 "서울", 값이 없으면 빈 문자열.
export function formatRegionLabel(region: Region | string | null | undefined): string {
  const normalized = normalizeRegion(region);
  if (!normalized) return '';
  return normalized.parentName ? `${normalized.parentName} ${normalized.name}` : normalized.name;
}

/** 시도/시군구를 서버로 보낼 한 줄로 합친다. 시군구가 없으면 시도만 보낸다. */
export function joinRegionLabel(sido: string, sigungu: string): string {
  const trimmedSido = sido.trim();
  const trimmedSigungu = sigungu.trim();
  return trimmedSigungu ? `${trimmedSido} ${trimmedSigungu}` : trimmedSido;
}

/**
 * 서버가 준 지역을 시도/시군구 입력칸 두 개로 나눠 담는다(EditProfile 폼 채우기용).
 *
 * 값이 없으면 둘 다 빈 문자열 — 임의의 지역으로 채우지 않고 사용자가 직접 고르게 둔다.
 */
export function splitRegionLabel(raw: Region | string | null | undefined): {
  region: string;
  sigungu: string;
} {
  const normalized = normalizeRegion(raw);
  if (!normalized) return { region: '', sigungu: '' };

  return normalized.parentName
    ? { region: normalized.parentName, sigungu: normalized.name }
    : { region: normalized.name, sigungu: '' };
}
