import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from "../../components/common/Header/Header";
import LeftSidebar from "../../components/LeftSidebar";
import Tag from "../../components/Tag";
import { getApplicationDetail, type ApplicationQuestion } from '../../api/archiving/view';
import { getApplications } from '../../api/archiving/list';
import { getInterviewQuestions, postInterviewQuestions, type InterviewQuestion, type InterviewRequirement } from '../../api/questions/interview';


{/* 지원서 */}
function ApplicationAccordionItem({ item }: { item: { id: number; title: string; content: string; charCount: number } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={"border-[#E6E7E8] border rounded-[8px] bg-white"}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-[24px] py-[20px]"
      >
        <div className="flex items-center gap-[8px]">
          <div className="flex justify-center items-center w-[24px] h-[24px] rounded-full bg-[#7962ED] text-white text-[14px] font-[500] mt-[2px]">
            {item.id}
          </div>
          <span className={"text-[20px] font-[600] text-[#10131A]"}>
            {item.title}
          </span>
        </div>
        <svg
          className={`w-[24px] h-[24px] shrink-0 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9L12 15L18 9" stroke={isOpen ? '#181C25' : '#9DA1AC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="mr-[37px] ml-[23px] mb-[14px] pt-[8px] bg-[#F9FAFC] rounded-[8px]">
          <p className="text-[#555964] text-[14px] font-[500] pt-[15px] pl-[23px] pr-[25px]">
            {item.content || '작성된 내용이 없습니다.'}
          </p>
          <div className="pb-[14px] mt-[28px] mb-[14px] mr-[25px] text-right text-[#555964] text-[14px] font-[500]">
            ({item.charCount}자)
          </div>
        </div>
      )}
    </div>
  );
}

{/* 면접 예상 질문 */}
function InterviewAccordionItem({ item }: { item: InterviewQuestion & { id: number } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={"border-[#D2D4DA] rounded-[8px] border gap-[20px]"}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-[24px] pr-[28px] py-[20px] flex items-start"
      >
        <div className="flex flex-col gap-[12px] w-full">
          <div className="flex gap-[8px]">
            <div className="flex justify-center items-center w-[24px] h-[24px] rounded-full bg-[#7962ED] text-white text-[14px] font-[500] shrink-0 mt-[2px]">
              {item.id}
            </div>
            <div className="gap-[16px]">
              <span className={`flex text-[18px] font-[700] ${isOpen ? 'text-[#181C25]' : 'text-[#373B46]'}`}>
                {item.questionText}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-[8px]">
            <div className="flex items-start gap-[12px]">
              <Tag variant="pale">질문의도</Tag>
              <span className="text-[#555964] text-[16px] font-[500]">
                {item.intent}
              </span>
            </div>
          </div>
        </div>
        <svg
          className={`w-[24px] h-[24px] shrink-0 transform transition-transform mt-[2px] ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9L12 15L18 9" stroke={isOpen ? '#181C25' : '#9DA1AC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export default function Complete() {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId: paramAppId } = useParams();
  const applicationId = Number(paramAppId) || 1;

  const locationState = location.state as { scholarshipId?: number | string } | null;

  const [activeTab, setActiveTab] = useState<'application' | 'interview'>('application');

  const [scholarshipTitle, setScholarshipTitle] = useState('');
  const [scholarshipId, setScholarshipId] = useState<number | string | null>(
      locationState?.scholarshipId ?? null
  );
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewRequirement, setInterviewRequirement] = useState<InterviewRequirement>(null);
  const [interviewEvidence, setInterviewEvidence] = useState<string | null>(null);
  const [isInterviewLoaded, setIsInterviewLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getApplicationDetail(applicationId);
        if (res.success && res.data) {
          setScholarshipTitle(res.data.scholarshipTitle);
          setQuestions(res.data.questions);
        }
      } catch (error) {
        console.error('작성 완료 지원서 조회 실패:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchData();
  }, [applicationId]);

  useEffect(() => {
    if (scholarshipId) return;

    const resolveScholarshipId = async () => {
      try {
        const res = await getApplications(undefined, 0, 100);
        if (res.success && res.data) {
          const matched = res.data.content.find(
            (app) => app.applicationId === applicationId
          );
          if (matched) {
            setScholarshipId(matched.scholarshipId);
          }
        }
      } catch (error) {
        console.error('scholarshipId 조회 실패:', error);
      }
    };

    resolveScholarshipId();
  }, [applicationId, scholarshipId]);

  useEffect(() => {
    if (activeTab !== 'interview' || !scholarshipId || isInterviewLoaded) return;

    const fetchInterviewQuestions = async () => {
      try {
        const res = await getInterviewQuestions(scholarshipId);

        if (res.success && res.data) {
          if (res.data.questions.length === 0 && res.data.interviewRequirement !== 'NOT_REQUIRED') {
            const generated = await postInterviewQuestions(scholarshipId);
            if (generated.success && generated.data) {
              setInterviewQuestions(generated.data.questions);
              setInterviewRequirement(generated.data.interviewRequirement);
              setInterviewEvidence(generated.data.interviewEvidence);
            }
          } else {
            setInterviewQuestions(res.data.questions);
            setInterviewRequirement(res.data.interviewRequirement);
            setInterviewEvidence(res.data.interviewEvidence);
          }
        }
      } catch (error: any) {
        console.error('면접 예상 질문 조회/생성 실패:', error);
        if (error?.response?.status === 429) {
          console.warn('면접 예상 질문 생성 한도를 초과했습니다.');
        } else if (error?.response?.status === 503) {
          console.warn('AI가 질문 생성에 실패했습니다. 다시 시도해주세요.');
        }
      } finally {
        setIsInterviewLoaded(true);
      }
    };

    fetchInterviewQuestions();
  }, [activeTab, scholarshipId, isInterviewLoaded]);

  const answerItems = questions.map((q, idx) => ({
    id: idx + 1,
    title: q.title,
    content: q.answer?.userContent ?? '',
    charCount: q.answer?.charCount ?? 0,
  }));

  const renderInterviewTab = () => {
    if (!scholarshipId) {
      return (
        <div className="flex items-center justify-center h-[200px] text-[#747883]">
          장학금 정보를 찾을 수 없어 면접 예상 질문을 불러올 수 없어요.
        </div>
      );
    }

    if (!isInterviewLoaded) {
      return (
        <div className="flex items-center justify-center h-[300px] text-[#747883]">
          면접 예상 질문을 불러오는 중입니다...
        </div>
      );
    }

    if (interviewRequirement === 'NOT_REQUIRED') {
      return (
        <div className="flex items-center justify-center h-[200px] text-[#747883]">
          이 장학금은 면접이 없어요.
        </div>
      );
    }

    if (interviewQuestions.length === 0) {
      return (
        <div className="flex items-center justify-center h-[200px] text-[#747883]">
          아직 준비된 면접 예상 질문이 없어요.
        </div>
      );
    }

    return (
      <>
        {interviewRequirement === 'CONDITIONAL' && interviewEvidence && (
          <p className="text-[13px] text-[#9DA1AC] mb-[8px]">
            공고 근거: {interviewEvidence} (공고 확인 필요)
          </p>
        )}
        {interviewQuestions.map((item, idx) => (
          <InterviewAccordionItem key={idx} item={{ ...item, id: idx + 1 }} />
        ))}
      </>
    );
  };

  return (
    <div className="w-[1440px] min-h-screen">
      <header className="mb-[16px]">
        <Header isSearchMode={true} onBack={() => navigate(-1)} />
      </header>

      <div className="flex flex-1 relative">
        <aside className="relative ml-[64px] min-h-screen">
          <LeftSidebar />
        </aside>

        <main className="flex-1 flex flex-col ml-[32px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-[12px]">
              <div className="flex items-center gap-[8px]">
                <h1 className="text-[#181C25] text-[36px] font-[700]">{scholarshipTitle}</h1>
                <Tag variant="primary">작성 완료</Tag>
              </div>
              <div className="flex items-center text-[#555964] font-[600] text-[16px] gap-[8px] flex">
                <span>신청기간</span><span>•</span><span>정보 없음</span>
              </div>
            </div>
          </div>

          <div className="flex w-full py-[4px] gap-[4px] px-[8px] h-[48px] mt-[19.5px] bg-[#F3F4F6] rounded-[100px]">
            <button
              onClick={() => setActiveTab('application')}
              className={`flex-1 flex justify-center items-center px-[6px] py-[3px] rounded-[20px] text-[13px] font-['SF Pro'] font-[590] transition-colors ${
                activeTab === 'application' ? 'bg-[#7962ED] text-[#F3F4F6]' : 'text-[#272B36] font-[510]'
              }`}
            >
              내가 작성한 지원서
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`flex-1 flex justify-center items-center px-[6px] py-[3px] rounded-[20px] text-[13px] font-['SF Pro'] font-[590] transition-colors ${
                activeTab === 'interview' ? 'bg-[#7962ED] text-[#F3F4F6]' : 'text-[#272B36] font-[510]'
              }`}
            >
              면접 예상 질문
            </button>
          </div>

          <div className="flex flex-col gap-[12px] mt-[16px]">
            {!isLoaded ? (
              <div className="flex items-center justify-center h-[300px] text-[#747883]">
                불러오는 중입니다...
              </div>
            ) : activeTab === 'application' ? (
              answerItems.map((item) => <ApplicationAccordionItem key={item.id} item={item} />)
            ) : (
              renderInterviewTab()
            )}
          </div>
        </main>
      </div>
    </div>
  );
}