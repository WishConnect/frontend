import type { User } from '../types/login/auth';

/**
 * 소셜 로그인으로 들어온 사용자인지.
 *
 * 소셜 가입은 이름·생년월일·연락처·성별·국적·거주지역을 받지 않으므로 온보딩에서 "기본 정보"
 * 단계를 한 번 더 거친다(4단계). 일반 회원가입은 그 값들을 이미 받아 3단계 그대로다.
 *
 * loginType 은 소셜 로그인 응답에만 실려 온다. 일반 로그인은 undefined 라 false 가 된다.
 */
export function isSocialUser(user: User | null | undefined): boolean {
  return user?.loginType === 'KAKAO' || user?.loginType === 'GOOGLE';
}
