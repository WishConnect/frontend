import AiIcon from '../../assets/icons/AiIcon';
import ChevronRight from '../../assets/icons/ChevronRight';
import Button from '../../components/Button/Button';
import Right from '../../assets/icons/Right.svg';
import Docu from '../../assets/icons/Docu.svg';
import Announce from '../../assets/icons/Announce.svg';
import Interview from '../../assets/icons/Interview.svg';
import Final from '../../assets/icons/Final.svg';
import PdfIcon from '../../assets/icons/Pdf.svg';
import DownloadIcon from '../../assets/icons/Download.svg';
import PosterImage from '../../assets/images/poster.png';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';

const scholarshipDetail = {
  id: 1,
  title: '서울인재해외교환학생 장학금',

  tags: ['생활비 지원', '전공 우대', '성적 우수'],
  isScrapped: false,

  dDay: 'D-5',
  deadlineStatus: '마감 임박',
  deadline: '2026.05.20(화) 15:00 마감',
  homepageUrl: 'https://www.hissf.or.kr',

  posterImage: PosterImage,

  summary: {
    target: '2026년도 대학 신입생',
    amount: '연간 최대 600만원',
    selectedCount: 'OO명 내외',
    field: '교환학생',
    supportType: '현금 지원 / 생활비',
    duplicateSupport: '교내 · 교외 장학금 중복 수혜 가능',
    organization: 'OO재단',
    contact: '02-000-0000 · hisf@hisf.or.kr',
    selectionCriteria: '서류 심사, 면접 심사 종합 평가',
    gradeCriteria: '직전 학기 성적 3.5/4.5 이상',
    incomeCriteria: '기초 생활 수급자 우선 선발',
    preference: '사회공헌/봉사활동 경험자 우대',
    applicationPeriod: '2026.05.10 ~ 2026.05.20',
    submissionMethod: '이메일 제출',
  },

  schedules: [
    {
      id: 1,
      title: '서류접수',
      date: '2025.05.20 (화)',
      status: '마감',
      isActive: false,
    },
    {
      id: 2,
      title: '서류발표',
      date: '2025.05.30 (금)',
      status: '예정',
      isActive: false,
    },
    {
      id: 3,
      title: '면접전형',
      date: '2025.06.10 (화)',
      status: '예정',
      isActive: false,
    },
    {
      id: 4,
      title: '최종발표',
      date: '2025.06.20 (화)',
      status: '예정',
      isActive: true,
    },
  ],

  documents: [
    {
      id: 1,
      name: '지원서 및 자기소개서 1부',
      fileType: 'pdf',
      downloadUrl: '#',
    },
    {
      id: 2,
      name: '가족 관계 증명서 1부',
      fileType: 'pdf',
      downloadUrl: '#',
    },
    {
      id: 3,
      name: '소득증빙서류 1부',
      fileType: 'pdf',
      downloadUrl: '#',
    },
    {
      id: 4,
      name: '재학증명서 1부',
      fileType: 'pdf',
      downloadUrl: '#',
    },
  ],
};
export default function Detail() {
  const isLoggedIn = true;
  const leftInfo = [
    { label: '지원대상', value: scholarshipDetail.summary.target },
    { label: '지원금액', value: scholarshipDetail.summary.amount },
    { label: '선발인원', value: scholarshipDetail.summary.selectedCount },
    { label: '지원분야', value: scholarshipDetail.summary.field },
    { label: '지원형태', value: scholarshipDetail.summary.supportType },
    { label: '중복지원', value: scholarshipDetail.summary.duplicateSupport },
    { label: '운영기관', value: scholarshipDetail.summary.organization },
    { label: '문의처', value: scholarshipDetail.summary.contact },
  ];

  const rightInfo = [
    { label: '선발기준', value: scholarshipDetail.summary.selectionCriteria },
    { label: '성적 기준', value: scholarshipDetail.summary.gradeCriteria },
    { label: '소득기준', value: scholarshipDetail.summary.incomeCriteria },
    { label: '우대사항', value: scholarshipDetail.summary.preference },
    { label: '지원기간', value: scholarshipDetail.summary.applicationPeriod },
    { label: '제출방법', value: scholarshipDetail.summary.submissionMethod },
  ];
  const navigate = useNavigate();
  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isLoggedIn={false}
        isSearchMode={false}
        onSearch={(query) => {
          navigate(`/curation?keyword=${query}`);
        }}
      />

      <div className="flex">
        <div className="ml-[64px]">
          <LeftSidebar />
        </div>

        <main className="flex w-[1139px] flex-col gap-[52px] pl-[32px] pr-[64px]">
          <div className="w-[1043px] flex-col ">
            <div className="flex gap-[6.25px]">
              {scholarshipDetail.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex h-[24px] items-center rounded-[16px] px-[12px] py-[4px] text-[12px] font-medium leading-[16px] text-[#555964] shadow-[inset_0_0_0_0.7px_#9DA1AC]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-[6px] flex h-[42px] items-center gap-[8px]">
              <h1 className="text-[36px] font-bold leading-[48px] text-[#181C25]">
                {scholarshipDetail.title}
              </h1>

              {/* 임시 스크랩 버튼 */}
              <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#8B5CF6] text-white">
                ★
              </div>

              {/* 임시 공유 버튼 */}
              <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[#D2D4DA]">
                ↗
              </div>
            </div>
            <div className="mt-[12px] flex h-[32px] items-center gap-[8px]">
              {/* 임시 D-Day Badge */}
              <div className="flex h-[32px] items-center justify-center rounded-[8px] bg-[#FF5B64] px-[15px] text-[14px] font-bold leading-[20px] text-white">
                {scholarshipDetail.dDay}
              </div>

              <span className="text-[16px] font-semibold text-[#FF5B64]">
                {scholarshipDetail.deadlineStatus}
              </span>

              <span className="text-[16px] text-[#555964]">•</span>

              <span className="text-[16px] font-semibold text-[#555964]">
                {scholarshipDetail.deadline}
              </span>

              <a
                href={scholarshipDetail.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[2px] text-[14px] font-medium leading-[20px] text-[#747883]"
              >
                <span className="underline underline-offset-[2px]">웹사이트</span>↗
              </a>
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
                className="text-[16px] leading-[24px] "
              >
                {isLoggedIn ? '지원서 작성 시작하기' : '로그인 하고 지원서 작성 시작하기'}
              </Button>
            </div>
          </div>

          {/* MainSection */}
          <div className="flex gap-[32px]">
            <div>
              <img src={scholarshipDetail.posterImage} />
            </div>
            <div className="w-[685px] rounded-[16px] bg-[#F9FAFC] px-[40px] py-[32px]">
              <div className="h-[40px] text-[28px] font-bold leading-[40px] text-[#000000]">
                장학금 요약 정보
              </div>
              <div className="mt-[12px] flex justify-between">
                {/* 왼쪽 */}
                <div className="flex flex-col gap-[16px]">
                  {leftInfo.map((item) => (
                    <div key={item.label} className="flex gap-[19px]">
                      <span className="w-[49px] text-[14px] font-bold text-[#555964]">
                        {item.label}
                      </span>

                      <span className="text-[14px] font-medium text-[#747883]">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* 오른쪽 */}
                <div className="flex flex-col gap-[19px]">
                  {rightInfo.map((item) => (
                    <div key={item.label} className="flex gap-[16px]">
                      <span className="w-[52px] text-[14px] font-bold text-[#555964]">
                        {item.label}
                      </span>

                      <span className="text-[14px] font-medium text-[#747883]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center border border-[#9DA1AC] rounded-[8px] mt-[22px] w-[605px] h-[48px] px-[16px] py-[12px] justify-between">
                <span className="h-[24px] text-[16px] leading-[24px] font-medium text-[#555964] ">
                  자세히 보기
                </span>
                <img src={Right} className="w-[9px] h-[16px]" />
              </div>
            </div>
          </div>
          {/* BottomSection */}
          <div className="flex gap-[32px]">
            {/* 선발 일정 */}
            <div className="h-[320px] w-[685px] rounded-[16px] border border-[#D2D4DA] px-[32px] pt-[32px] pb-[56px]">
              <h2 className="text-[24px] font-bold leading-[32px] text-[#000000]">선발 일정</h2>

              <div className="mt-[32px] ml-[57px] flex gap-[62px]">
                {scholarshipDetail.schedules.map((schedule, index) => {
                  const icons = [Docu, Announce, Interview, Final];
                  const iconSrc = icons[index];
                  const isFinal = schedule.title === '최종발표';

                  return (
                    <div key={schedule.id} className="flex w-[80px] flex-col items-center">
                      <img src={iconSrc} alt={schedule.title} className="h-[64px] w-[64px]" />

                      <p
                        className={`mt-[16px] whitespace-nowrap text-[20px] font-semibold leading-[28px] ${
                          isFinal ? 'text-[#7962ED]' : 'text-[#555964]'
                        }`}
                      >
                        {schedule.title}
                      </p>

                      <p className="mt-[4px] whitespace-nowrap text-[14px] font-medium leading-[20px] text-[#747883]">
                        {index === 0 ? `~ ${schedule.date}` : schedule.date}
                      </p>

                      <p className="whitespace-nowrap text-[14px] font-medium leading-[20px] text-[#747883]">
                        {schedule.status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 제출 서류 */}
            <div className="h-[320px] w-[326px] rounded-[16px] border border-[#D2D4DA] px-[32px] pt-[32px] pb-[32px]">
              <h2 className="text-[24px] font-bold leading-[32px] text-[#000000]">제출 서류</h2>

              <div className="mt-[20px] flex flex-col gap-[11px]">
                {scholarshipDetail.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <img src={PdfIcon} alt="pdf" className="h-[24px] w-[24px]" />

                      <span className="text-[14px] font-medium leading-[20px] text-[#555964]">
                        {document.name}
                      </span>
                    </div>

                    <button type="button">
                      <img src={DownloadIcon} alt="다운로드" className="h-[16px] w-[16px]" />
                    </button>
                  </div>
                ))}
              </div>

              <button className="mt-[24px] flex h-[48px] w-full items-center px-[16px] py-[8px] justify-between rounded-[8px] border border-[#D2D4DA] text-[14px] font-medium text-[#555964]">
                제출 서류 전체 다운로드
                <img src={DownloadIcon} alt="다운로드" className="h-[20px] w-[20px]" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
