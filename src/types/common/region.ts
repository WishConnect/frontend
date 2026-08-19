// 거주지역 마스터 (GET /api/v1/regions).
// 2026-08-17 백엔드 신설. 그 전까지 region 테이블이 비어 있어서 가입 시 거주지역이 전 건 NULL로
// 저장됐다(프론트가 보낸 이름과 매칭할 대상이 아예 없었음).
export interface RegionItem {
  regionId: number;
  name: string; // "서울", "경기" 처럼 짧은 이름으로 온다("서울특별시" 아님)
  parentName: string | null; // 지금은 시도만 있어 전부 null. 시군구가 생기면 상위 시도 이름이 온다
}
