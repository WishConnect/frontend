import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { RegionItem } from '../../types/common/region';

// 거주지역 목록 조회. 가입 화면에서 쓰므로 서버도 인증 없이 열어뒀다(SecurityConfig permitAll).
// 서버가 이름순으로 정렬해서 준다.
export async function getRegions(): Promise<RegionItem[]> {
  const res = await api.get<ApiResponse<RegionItem[]>>('/regions');
  return res.data.data;
}

// 특정 시도의 시군구 목록 조회. 시도 목록에서 고른 항목의 regionId 를 넘긴다.
// 세종특별자치시는 하위 행정구역이 없어 빈 배열이 정상이다(서버 주석 기준).
//
// 2026-08-19 한때 전 시도 500 이 났었다(Region.parent 가 LAZY 인데 컨트롤러가 트랜잭션 밖이라
// getParent().getName() 에서 터졌다). 백엔드 2672955 에서 @EntityGraph 로 부모까지 함께
// 조회하도록 고쳐져 지금은 정상이다. 그래도 실패는 화면에 드러내는 편이 낫다 —
// 조용히 빈 목록이 되면 "원래 시군구가 없는 지역"과 구분되지 않는다.
export async function getSigunguList(regionId: number): Promise<RegionItem[]> {
  const res = await api.get<ApiResponse<RegionItem[]>>(`/regions/${regionId}/children`);
  return res.data.data;
}
