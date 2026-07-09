import ScholarshipImage from '../assets/images/scholar.png';

export type ScholarshipCategory = '생활비' | '성적우수' | '전공/특기' | '해외연수' | '기타';

export interface MemberInfo {
  name: string;
  university: string;
  profileProgress: number;
  isOnboarded: boolean;
}

export interface RecommendedScholarship {
  id: number;
  title: string;
  amount: string;
  deadline: string;
  dDay: string;
  deadlineStatus: string;
  description: string;
  image: string;
  tags: ScholarshipCategory[];
  recommendReasons: string[];
  isScrapped: boolean;
}

export interface SchoolScholarship {
  id: number;
  title: string;
  amount: string;
  deadline: string;
  dDay: string;
  deadlineStatus: string;
  description: string;
}

export interface RecruitingScholarship {
  id: number;
  title: string;
  category: ScholarshipCategory;
  amount: string;
  deadline: string;
  dDay: string;
  deadlineStatus: string;
  tags: ScholarshipCategory[];
  requirements: string[];
  isScrapped: boolean;
}

export interface MemberCurationData {
  member: MemberInfo;
  recommendedScholarships: RecommendedScholarship[];
  schoolScholarships: SchoolScholarship[];
  recruitingScholarships: RecruitingScholarship[];
}

export const memberCurationMock: MemberCurationData = {
  member: {
    name: '김위시',
    university: 'OO대학교',
    profileProgress: 85,
    isOnboarded: false,
  },

  recommendedScholarships: [
    {
      id: 1,
      title: '서울인재 해외교환학생 장학금',
      amount: '최대 500만원',
      deadline: '2026.05.20',
      dDay: 'D-5',
      deadlineStatus: '마감 임박',
      description: '교환학생을 위한 미래인재 양성 장학금입니다.',
      image: ScholarshipImage,
      tags: ['생활비', '해외연수', '성적우수'],
      recommendReasons: ['교환학생 신청', '학점 3.5 이상', '다자녀 가정'],
      isScrapped: false,
    },
    {
      id: 2,
      title: '글로벌 리더 장학금',
      amount: '최대 300만원',
      deadline: '2026.05.30',
      dDay: 'D-15',
      deadlineStatus: 'D-15',
      description: '글로벌 인재 양성을 위한 장학금입니다.',
      image: ScholarshipImage,
      tags: ['해외연수'],
      recommendReasons: ['해외 경험'],
      isScrapped: false,
    },
    {
      id: 3,
      title: '성적우수 장학금',
      amount: '최대 200만원',
      deadline: '2026.06.02',
      dDay: 'D-18',
      deadlineStatus: 'D-18',
      description: '성적 우수 학생 장학금',
      image: ScholarshipImage,
      tags: ['성적우수'],
      recommendReasons: ['평점 우수'],
      isScrapped: false,
    },
    {
      id: 4,
      title: '근로 장학금',
      amount: '최대 250만원',
      deadline: '2026.06.10',
      dDay: 'D-26',
      deadlineStatus: 'D-26',
      description: '교내 근로 장학금',
      image: ScholarshipImage,
      tags: ['생활비'],
      recommendReasons: ['재학생'],
      isScrapped: true,
    },
    {
      id: 5,
      title: '창의인재 장학금',
      amount: '최대 400만원',
      deadline: '2026.06.20',
      dDay: 'D-36',
      deadlineStatus: 'D-36',
      description: '창의적 활동 학생 장학금',
      image: ScholarshipImage,
      tags: ['기타'],
      recommendReasons: ['비교과 활동'],
      isScrapped: false,
    },
  ],

  schoolScholarships: [
    {
      id: 1,
      title: '교내 성적 우수 장학금',
      amount: '최대 200만원',
      deadline: '2026.05.20',
      dDay: 'D-12',
      deadlineStatus: 'D-12',
      description: 'OO대학교 교내 성적 우수 장학금',
    },
    {
      id: 2,
      title: '근로 장학금',
      amount: '최대 200만원',
      deadline: '2026.05.20',
      dDay: 'D-12',
      deadlineStatus: 'D-12',
      description: 'OO대학교 근로 장학금',
    },
    {
      id: 3,
      title: '학과 장학금',
      amount: '최대 200만원',
      deadline: '2026.05.20',
      dDay: 'D-12',
      deadlineStatus: 'D-12',
      description: 'OO대학교 학과 장학금',
    },
    {
      id: 4,
      title: '신입생 장학금',
      amount: '최대 100만원',
      deadline: '2026.06.01',
      dDay: 'D-24',
      deadlineStatus: 'D-24',
      description: 'OO대학교 신입생 장학금',
    },
    {
      id: 5,
      title: '봉사 장학금',
      amount: '최대 150만원',
      deadline: '2026.06.05',
      dDay: 'D-28',
      deadlineStatus: 'D-28',
      description: 'OO대학교 봉사 장학금',
    },
  ],

  recruitingScholarships: [
    {
      id: 1,
      title: '글로벌 리더 장학금',
      category: '해외연수',
      amount: '최대 500만원',
      deadline: '2026.05.27',
      dDay: 'D-12',
      deadlineStatus: 'D-12',
      tags: ['해외연수'],
      requirements: ['해외 경험 필수', '어학 성적 필요'],
      isScrapped: false,
    },
    {
      id: 2,
      title: '생활비 지원 장학금',
      category: '생활비',
      amount: '최대 300만원',
      deadline: '2026.05.30',
      dDay: 'D-15',
      deadlineStatus: 'D-15',
      tags: ['생활비'],
      requirements: ['소득 분위'],
      isScrapped: false,
    },
    {
      id: 3,
      title: '전공 특기 장학금',
      category: '전공/특기',
      amount: '최대 250만원',
      deadline: '2026.06.02',
      dDay: 'D-18',
      deadlineStatus: 'D-18',
      tags: ['전공/특기'],
      requirements: ['전공 수상'],
      isScrapped: true,
    },
    {
      id: 4,
      title: '성장 장학금',
      category: '성적우수',
      amount: '최대 200만원',
      deadline: '2026.06.08',
      dDay: 'D-24',
      deadlineStatus: 'D-24',
      tags: ['성적우수'],
      requirements: ['평점 3.0 이상'],
      isScrapped: false,
    },
    {
      id: 5,
      title: '해외 교류 장학금',
      category: '해외연수',
      amount: '최대 400만원',
      deadline: '2026.06.15',
      dDay: 'D-31',
      deadlineStatus: 'D-31',
      tags: ['해외연수'],
      requirements: ['교환학생 예정'],
      isScrapped: false,
    },
  ],
};
