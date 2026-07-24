import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import AiIcon from '../../assets/icons/AiIcon';
import ChevronRight from '../../assets/icons/ChevronRight';
import Right from '../../assets/icons/Right.svg';
import Docu from '../../assets/icons/Docu.svg';
import Announce from '../../assets/icons/Announce.svg';
import Interview from '../../assets/icons/Interview.svg';
import Final from '../../assets/icons/Final.svg';
import PdfIcon from '../../assets/icons/Pdf.svg';
import DownloadIcon from '../../assets/icons/Download.svg';
import UpdateRight from '../../assets/icons/UpdateRight.svg';
import Scrap from '../../assets/icons/ScrapCircle.svg';
import ScrapDisable from '../../assets/icons/ScrapCircleDisable.svg';
import Share from '../../assets/icons/ShareCircle.svg';

import Button from '../../components/Button/Button';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import DdayStatus from '../../components/DdayStatus';

import { fetchScholarshipDetail } from '../../api/Curation/Detail';
import { useUserStore } from '../../store/user/user';
import { scrapScholarship, unscrapScholarship } from '../../api/Curation/Scrap';
import type {
  ScholarshipDetailResponse,
  SelectionScheduleStatus,
} from '../../types/Curation/Detail';

interface DetailLocationState {
  profileCompletionRate?: number;
}

const scheduleIcons = [Docu, Announce, Interview, Final];

function getScheduleStatusText(status: SelectionScheduleStatus) {
  switch (status) {
    case 'CLOSED':
      return '마감';
    case 'CURRENT':
      return '진행 중';
    case 'UPCOMING':
      return '예정';
    default:
      return '';
  }
}

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return '마감일 정보 없음';
  }

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return deadline;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
function formatScheduleDate(dateText: string | null, step: string) {
  if (!dateText) {
    return '날짜 미정';
  }

  const matchedDates = dateText.match(/\d{4}[.-]\d{2}[.-]\d{2}/g);

  if (!matchedDates?.length) {
    return dateText;
  }

  const targetDateText = matchedDates[matchedDates.length - 1];

  const normalizedDate = targetDateText.replaceAll('.', '-');

  const date = new Date(`${normalizedDate}T00:00:00`);

  const formattedDate = targetDateText.replaceAll('-', '.');

  if (Number.isNaN(date.getTime())) {
    return step === '서류접수' ? `~ ${formattedDate}` : formattedDate;
  }

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const result = `${formattedDate} (${weekdays[date.getDay()]})`;

  return step === '서류접수' ? `~ ${result}` : result;
}
function valueOrDefault(value: string | null) {
  return value || '정보 없음';
}

export default function Detail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  const [detail, setDetail] = useState<ScholarshipDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const locationState = location.state as DetailLocationState | null;

  const profileProgress = locationState?.profileCompletionRate ?? 0;

  const isOnboarded = Boolean(user?.onboardingCompleted);
  const [isScrapped, setIsScrapped] = useState(false);
  const [isScrapLoading, setIsScrapLoading] = useState(false);

  const handleScrap = async () => {
    if (!detail || isScrapLoading) {
      return;
    }

    try {
      setIsScrapLoading(true);

      const result = isScrapped
        ? await unscrapScholarship(detail.scholarshipId)
        : await scrapScholarship(detail.scholarshipId);

      setIsScrapped(result.scrapped);
    } catch (error) {
      console.error('상세 장학금 스크랩 변경 실패:', error);

      alert(error instanceof Error ? error.message : '스크랩 상태 변경에 실패했습니다.');
    } finally {
      setIsScrapLoading(false);
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setErrorMessage('장학금 ID가 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await fetchScholarshipDetail(id);

        setDetail(data);
        setIsScrapped(data.isScrapped ?? false);
      } catch (error) {
        console.error('장학금 상세 조회 실패:', error);

        setErrorMessage(
          error instanceof Error ? error.message : '장학금 상세 정보를 불러오지 못했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-['Pretendard']">
        장학금 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (!detail || errorMessage) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-[20px] font-['Pretendard']">
        <p>{errorMessage || '장학금 정보가 없습니다.'}</p>

        <Button size="md" variant="primary" weight="semibold" onClick={() => navigate('/curation')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const leftInfo = [
    {
      label: '지원대상',
      value: detail.summary.targetAudience,
    },
    {
      label: '지원금액',
      value: detail.summary.supportAmount,
    },
    {
      label: '선발인원',
      value: detail.summary.selectedCount,
    },
    {
      label: '지원분야',
      value: detail.summary.fieldOfStudy,
    },
    {
      label: '지원형태',
      value: detail.summary.supportType,
    },
    {
      label: '중복지원',
      value: detail.summary.duplicateAllowed,
    },
    {
      label: '운영기관',
      value: detail.summary.operatingOrganization || detail.organization,
    },
    {
      label: '문의처',
      value: detail.summary.contactInfo,
    },
  ];

  const rightInfo = [
    {
      label: '선발기준',
      value: detail.summary.selectionCriteria,
    },
    {
      label: '성적 기준',
      value: detail.summary.gpaRequirement,
    },
    {
      label: '소득기준',
      value: detail.summary.incomeRequirement,
    },
    {
      label: '우대사항',
      value: detail.summary.preferredConditions,
    },
    {
      label: '지원기간',
      value: detail.summary.applicationPeriod,
    },
    {
      label: '제출방법',
      value: detail.summary.submissionMethod,
    },
  ];

  const handleShare = async () => {
    if (!detail.detailUrl) {
      alert('공유할 장학금 주소가 없습니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(detail.detailUrl);
      alert('장학금 링크가 복사되었습니다.');
    } catch (error) {
      console.error('장학금 링크 복사 실패:', error);
      alert('링크 복사에 실패했습니다.');
    }
  };
  const handleDownloadAll = () => {
    const downloadableDocuments = detail.requiredDocuments.filter(
      (document) => document.downloadUrl,
    );

    if (downloadableDocuments.length === 0) {
      alert('다운로드할 수 있는 제출 서류가 없습니다.');
      return;
    }

    downloadableDocuments.forEach((document) => {
      window.open(document.downloadUrl as string, '_blank', 'noopener,noreferrer');
    });
  };

  return (
    <div className="min-h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isLoggedIn={isLoggedIn}
        isSearchMode={false}
        onSearch={(query) => {
          navigate(`/curation?keyword=${encodeURIComponent(query)}`);
        }}
      />

      <div className="flex">
        <div className="relative ml-[64px] h-[896px] w-[237px] shrink-0 self-start">
          <LeftSidebar activeId="curating" />

          {isLoggedIn && !isOnboarded && (
            <div className="absolute bottom-[16px] left-[14px] z-10 h-[224px] w-[208px] rounded-[16px] bg-white px-[20px] pt-[20px] pb-[16px] shadow-[0_1px_7px_0_rgba(0,0,0,0.08)]">
              <p className="text-[12px] font-medium leading-[16px] text-[#555964]">
                더 정확한 추천을 위해
              </p>

              <p className=" mt-[2px] text-[18px] font-bold leading-[24px] text-[#10131A]">
                프로필을 업데이트
                <br />
                해보세요!
              </p>

              <div className="mt-[50px]">
                <span className="block text-[12px] font-semibold leading-[16px] text-[#7962ED]">
                  {profileProgress}%
                </span>

                <div className="mt-[4px] h-[4px] w-[168px] overflow-hidden rounded-[8px] bg-[#E6E7EB]">
                  <div
                    className="h-full rounded-[8px] bg-[#7962ED]"
                    style={{
                      width: `${profileProgress}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="absolute bottom-[16px] left-[20px] flex h-[32px] w-[168px] items-center justify-between rounded-[8px] bg-[#F3F4F6] px-[16px] text-[12px] font-medium text-[#747883]"
              >
                <span>프로필 업데이트</span>

                <img src={UpdateRight} alt="오른쪽 화살표" />
              </button>
            </div>
          )}
        </div>

        <main className="flex w-[1139px] flex-col gap-[52px] pl-[32px] pr-[64px] pb-[64px]">
          <div className="w-[1043px]">
            <div className="flex gap-[6px]">
              {(detail.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="flex h-[24px] items-center rounded-[16px] px-[12px] py-[4px] text-[12px] font-medium leading-[16px] text-[#555964] shadow-[inset_0_0_0_0.7px_#9DA1AC]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-[6px] flex min-h-[48px] items-center gap-[8px]">
              <h1 className="text-[36px] font-bold leading-[48px] text-[#181C25]">
                {detail.title}
              </h1>

              {isLoggedIn && (
                <>
                  <button
                    type="button"
                    onClick={handleScrap}
                    disabled={isScrapLoading}
                    aria-label={isScrapped ? '스크랩 해제' : '스크랩'}
                    className="flex items-center justify-center disabled:cursor-not-allowed"
                  >
                    <img src={isScrapped ? Scrap : ScrapDisable} alt="" />
                  </button>

                  <button type="button" onClick={handleShare} aria-label="공유">
                    <img src={Share} alt="" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-[12px] flex h-[32px] items-center gap-[8px]">
              <DdayStatus days={detail.dDay ?? 0} />

              <span className="text-[#555964]">•</span>

              <span className="text-[16px] font-semibold text-[#555964]">
                {formatDeadline(detail.deadline)}
              </span>

              {detail.detailUrl && (
                <a
                  href={detail.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[2px] text-[14px] font-medium text-[#747883]"
                >
                  <span className="underline underline-offset-[2px]">웹사이트</span>↗
                </a>
              )}
            </div>

            <div className="mt-[24px] flex h-[80px] items-center justify-between rounded-[16px] border border-[#D2D4DA] py-[16px] pl-[32px] pr-[18px]">
              <div className="flex items-center gap-[20px]">
                <AiIcon isLoggedIn={isLoggedIn} />

                <div>
                  <p className="text-[16px] font-bold leading-[20px] text-[#10131A]">
                    AI가 당신의 경험을 분석하여 강점이 드러나는 맞춤 지원서 초안을 만들어드려요.
                  </p>

                  <p className="mt-[2px] text-[14px] font-medium leading-[20px] text-[#555964]">
                    지원서 작성 시간을 줄이고, 합격 가능성을 높여보세요!
                  </p>
                </div>
              </div>

              <Button
                size="md"
                variant="gradient"
                weight="semibold"
                rightIcon={<ChevronRight />}
                paddingLeft="24px"
                paddingRight="24px"
                className="text-[16px] leading-[24px]"
                onClick={() => navigate(isLoggedIn ? '/write' : '/login')}
              >
                {isLoggedIn ? '지원서 작성 시작하기' : '로그인 하고 지원서 작성 시작하기'}
              </Button>
            </div>
          </div>

          <div className="flex gap-[32px]">
            <div className="h-[432px] w-[326px] overflow-hidden rounded-[16px] bg-[#F3F4F6]">
              {detail.posterUrl ? (
                <img
                  src={detail.posterUrl}
                  alt={detail.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[14px] text-[#747883]">
                  등록된 포스터가 없습니다.
                </div>
              )}
            </div>

            <div className="w-[685px] h-[432px] rounded-[16px] bg-[#F9FAFC] px-[40px] py-[32px]">
              <h2 className="text-[28px] font-bold leading-[40px]">장학금 요약 정보</h2>

              <div className="mt-[14px] flex justify-between">
                <div className="flex w-[285px] flex-col gap-[8px]">
                  {leftInfo.map((item) => (
                    <div key={item.label} className="flex gap-[19px]">
                      <span className="w-[49px] h-[24px] shrink-0 text-[14px] font-bold text-[#555964]">
                        {item.label}
                      </span>

                      <span className="text-[14px] font-medium text-[#747883]">
                        {valueOrDefault(item.value)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex w-[285px] flex-col gap-[8px]">
                  {rightInfo.map((item) => (
                    <div key={item.label} className="flex gap-[16px]">
                      <span className="w-[52px] h-[24px] shrink-0 text-[14px] font-bold text-[#555964]">
                        {item.label}
                      </span>

                      <span className="text-[14px] font-medium text-[#747883]">
                        {valueOrDefault(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {detail.detailUrl && (
                <a
                  href={detail.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[22px] flex h-[48px] w-[605px] items-center justify-between rounded-[8px] border border-[#9DA1AC] px-[16px]"
                >
                  <span className="text-[16px] font-medium text-[#555964]">자세히 보기</span>

                  <img src={Right} alt="" className="h-[16px] w-[9px]" />
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-[32px]">
            <div className="h-[320px] w-[685px] rounded-[16px] border border-[#D2D4DA] px-[32px] pt-[32px]">
              <h2 className="text-[24px] font-bold leading-[32px]">선발 일정</h2>

              {detail.selectionSchedule.length > 0 ? (
                <div className="mt-[32px] ml-[57px] flex gap-[62px]">
                  {detail.selectionSchedule.slice(0, 4).map((schedule, index) => (
                    <div
                      key={`${schedule.step}-${index}`}
                      className="flex w-[80px] flex-col items-center"
                    >
                      <img
                        src={scheduleIcons[index]}
                        alt={schedule.step}
                        className="h-[64px] w-[64px]"
                      />

                      <p
                        className={`mt-[16px] whitespace-nowrap text-[20px] font-semibold leading-[28px] ${
                          schedule.status === 'CURRENT' ? 'text-[#7962ED]' : 'text-[#555964]'
                        }`}
                      >
                        {schedule.step}
                      </p>

                      <p className="mt-[4px] whitespace-nowrap text-[14px] font-medium text-[#747883]">
                        {formatScheduleDate(schedule.date, schedule.step)}
                      </p>

                      <p className="whitespace-nowrap text-[14px] font-medium text-[#747883]">
                        {getScheduleStatusText(schedule.status)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-[14px] text-[#747883]">
                  등록된 선발 일정이 없습니다.
                </div>
              )}
            </div>

            <div className="h-[320px] w-[326px] rounded-[16px] border border-[#D2D4DA] px-[32px] pt-[32px]">
              <h2 className="text-[24px] font-bold leading-[32px]">제출 서류</h2>

              {detail.requiredDocuments.length > 0 ? (
                <>
                  <div className="mt-[20px] flex flex-col gap-[11px]">
                    {detail.requiredDocuments.slice(0, 4).map((document, index) => (
                      <div
                        key={`${document.name}-${index}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-[8px]">
                          <img src={PdfIcon} alt="pdf" className="h-[24px] w-[24px]" />

                          <span className="truncate text-[14px] font-medium text-[#555964]">
                            {document.name}
                          </span>
                        </div>

                        {document.downloadUrl && (
                          <a href={document.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <img src={DownloadIcon} alt="다운로드" className="h-[16px] w-[16px]" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="mt-[24px] flex h-[48px] w-full items-center justify-between rounded-[8px] border border-[#D2D4DA] px-[16px] text-[14px] font-medium text-[#555964]"
                  >
                    제출 서류 전체 다운로드
                    <img src={DownloadIcon} alt="다운로드" className="h-[20px] w-[20px]" />
                  </button>
                </>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-[14px] text-[#747883]">
                  등록된 제출 서류가 없습니다.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
