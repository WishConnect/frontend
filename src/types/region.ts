/** 거주 지역 마스터 조회 항목 */
export interface Region {
  regionId: number;
  name: string;
  parentName: string | null;
}
