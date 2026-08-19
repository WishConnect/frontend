import api from './axios';
import type { ApiResponse } from '../types/api';
import type { Region } from '../types/region';

// 거주 지역 1단계(시·도) 목록
export const getRegions = () => api.get<ApiResponse<Region[]>>('/regions');

// 선택한 시·도의 시·군·구 목록. 현재 화면은 시·도만 저장하지만,
// 시·군·구 선택 UI가 추가될 때 사용할 수 있도록 함께 제공합니다.
export const getRegionChildren = (regionId: number) =>
  api.get<ApiResponse<Region[]>>(`/regions/${regionId}/children`);
