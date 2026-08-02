import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LightIcon from '../../assets/icons/light.svg';
import Right from '../../assets/icons/Right.svg';
import LeftSidebar from '../../components/LeftSidebar';
import Header from '../../components/common/Header/Header';
import Pagination from '../../components/common/Pagination/Pagination';
import Down from '../../assets/icons/CategoryDown.svg';
import Up from '../../assets/icons/CategoryUp.svg';

import { getInsights } from '../../api/Insight/insight';
import type { InsightArticle, InsightSort, InsightSource } from '../../types/Insight/insight';

const POSTS_PER_PAGE = 5;

const sourceOptions: {
  label: string;
  value: InsightSource;
}[] = [
  {
    label: '출처 전체',
    value: 'ALL',
  },
  {
    label: '네이버 블로그',
    value: 'NAVER_BLOG',
  },
  {
    label: '티스토리',
    value: 'TISTORY',
  },
  {
    label: '브런치',
    value: 'BRUNCH',
  },
  {
    label: '에브리타임',
    value: 'EVERYTIME',
  },
];

const sortOptions: {
  label: string;
  value: InsightSort;
}[] = [
  {
    label: '최신순',
    value: 'latest',
  },
  {
    label: '조회순',
    value: 'popular',
  },
];

const formatPublishedDate = (date: string) => {
  return date.replaceAll('-', '.');
};

export default function InsightPage1() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<InsightArticle[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  const [selectedSource, setSelectedSource] = useState<InsightSource>('ALL');
  const [sortOrder, setSortOrder] = useState<InsightSort>('latest');
  const [selectedTag, setSelectedTag] = useState('');

  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');

  const isSearchResult = searchQuery.trim().length > 0;

  const selectedSourceLabel =
    sourceOptions.find((option) => option.value === selectedSource)?.label ?? '출처 전체';

  const selectedSortLabel =
    sortOptions.find((option) => option.value === sortOrder)?.label ?? '최신순';

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await getInsights({
          category: 'ALL',
          source: selectedSource,
          sort: sortOrder,
          tag: selectedTag || undefined,
          keyword: searchQuery.trim() || undefined,
          page: currentPage,
          size: POSTS_PER_PAGE,
        });

        setArticles(data.articles);
        setPopularTags(data.popularTags);
        setTotalCount(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error('인사이트 목록 조회 실패:', error);

        setArticles([]);
        setPopularTags([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    };

    fetchInsights();
  }, [currentPage, searchQuery, selectedSource, selectedTag, sortOrder]);

  const handleOriginalClick = (originalUrl: string) => {
    if (!originalUrl) {
      return;
    }

    window.open(originalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isLoggedIn={true}
        isSearchMode={false}
        onSearch={(query) => {
          setSearchQuery(query);
          setSelectedTag('');
          setSelectedSource('ALL');
          setIsSourceOpen(false);
          setIsSortOpen(false);
          setCurrentPage(1);
        }}
        onNotificationClick={() => console.log('알림 클릭')}
      />

      <div className="flex">
        <div className="relative ml-[64px] h-[896px] w-[237px] shrink-0 self-start">
          <LeftSidebar activeId="insight" />
        </div>

        <main className={`ml-[32px] flex w-[1043px] ${isSearchResult ? '' : 'gap-[32px]'}`}>
          {/* 제목과 게시글 목록 */}
          <section
            className={`shrink-0 ${
              isSearchResult ? 'mt-[32px] w-[1043px]' : 'mt-[16px] w-[774px]'
            }`}
          >
            {/* 제목 */}
            <section className={isSearchResult ? 'w-[1043px]' : 'w-[774px]'}>
              <h1 className="m-0 h-[52px] whitespace-nowrap text-[40px] font-bold leading-[52px] text-[#10131A]">
                {isSearchResult ? `'${searchQuery}' 검색 결과` : '장학금 인사이트'}
              </h1>

              {/* 설명과 검색 결과 정렬 */}
              <div className="mt-[8px] flex w-full items-center justify-between">
                <p className="m-0 text-[16px] font-medium leading-[24px] text-[#555964]">
                  {isSearchResult ? (
                    <>
                      총 <span className="font-semibold text-[#7962ED]">{totalCount}개의</span>{' '}
                      결과를 찾았어요.
                    </>
                  ) : (
                    '다양한 출처의 장학금 관련 글과 합격 후기를 모아볼 수 있어요.'
                  )}
                </p>

                {/* 검색했을 때만 설명과 같은 줄에 정렬 표시 */}
                {isSearchResult && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSortOpen((prev) => !prev);
                        setIsSourceOpen(false);
                      }}
                      className="flex h-[40px] w-[171px] items-center justify-between rounded-[8px] bg-[#F9FAFC] px-[16px] text-[14px] font-medium text-[#747883]"
                    >
                      <span>{selectedSortLabel}</span>

                      <img
                        src={isSortOpen ? Up : Down}
                        alt={isSortOpen ? '정렬 메뉴 닫기' : '정렬 메뉴 열기'}
                        className="h-[16px] w-[16px]"
                      />
                    </button>

                    {isSortOpen && (
                      <div className="absolute top-[48px] right-0 z-20 w-[171px] overflow-hidden rounded-[8px] border border-[#D2D4DA] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
                        {sortOptions
                          .filter((option) => option.value !== sortOrder)
                          .map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setSortOrder(option.value);
                                setIsSortOpen(false);
                                setCurrentPage(1);
                              }}
                              className="flex h-[40px] w-full items-center px-[16px] text-[14px] font-medium text-[#555964] hover:bg-[#F9FAFC]"
                            >
                              {option.label}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 게시글 목록 */}
            <section
              className={`mt-[28px] h-[748px] ${isSearchResult ? 'w-[1043px]' : 'w-[774px]'}`}
            >
              <div
                className={`overflow-hidden rounded-[16px] border border-[#D9DDE7] ${
                  isSearchResult ? 'w-[1043px]' : 'w-[774px]'
                }`}
              >
                {articles.map((post) => (
                  <article
                    key={post.insightId}
                    className="flex h-[140px] w-full items-start justify-between border-b border-[#D9DDE7] pt-[28px] pr-[14px] pb-[16px] pl-[29px] last:border-b-0"
                  >
                    <div className="min-w-0 flex-1 pr-[24px]">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-[#BDB9F9] bg-[#7962ED]/10 px-3 py-1 text-[12px] font-medium text-[#320095]">
                          {post.categoryLabel}
                        </span>

                        <span className="text-[14px] text-[#6B7280]">{post.source}</span>

                        <span className="text-[14px] text-[#6B7280]">•</span>

                        <span className="text-[14px] text-[#6B7280]">
                          {formatPublishedDate(post.publishedAt)}
                        </span>
                      </div>

                      <h2 className="mt-[8px] truncate text-[20px] font-bold text-[#10131A]">
                        {post.title}
                      </h2>

                      <p className="truncate text-[14px] text-[#555964]">{post.summary}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOriginalClick(post.originalUrl)}
                      className="h-[36px] w-[81px] shrink-0 rounded-[8px] border border-[#9DA1AC] text-[14px] text-[#555964]"
                    >
                      원문보기
                    </button>
                  </article>
                ))}

                {articles.length === 0 && (
                  <div className="flex h-[200px] items-center justify-center text-[16px] text-[#747883]">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>

              {totalPages > 0 && (
                <div
                  className={`mt-[32px] flex h-[28px] justify-center ${
                    isSearchResult ? 'w-[1043px]' : 'w-[774px]'
                  }`}
                >
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </section>
          </section>

          {/* 검색 전 화면의 기존 오른쪽 영역 */}
          {!isSearchResult && (
            <aside className={`w-[237px] shrink-0 ${isSearchResult ? 'mt-[144px]' : 'mt-[128px]'}`}>
              <section className="flex flex-col gap-3">
                {/* 출처 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSourceOpen((prev) => !prev);
                      setIsSortOpen(false);
                    }}
                    className="flex h-[35px] w-[237px] items-center justify-between rounded-lg bg-[#F9FAFC] px-4 text-[14px] font-medium text-[#747883]"
                  >
                    <span>{selectedSourceLabel}</span>

                    <img
                      src={isSourceOpen ? Up : Down}
                      alt={isSourceOpen ? '출처 메뉴 닫기' : '출처 메뉴 열기'}
                      className="h-[16px] w-[16px]"
                    />
                  </button>

                  {isSourceOpen && (
                    <div className="absolute top-[43px] left-0 z-10 w-[237px] overflow-hidden rounded-[8px] border border-[#D2D4DA] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
                      {sourceOptions
                        .filter((option) => option.value !== selectedSource)
                        .map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedSource(option.value);
                              setIsSourceOpen(false);
                              setCurrentPage(1);
                            }}
                            className="flex h-[40px] w-full items-center px-4 text-[14px] font-medium text-[#555964] hover:bg-[#F9FAFC]"
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* 정렬 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSortOpen((prev) => !prev);
                      setIsSourceOpen(false);
                    }}
                    className="flex h-[35px] w-[237px] items-center justify-between rounded-lg bg-[#F9FAFC] px-4 text-[14px] font-medium text-[#747883]"
                  >
                    <span>{selectedSortLabel}</span>

                    <img
                      src={isSortOpen ? Up : Down}
                      alt={isSortOpen ? '정렬 메뉴 닫기' : '정렬 메뉴 열기'}
                      className="h-[16px] w-[16px]"
                    />
                  </button>

                  {isSortOpen && (
                    <div className="absolute top-[43px] left-0 z-10 w-[237px] overflow-hidden rounded-[8px] border border-[#D2D4DA] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
                      {sortOptions
                        .filter((option) => option.value !== sortOrder)
                        .map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSortOrder(option.value);
                              setIsSortOpen(false);
                              setCurrentPage(1);
                            }}
                            className="flex h-[40px] w-full items-center px-4 text-[14px] font-medium text-[#555964] hover:bg-[#F9FAFC]"
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </section>

              {/* 인기 태그 */}
              <section className="mt-[31px] h-[160px] w-[237px] rounded-2xl border border-[#D2D4DA]">
                <div className="mt-[16px] flex h-[20px] w-[150px] items-center gap-[8px] pl-[20px]">
                  <span className="flex h-[20px] w-[34.375px] items-center justify-center rounded-[5px] bg-[#7962ED] text-[8.75px] font-bold text-white">
                    HOT
                  </span>

                  <span className="flex h-[20px] items-center whitespace-nowrap text-[16px] leading-none font-bold text-[#10131A]">
                    인기 태그
                  </span>
                </div>

                <div className="mt-[16px] mr-[30px] mb-[16px] flex w-[237px] flex-wrap gap-[8px] pl-[21px]">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag((prev) => (prev === tag ? '' : tag));
                        setCurrentPage(1);
                      }}
                      className="items-center justify-center rounded-[16px] border border-[#BDB9F9] bg-[#7962ED1A] px-3 py-1 text-[12px] leading-[16px] font-medium text-[#320095]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>

              {/* 참고하면 좋아요 */}
              <section className="mt-4 h-[52px] w-[237px] rounded-2xl border border-[#D2D4DA]">
                <div className="mt-[16px] ml-[21px] flex w-[237px] items-center gap-[61px]">
                  <img src={LightIcon} alt="참고하면 좋아요" />

                  <button type="button" onClick={() => navigate('/insight/reference')}>
                    <img src={Right} alt="이동" className="h-[14px] w-[9px]" />
                  </button>
                </div>
              </section>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
