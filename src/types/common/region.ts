// 거주지역 마스터 (GET /api/v1/regions, GET /api/v1/regions/{regionId}/children).
// 2026-08-17 백엔드 신설. 그 전까지 region 테이블이 비어 있어서 가입 시 거주지역이 전 건 NULL로
// 저장됐다(프론트가 보낸 이름과 매칭할 대상이 아예 없었음).
//
// 2026-08-19: 시군구 228건이 추가되면서 2단계가 됐고, 프로필/마이페이지 조회 응답의 region 도
// 문자열이 아니라 이 모양의 객체로 바뀌었다(백엔드 539c0ae). 시군구는 이름만으로 특정할 수 없어서
// (중구는 6개 시도에 있다) 상위 시도를 같이 주는 것으로 정리됐다.
export interface RegionItem {
  regionId: number;
  name: string; // "서울"(시도) 또는 "중구"(시군구). 짧은 이름으로 온다("서울특별시" 아님)
  parentId: number | null; // 시군구면 상위 시도의 id, 시도면 null
  parentName: string | null; // 시군구면 상위 시도 이름("서울"), 시도면 null
}
