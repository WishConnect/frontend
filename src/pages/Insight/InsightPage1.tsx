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
          setCurrentPage(1);
        }}
        onNotificationClick={() => console.log('알림 클릭')}
      />

      <div className="flex">
        <div className="relative ml-[64px] h-[896px] w-[237px] shrink-0 self-start">
          <LeftSidebar activeId="insight" />
        </div>

        <main className="ml-[32px] flex w-[1043px] gap-[32px]">
          <section className="w-[774px]">
            <section className="flex w-[774px] flex-col items-start text-left">
              <h1 className="m-0 h-[52px] w-[774px] text-[40px] font-bold leading-[52px] text-[#10131A]">
                {searchQuery ? `'${searchQuery}' 검색 결과` : '장학금 인사이트'}
              </h1>

              <p className="mt-2 text-[16px] font-medium leading-[24px] text-[#555964]">
                {searchQuery
                  ? `총 ${totalCount}개의 결과를 찾았어요.`
                  : '다양한 출처의 장학금 관련 글과 합격 후기를 모아볼 수 있어요.'}
              </p>
            </section>

            <section className="mt-[28px] h-[748px] w-[774px]">
              <div className="w-[774px] overflow-hidden rounded-[16px] border border-[#D9DDE7]">
                {articles.map((post) => (
                  <article
                    key={post.insightId}
                    className="flex h-[140px] w-full items-start justify-between border-b border-[#D9DDE7] pl-[29px] pr-[14px] pt-[28px] pb-[16px] last:border-b-0"
                  >
                    <div>
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

                      <h2 className="mt-[8px] text-[20px] font-bold text-[#10131A]">
                        {post.title}
                      </h2>

                      <p className="text-[14px] text-[#555964]">{post.summary}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOriginalClick(post.originalUrl)}
                      className="h-[36px] w-[81px] rounded-[8px] border border-[#9DA1AC] text-[14px] text-[#555964]"
                    >
                      원문보기
                    </button>
                  </article>
                ))}
              </div>

              {totalPages > 0 && (
                <div className="absolute left-[333px] top-[944px] flex h-[28px] w-[774px] justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </section>
          </section>

          <aside className="mt-[112px] w-[237px]">
            <section className="flex flex-col gap-3">
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
                    alt={isSourceOpen ? '위 화살표' : '아래 화살표'}
                    className="h-[16px] w-[16px]"
                  />
                </button>

                {isSourceOpen && (
                  <div className="absolute left-0 top-[43px] z-10 w-[237px] overflow-hidden rounded-[8px] border border-[#D2D4DA] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
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
                    alt={isSortOpen ? '위 화살표' : '아래 화살표'}
                    className="h-[16px] w-[16px]"
                  />
                </button>

                {isSortOpen && (
                  <div className="absolute left-0 top-[43px] z-10 w-[237px] overflow-hidden rounded-[8px] border border-[#D2D4DA] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
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

            <section className="mt-4 h-[128px] w-[237px] rounded-2xl border border-[#D2D4DA]">
              <div className="mt-[16px] ml-[21px] flex w-[237px] items-center gap-[61px]">
                <img src={LightIcon} alt="light" className="h-5 w-[127px]" />

                <img
                  src={Right}
                  alt="right"
                  className="h-[14px] w-[9px]"
                  onClick={() => navigate('/insight/reference')}
                />
              </div>

              <div className="mt-[17px] flex flex-col gap-[4px] pl-[21px] text-[12px] leading-[16px] font-medium text-[#747883]">
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
