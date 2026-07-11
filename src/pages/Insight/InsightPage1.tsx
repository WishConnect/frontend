import { useState } from 'react';
import Button from '../../components/Button/Button';
import LightIcon from '../../assets/icons/light.svg';
import Right from '../../assets/icons/Right.svg';
import LeftSidebar from '../../components/LeftSidebar';
import Header from '../../components/common/Header/Header';
import Pagination from '../../components/common/Pagination/Pagination';

const categories = [
  { label: '전체', width: '57px' },
  { label: '합격 후기', width: '84px' },
  { label: '장학금 정보', width: '96px' },
  { label: '작성 팁', width: '72px' },
  { label: '경험 공유', width: '84px' },
  { label: 'Q&A', width: '62px' },
];

const posts = [
  {
    category: '합격 후기',
    source: '네이버 블로그',
    date: '2026.05.24',
    title: '2026 상상장학재단 장학금 합격 후기',
    summary: '지원 동기와 성장 과정 작성 팁을 중심으로 작성한 합격 후기입니다.',
  },
  {
    category: '합격 후기',
    source: '티스토리',
    date: '2026.05.24',
    title: '현대차 정몽구 재단 장학생으로 선정된 경험',
    summary: '지원 준비 과정과 면접 후기, 장학금 활용 계획을 공유합니다.',
  },
  {
    category: '장학금 정보',
    source: '에브리타임',
    date: '2026.05.24',
    title: '2026 교내 장학금 종류 및 신청 일정 총정리',
    summary: '교내 장학금 종류와 신청 기간, 자격 요건을 정리해봤습니다.',
  },
  {
    category: '작성 팁',
    source: '네이버 카페',
    date: '2026.05.24',
    title: '장학금 자기소개서 작성할 때 꼭 들어가야 할 내용들',
    summary: '교내 장학금 종류와 신청 기간, 자격 요건을 정리해봤습니다.',
  },
  {
    category: '합격 후기',
    source: '브런치',
    date: '2026.05.24',
    title: '장학금 덕분에 가능했던 해외 교류 프로그램 경험',
    summary: '교내 장학금 종류와 신청 기간, 자격 요건을 정리해봤습니다.',
  },
  // 페이지 확인용 더미 데이터
  {
    category: 'Q&A',
    source: '에브리타임',
    date: '2026.05.25',
    title: '장학금 질문 있습니다.',
    summary: '소득분위 관련 질문입니다.',
  },
  {
    category: '경험 공유',
    source: '브런치',
    date: '2026.05.25',
    title: '국가장학금 신청 후기',
    summary: '신청하면서 느낀 점을 공유합니다.',
  },
];

const tags = ['생활비 지원', '자기소개서', '면접후기', '리더십', '전공', '봉사활동', '해외교류'];

export default function InsightPage1() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) => {
    const matchCategory = selectedCategory === '전체' || post.category === selectedCategory;

    const matchSearch =
      searchQuery.trim() === '' ||
      post.title.includes(searchQuery) ||
      post.summary.includes(searchQuery) ||
      post.source.includes(searchQuery) ||
      post.category.includes(searchQuery);

    return matchCategory && matchSearch;
  });

  const POSTS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isLoggedIn={true}
        isSearchMode={false}
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        onNotificationClick={() => console.log('알림 클릭')}
      />

      <div className="flex">
        <div className="ml-[64px]">
          <LeftSidebar />
        </div>

        <main className="ml-[32px] flex w-[1043px] gap-[32px]">
          <section className="w-[774px]">
            <section className="flex w-[774px] flex-col items-start text-left">
              <h1 className="m-0 h-[52px] w-[774px] text-[40px] font-bold leading-[52px] text-[#10131A]">
                {searchQuery ? `'${searchQuery}' 검색 결과` : '장학금 인사이트'}
              </h1>

              <p className="mt-2 text-[16px] font-medium leading-[24px] text-[#555964]">
                {searchQuery
                  ? `총 ${filteredPosts.length}개의 결과를 찾았어요.`
                  : '다양한 출처의 장학금 관련 글과 합격 후기를 모아볼 수 있어요.'}
              </p>

              {!searchQuery && (
                <div className="mt-3 flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.label}
                      size="sm"
                      width={category.width}
                      variant={selectedCategory === category.label ? 'primary' : 'outline'}
                      onClick={() => {
                        setSelectedCategory(category.label);
                        setCurrentPage(1);
                      }}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-6 w-[774px]">
              <div className="w-[774px] overflow-hidden rounded-[16px] border border-[#D9DDE7]">
                {currentPosts.map((post, index) => (
                  <article
                    key={index}
                    className="flex h-[132px] w-full items-center justify-between border-b border-[#D9DDE7] px-8 last:border-b-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-[#7962ED] px-3 py-1 text-[12px] font-semibold text-[#7962ED]">
                          {post.category}
                        </span>

                        <span className="text-[14px] text-[#6B7280]">{post.source}</span>

                        <span className="text-[14px] text-[#6B7280]">•</span>

                        <span className="text-[14px] text-[#6B7280]">{post.date}</span>
                      </div>

                      <h2 className="mt-3 text-[20px] font-bold text-[#10131A]">{post.title}</h2>

                      <p className="mt-1 text-[14px] text-[#555964]">{post.summary}</p>
                    </div>

                    <button className="h-[36px] w-[81px] rounded-[8px] border border-[#9DA1AC] text-[14px] text-[#555964]">
                      원문보기
                    </button>
                  </article>
                ))}
              </div>

              {totalPages > 0 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </section>
          </section>

          <aside className="mt-[156px] w-[237px]">
            <section className="flex flex-col gap-3">
              {['출처 전체', '카테고리 전체', '최신순'].map((label) => (
                <button
                  key={label}
                  className="flex h-[35px] w-[237px] items-center justify-between rounded-lg bg-[#F9FAFC] px-4 text-[14px] font-medium text-[#747883]"
                >
                  <span>{label}</span>
                  <span>⌄</span>
                </button>
              ))}
            </section>

            <section className="mt-[31px] h-[160px] w-[237px] rounded-2xl border border-[#D2D4DA]">
              <div className="mt-[16px] flex items-center h-[20px] w-[150px] gap-[8px] pl-[20px]">
                <span className="flex h-[20px] w-[34.375px] items-center justify-center rounded-[5px] bg-[#7962ED] text-[8.75px] font-bold text-white">
                  HOT
                </span>

                <span className="flex h-[20px] items-center whitespace-nowrap text-[16px] font-bold leading-none text-[#10131A]">
                  인기 태그
                </span>
              </div>
              <div className=" w-[237px] mt-[16px] pl-[21px] mr-[30px] mb-[16px] flex flex-wrap gap-[8px]">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className="leading-[16px] rounded-[16px] text-[12px] text-[#320095] px-3 py-1 font-medium items-center justify-center border border-[#BDB9F9] bg-[#7962ED1A]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 h-[128px] w-[237px] rounded-2xl border border-[#D2D4DA]">
              <div className="mt-[16px] ml-[21px] w-[237px] flex items-center gap-[61px] ">
                <img src={LightIcon} alt="light" className="h-5 w-[127px]" />
                <img src={Right} alt="right" className="w-[9px] h-[14px]" />
              </div>
              <div className="flex flex-col mt-[17px] pl-[21px] gap-[4px] text-[#747883] text-[12px] font-medium leading-[16px] ">
                <span>• 장학금 자기소개서 문항 가이드</span>
                <span>• 자주 묻는 질문 모음</span>
                <span>• 장학금 용어 정리</span>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
