import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import AiIcon from '../../assets/icons/AiIcon';
import ChevronRight from '../../assets/icons/ChevronRight';
import Right from '../../assets/icons/Right.svg';
import Docu from '../../assets/icons/Docu.svg';
import Announce from '../../assets/icons/Announce.svg';
import Interview from '../../assets/icons/Interview.svg';
import Final from '../../assets/icons/Final.svg';
import UpdateRight from '../../assets/icons/UpdateRight.svg';
import DetailScrap from '../../assets/icons/DetailScrap.svg';
import Scrap from '../../assets/icons/Scrap.svg';
import PaperPlane from '../../assets/icons/PaperPlane.svg';
import ShareCheck from '../../assets/icons/ShareCheck.svg';
import Button from '../../components/Button/Button';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import DdayStatus from '../../components/DdayStatus';
import DetailPost from '../../components/Curation/DetailPost.svg';
import { fetchScholarshipDetail } from '../../api/Curation/Detail';
import { scrapScholarship, unscrapScholarship } from '../../api/Curation/Scrap';
import { useUserStore } from '../../store/user/user';
import { postStartApplication } from '../../api/archiving/start';
import { getArchive } from '../../api/archiving/archive';

import type {
  ScholarshipDetailResponse,
  SelectionScheduleStatus,
} from '../../types/Curation/Detail';

interface DetailLocationState {
  profileCompletionRate?: number;
}

type ApplicationStatus = 'NOT_REQUIRED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * 백엔드 상세 API에 지원서 상태가 추가되기 전까지 사용하는 임시 확장 타입.
 *
 * 추후 ScholarshipDetailResponse에 아래 필드가 정식으로 추가되면
 * 이 타입은 제거
 */
// type ScholarshipDetailWithApplication = ScholarshipDetailResponse & {
//   applicationStatus?: ApplicationStatus | null;
//   applicationId?: number | string | null;
// };

interface ApplicationBannerContent {
  title: string;
  description: string;
  buttonText: string;
  buttonVariant: 'primary' | 'gradient';
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

function getApplicationBannerContent(
  isLoggedIn: boolean,
  applicationStatus: ApplicationStatus,
): ApplicationBannerContent {
  if (!isLoggedIn) {
    return {
      title: 'AI가 당신의 경험을 분석하여 강점이 드러나는 맞춤 지원서 초안을 만들어드려요.',
      description: '지원서 작성 시간을 줄이고, 합격 가능성을 높여보세요!',
      buttonText: '로그인하고 지원서 작성',
      buttonVariant: 'gradient',
    };
  }

  switch (applicationStatus) {
    case 'IN_PROGRESS':
      return {
        title: '지원서 작성을 진행 중이에요.',
        description: '저장된 내용을 이어서 작성하고, 위시커넥트와 함께 지원서를 완성해보세요.',
        buttonText: '이어서 지원서 작성하기',
        buttonVariant: 'primary',
      };

    case 'COMPLETED':
      return {
        title: '지원서 작성을 완료했어요!',
        description: '내가 작성한 지원서와 AI가 생성한 면접 예상 질문과 답변을 확인해보세요.',
        buttonText: '작성한 지원서 확인하기',
        buttonVariant: 'gradient',
      };

    case 'NOT_STARTED':
    default:
      return {
        title: 'AI가 당신의 경험을 분석하여 강점이 드러나는 맞춤 지원서 초안을 만들어드려요.',
        description: '지원서 작성 시간을 줄이고, 합격 가능성을 높여보세요!',
        buttonText: '지원서 작성 시작하기',
        buttonVariant: 'primary',
      };

    case 'NOT_REQUIRED':
      return {
        title: '지원서를 작성하지 않아도 되는 장학금',
        description: '서류 없이 지금 바로 장학금을 신청하세요.',
        buttonText: '장학금 바로 지원하기',
        buttonVariant: 'gradient',
      };
  }
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
  const [isScrapped, setIsScrapped] = useState(false);
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // 아카이빙 api 재사용
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('NOT_STARTED');
  const [applicationId, setApplicationId] = useState<number | string | null>(null);

  const locationState = location.state as DetailLocationState | null;
  const profileProgress = locationState?.profileCompletionRate ?? 0;
  const isOnboarded = Boolean(user?.onboardingCompleted);

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

  useEffect(() => {
    if (!isLoggedIn || !id) return;

    const loadApplicationStatus = async () => {
      try {
        const data = await getArchive({ page: 1, size: 100 });

        const matched = data.items.find((item) => String(item.scholarshipId) === String(id));

        if (matched) {
          setApplicationStatus(matched.applicationStatus as ApplicationStatus);
          setApplicationId(matched.applicationId);
        } else {
          setApplicationStatus('NOT_STARTED');
          setApplicationId(null);
        }
      } catch (error) {
        console.error('지원 상태 조회 실패:', error);
      }
    };

    void loadApplicationStatus();
  }, [id, isLoggedIn]);

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

  // const detailWithApplication = detail as ScholarshipDetailWithApplication;

  /**
   * 백엔드에서 applicationStatus가 아직 오지 않는 동안에는
   * 작성 전 상태로 표시합니다.
   */
  // const applicationStatus: ApplicationStatus =
  //   detailWithApplication.applicationStatus ?? 'NOT_STARTED';

  // const applicationId = detailWithApplication.applicationId ?? null;

  const applicationBannerContent = getApplicationBannerContent(isLoggedIn, applicationStatus);
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

  const handleScrap = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (isScrapLoading) {
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

  const handleShare = async () => {
    if (!detail.detailUrl) {
      alert('공유할 장학금 원문 주소가 없습니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(detail.detailUrl);

      setShowShareToast(true);

      window.setTimeout(() => {
        setShowShareToast(false);
      }, 2000);
    } catch (error) {
      console.error('장학금 링크 복사 실패:', error);
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleApplicationButtonClick = async () => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: location.pathname,
        },
      });
      return;
    }

    if (applicationId) {
      if (applicationStatus === 'COMPLETED') {
        // 임시 경로
        navigate(`/complete/${applicationId}`, {
          state: {
            scholarshipId: detail.scholarshipId,
            scholarshipTitle: detail.title,
            applicationStatus,
          },
        });
      } else {
        navigate(`/write/${applicationId}`, {
          state: {
            scholarshipId: detail.scholarshipId,
            scholarshipTitle: detail.title,
            applicationStatus,
          },
        });
      }
      return;
    }

    try {
      const cleanId = Number(String(detail.scholarshipId).replace('sch-', ''));

      const response = await postStartApplication({
        scholarshipId: cleanId,
      });

      if (response.success && response.data) {
        const newApplicationId = response.data.applicationId;

        navigate(`/write/${newApplicationId}`, {
          state: {
            scholarshipId: detail.scholarshipId,
            scholarshipTitle: detail.title,
            applicationStatus,
          },
        });
      }
    } catch (error) {
      console.error('지원서 생성 실패:', error);
    }

    // navigate('/write', {
    //   state: {
    //     scholarshipId: detail.scholarshipId,
    //     scholarshipTitle: detail.title,
    //     applicationId,
    //     applicationStatus,
    //   },
    // });
  };

  return (
    <div className="min-h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header isLoggedIn={isLoggedIn} isSearchMode onBack={() => navigate(-1)} />
      {showShareToast && (
        <div className="fixed inset-0 z-[100] bg-black/50">
          <div className="absolute left-1/2 top-[32px] flex h-[48px] w-[195px] -translate-x-1/2 items-center justify-center rounded-[8px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.16)]">
            <img src={ShareCheck} alt="장학금 링크 복사완료" />
          </div>
        </div>
      )}
      <div className="flex">
        <div className="relative ml-[64px] w-[237px] shrink-0">
          <LeftSidebar activeId="curating" />

          {isLoggedIn && !isOnboarded && (
            <div className="fixed bottom-[16px] left-[78px] z-10 h-[224px] w-[208px] rounded-[16px] bg-white px-[20px] pt-[20px] pb-[16px] shadow-[0_1px_7px_0_rgba(0,0,0,0.08)]">
              <p className="text-[12px] font-medium leading-[16px] text-[#555964]">
                더 정확한 추천을 위해
              </p>

              <p className="mt-[2px] text-[18px] font-bold leading-[24px] text-[#10131A]">
                프로필을 업데이트
                <br />
                해보세요!
              </p>

              <div className="invisible mt-[50px]">
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

        <main className="w-[1139px] pl-[32px] pr-[64px] pb-[64px]">
          <div className="w-[1043px] pt-[16px]">
            {/* 저장하기 / 공유하기 */}
            <div className="flex h-[32px] items-center gap-[8px]">
              <button
                type="button"
                onClick={handleScrap}
                disabled={isScrapLoading}
                className={`flex h-[32px] w-[98px] items-center justify-center gap-[4px] rounded-[20px] px-[16px] text-[14px] font-medium transition-colors disabled:cursor-not-allowed ${
                  isScrapped
                    ? 'bg-[#7962ED] text-white'
                    : 'border border-[#9DA1AC] bg-white text-[#555964]'
                }`}
              >
                <img src={isScrapped ? Scrap : DetailScrap} alt="" className="h-[16px] w-[13px]" />
                <span className="flex h-[20px] w-[49px] items-center justify-center whitespace-nowrap leading-[20px]">
                  저장하기
                </span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex h-[32px] w-[101px] items-center justify-center gap-[4px] rounded-[20px] bg-[#F3F4F6] px-[16px] text-[14px] leading-[20px] font-medium text-[#747883]"
              >
                <img src={PaperPlane} alt="" />
                <span>공유하기</span>
              </button>
            </div>

            {/* 장학금 이름 */}
            <h1 className="mt-[12px] text-[36px] font-bold leading-[48px] text-[#181C25]">
              {detail.title}
            </h1>

            {/* 마감 정보 */}
            <div className="mt-[12px] flex h-[32px] w-[402px] items-center gap-[8px]">
              <DdayStatus days={detail.dDay ?? 0} />

              <span className="flex h-[20px] items-center text-[#555964]">•</span>

              <span className="flex h-[20px] items-center whitespace-nowrap text-[16px] font-semibold leading-[20px] text-[#555964]">
                {formatDeadline(detail.deadline)}
              </span>

              {detail.detailUrl && (
                <a
                  href={detail.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative top-[1px] flex h-[20px] w-[62px] shrink-0 items-center gap-[2px] whitespace-nowrap text-[14px] font-medium leading-[20px] text-[#747883]"
                >
                  <span className="underline underline-offset-[2px]">웹사이트</span>
                  <span>🡭</span>
                </a>
              )}
            </div>

            {/* 지원서 작성 배너 */}
            <div className="mt-[24px] flex h-[80px] items-center justify-between rounded-[16px] border border-[#D2D4DA] py-[16px] pl-[32px] pr-[18px]">
              <div className="flex min-w-0 items-center gap-[20px]">
                {/*
                  로그인하지 않은 경우 비활성 아이콘,
                  로그인한 경우 온보딩 여부와 관계없이 보라색 활성 아이콘
                */}
                <AiIcon isLoggedIn={isLoggedIn} />

                <div className="min-w-0">
                  <p className="truncate text-[16px] font-bold leading-[20px] text-[#10131A]">
                    {applicationBannerContent.title}
                  </p>

                  <p className="mt-[2px] truncate text-[14px] font-medium leading-[20px] text-[#555964]">
                    {applicationBannerContent.description}
                  </p>
                </div>
              </div>

              <Button
                size="md"
                variant={applicationBannerContent.buttonVariant}
                weight="semibold"
                rightIcon={<ChevronRight />}
                paddingLeft="24px"
                paddingRight="24px"
                className="shrink-0 text-[16px] leading-[24px]"
                onClick={handleApplicationButtonClick}
              >
                {applicationBannerContent.buttonText}
              </Button>
            </div>
          </div>

          {/* 포스터 / 장학금 요약 */}
          <div className="mt-[52px] flex gap-[32px]">
            <div className="h-[432px] w-[326px] overflow-hidden rounded-[16px] bg-[#F3F4F6]">
              {detail.posterUrl ? (
                <img
                  src={detail.posterUrl}
                  alt={detail.title}
                  className="block h-full w-full object-cover"
                />
              ) : (
                <img
                  src={DetailPost}
                  alt=""
                  className="block h-full w-full scale-[1.08] object-cover object-center"
                />
              )}
            </div>

            <div className="flex h-[432px] w-[685px] flex-col rounded-[16px] bg-[#F9FAFC] px-[40px] py-[32px]">
              <h2 className="shrink-0 text-[28px] font-bold leading-[40px]">장학금 요약 정보</h2>

              <div className="mt-[14px] min-h-0 flex-1 overflow-y-auto pr-[8px]">
                <div className="flex justify-between">
                  <div className="flex w-[285px] flex-col gap-[8px]">
                    {leftInfo.map((item) => (
                      <div key={item.label} className="flex gap-[19px]">
                        <span className="h-[24px] w-[49px] shrink-0 text-[14px] font-bold text-[#555964]">
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
                        <span className="h-[24px] w-[52px] shrink-0 text-[14px] font-bold text-[#555964]">
                          {item.label}
                        </span>

                        <span className="text-[14px] font-medium text-[#747883]">
                          {valueOrDefault(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {detail.detailUrl && (
                <a
                  href={detail.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[22px] flex h-[48px] w-[605px] shrink-0 items-center justify-between rounded-[8px] border border-[#9DA1AC] px-[16px]"
                >
                  <span className="text-[16px] font-medium text-[#555964]">자세히 보기</span>

                  <img src={Right} alt="" className="h-[16px] w-[9px]" />
                </a>
              )}
            </div>
          </div>

          {/* 선발 일정 */}
          <section className="relative mt-[52px] h-[278px] w-[1043px] rounded-[16px] border border-[#D2D4DA]">
            <h2 className="absolute left-[32px] top-[32px] h-[32px] w-[88px] whitespace-nowrap text-[24px] font-bold leading-[32px]">
              선발 일정
            </h2>

            {detail.selectionSchedule.length > 0 ? (
              <div className="absolute left-[154px] top-[71px] flex items-start gap-[147px]">
                {detail.selectionSchedule.slice(0, 4).map((schedule, index) => (
                  <div
                    key={`${schedule.step}-${index}`}
                    className="flex w-[80px] shrink-0 flex-col items-center"
                  >
                    <img
                      src={scheduleIcons[index]}
                      alt={schedule.step}
                      className="h-[80px] w-[80px] shrink-0"
                    />

                    <p
                      className={`mt-[7px] whitespace-nowrap text-[20px] font-semibold leading-[28px] ${
                        schedule.status === 'CURRENT' ? 'text-[#7962ED]' : 'text-[#555964]'
                      }`}
                    >
                      {schedule.step}
                    </p>

                    <p className="mt-[4px] whitespace-nowrap text-[14px] font-medium leading-[20px] text-[#747883]">
                      {formatScheduleDate(schedule.date, schedule.step)}
                    </p>

                    <p className="whitespace-nowrap text-[14px] font-medium leading-[20px] text-[#747883]">
                      {getScheduleStatusText(schedule.status as SelectionScheduleStatus)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[14px] text-[#747883]">
                등록된 선발 일정이 없습니다.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
