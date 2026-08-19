import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { RegionItem } from '../../types/common/region';

// 거주지역 목록 조회. 가입 화면에서 쓰므로 서버도 인증 없이 열어뒀다(SecurityConfig permitAll).
// 서버가 이름순으로 정렬해서 준다.
export async function getRegions(): Promise<RegionItem[]> {
  const res = await api.get<ApiResponse<RegionItem[]>>('/regions');
  return res.data.data;
}
