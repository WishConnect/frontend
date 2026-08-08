// 소셜 로그인(OAuth) 인가 요청 관련 유틸.
// 흐름: 버튼 클릭 → 여기서 만든 인가 URL로 이동 → 제공자가 code를 붙여 콜백으로 돌려보냄
//      → SocialCallbackPage가 그 code를 서버(/auth/{provider}/login)로 전달.

export type SocialProvider = 'kakao' | 'google' | 'naver';

// 각 제공자의 로그인(인가) 페이지 주소.
const AUTHORIZE_URLS: Record<SocialProvider, string> = {
  kakao: 'https://kauth.kakao.com/oauth/authorize',
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
  naver: 'https://nid.naver.com/oauth2.0/authorize',
};

// 브라우저에 노출돼도 되는 공개 식별자(Client ID). 카카오는 REST API 키를 사용한다.
// CLIENT_SECRET은 서버 전용이므로 프론트 .env에 절대 넣지 않는다.
const CLIENT_IDS: Record<SocialProvider, string | undefined> = {
  kakao: import.meta.env.VITE_KAKAO_CLIENT_ID,
  google: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  naver: import.meta.env.VITE_NAVER_CLIENT_ID,
};

// 구글은 요청할 정보 범위(scope)를 명시해야 이메일/이름을 받을 수 있다.
const SCOPES: Partial<Record<SocialProvider, string>> = {
  google: 'openid email profile',
};

// 화면에 표시할 이름 (에러 메시지 등에 사용).
export const PROVIDER_LABELS: Record<SocialProvider, string> = {
  kakao: '카카오',
  google: '구글',
  naver: '네이버',
};

// 콜백 주소. 서버 설정(KAKAO_REDIRECT_URI 등)이 "프론트도메인/auth/{provider}/callback" 규약이라
// 현재 접속 중인 origin에서 그대로 만들어 쓴다. 로컬/배포가 자동으로 갈리고 오타 위험도 없다.
// ⚠️ 각 제공자 콘솔에도 동일한 문자열이 등록돼 있어야 하며, 서버가 토큰 교환 시 보내는 값과도 일치해야 한다.
export function getRedirectUri(provider: SocialProvider): string {
  return `${window.location.origin}/auth/${provider}/callback`;
}

// state: CSRF 방지용 일회성 랜덤값. 네이버는 필수(백엔드가 검증), 나머지도 붙여두면 안전하다.
// sessionStorage에 보관했다가 콜백에서 돌아온 값과 비교한다(탭을 닫으면 자동 소멸).
const STATE_STORAGE_KEY = 'oauth_state';

function issueState(): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_STORAGE_KEY, state);
  return state;
}

// 콜백에서 1회만 꺼내 쓰고 즉시 폐기(재사용 방지).
export function consumeStoredState(): string | null {
  const state = sessionStorage.getItem(STATE_STORAGE_KEY);
  sessionStorage.removeItem(STATE_STORAGE_KEY);
  return state;
}

// 제공자별 인가 URL을 조립한다. Client ID가 없으면(=.env 미설정) 명확한 에러로 알린다.
export function buildAuthorizeUrl(provider: SocialProvider): string {
  const clientId = CLIENT_IDS[provider];

  if (!clientId) {
    throw new Error(
      `${PROVIDER_LABELS[provider]} Client ID가 설정되지 않았습니다. .env를 확인해 주세요.`,
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(provider),
    response_type: 'code',
    state: issueState(),
  });

  const scope = SCOPES[provider];
  if (scope) params.set('scope', scope);

  return `${AUTHORIZE_URLS[provider]}?${params.toString()}`;
}
