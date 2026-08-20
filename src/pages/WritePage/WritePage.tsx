import { useRef } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import Tag from '../../components/Tag';
import Header from '../../components/common/Header/Header';
import Step1, { type Step1Handle } from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { getApplicationDetail, type ApplicationQuestion } from '../../api/archiving/view';
import { putAnswer } from '../../api/write/step2/answer';
import { getArchive } from '../../api/archiving/archive';

export default function WritePage() {
  const tips = [
    {
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 7.06055C0 6.0944 0.18457 5.18522 0.553711 4.33301C0.922852 3.48079 1.43099 2.73112 2.07812 2.08398C2.72982 1.43229 3.47949 0.921875 4.32715 0.552734C5.17936 0.183594 6.08854 -0.000976562 7.05469 -0.000976562C8.02539 -0.000976562 8.93685 0.183594 9.78906 0.552734C10.6413 0.921875 11.3932 1.43229 12.0449 2.08398C12.6966 2.73112 13.207 3.48079 13.5762 4.33301C13.9453 5.18522 14.1299 6.0944 14.1299 7.06055C14.1299 7.28841 14.0615 7.46615 13.9248 7.59375C13.7881 7.72135 13.6331 7.78516 13.46 7.78516C13.2731 7.78516 13.1045 7.72363 12.9541 7.60059C12.8037 7.47298 12.7285 7.29297 12.7285 7.06055C12.7285 6.27669 12.5827 5.54297 12.291 4.85938C11.9993 4.17122 11.5938 3.56738 11.0742 3.04785C10.5547 2.52832 9.95085 2.12272 9.2627 1.83105C8.5791 1.53939 7.8431 1.39355 7.05469 1.39355C6.27083 1.39355 5.53483 1.53939 4.84668 1.83105C4.16309 2.12272 3.5638 2.52832 3.04883 3.04785C2.53385 3.56738 2.13053 4.17122 1.83887 4.85938C1.5472 5.54297 1.40137 6.27669 1.40137 7.06055C1.40137 7.77148 1.51986 8.44368 1.75684 9.07715C1.99837 9.70605 2.33105 10.2689 2.75488 10.7656C3.17871 11.2578 3.66862 11.6589 4.22461 11.9688C4.40234 12.0736 4.52083 12.1966 4.58008 12.3379C4.63932 12.4792 4.65299 12.6182 4.62109 12.7549C4.58919 12.8916 4.52311 13.0101 4.42285 13.1104C4.32259 13.2106 4.19499 13.2699 4.04004 13.2881C3.88965 13.3063 3.73014 13.2699 3.56152 13.1787C2.88249 12.805 2.27409 12.3083 1.73633 11.6885C1.19857 11.0687 0.77474 10.3646 0.464844 9.57617C0.154948 8.7832 0 7.94466 0 7.06055ZM6.86328 12.1738L6.93164 6.78711C6.93164 6.65039 6.98861 6.55924 7.10254 6.51367C7.22103 6.4681 7.32812 6.49544 7.42383 6.5957L11.1357 10.3828C11.236 10.4922 11.2588 10.6061 11.2041 10.7246C11.1494 10.8385 11.0514 10.8955 10.9102 10.8955L9.50195 10.9365L10.6641 13.6162C10.696 13.6846 10.7028 13.7575 10.6846 13.835C10.6663 13.917 10.6162 13.974 10.5342 14.0059L9.85059 14.2725C9.76855 14.3044 9.69108 14.3021 9.61816 14.2656C9.5498 14.2292 9.49967 14.1722 9.46777 14.0947L8.37402 11.3809L7.39648 12.3721C7.30078 12.4769 7.18685 12.5065 7.05469 12.4609C6.92253 12.4199 6.85872 12.3242 6.86328 12.1738Z"
            fill="#373B46"
          />
        </svg>
      ),
      title: '구체적으로 작성하기',
      desc: '경험의 상황, 행동, 결과를\n구체적으로 서술해보세요.',
    },
    {
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.06152 14.1221C6.08626 14.1221 5.17253 13.9375 4.32031 13.5684C3.4681 13.2038 2.71842 12.6979 2.07129 12.0508C1.42415 11.4082 0.916016 10.6608 0.546875 9.80859C0.182292 8.95182 0 8.03581 0 7.06055C0 6.08529 0.182292 5.17155 0.546875 4.31934C0.916016 3.46257 1.42415 2.71061 2.07129 2.06348C2.71842 1.41634 3.4681 0.910482 4.32031 0.545898C5.17253 0.181315 6.08626 -0.000976562 7.06152 -0.000976562C8.03678 -0.000976562 8.95052 0.181315 9.80273 0.545898C10.6595 0.910482 11.4115 1.41634 12.0586 2.06348C12.7057 2.71061 13.2116 3.46257 13.5762 4.31934C13.9453 5.17155 14.1299 6.08529 14.1299 7.06055C14.1299 8.03581 13.9453 8.95182 13.5762 9.80859C13.2116 10.6608 12.7057 11.4082 12.0586 12.0508C11.4115 12.6979 10.6595 13.2038 9.80273 13.5684C8.95052 13.9375 8.03678 14.1221 7.06152 14.1221ZM7.06152 12.7275C7.84538 12.7275 8.5791 12.5794 9.2627 12.2832C9.94629 11.9915 10.5479 11.5859 11.0674 11.0664C11.5915 10.5469 11.9993 9.94531 12.291 9.26172C12.5827 8.57812 12.7285 7.8444 12.7285 7.06055C12.7285 6.27669 12.5827 5.54297 12.291 4.85938C11.9993 4.17122 11.5915 3.56966 11.0674 3.05469C10.5479 2.53516 9.94629 2.12956 9.2627 1.83789C8.5791 1.54167 7.84538 1.39355 7.06152 1.39355C6.28223 1.39355 5.5485 1.54167 4.86035 1.83789C4.17676 2.12956 3.5752 2.53516 3.05566 3.05469C2.53613 3.56966 2.12826 4.17122 1.83203 4.85938C1.54036 5.54297 1.39453 6.27669 1.39453 7.06055C1.39453 7.8444 1.54036 8.57812 1.83203 9.26172C2.12826 9.94531 2.53613 10.5469 3.05566 11.0664C3.5752 11.5859 4.17676 11.9915 4.86035 12.2832C5.5485 12.5794 6.28223 12.7275 7.06152 12.7275ZM6.32324 10.3076C6.19564 10.3076 6.08171 10.2803 5.98145 10.2256C5.88118 10.1663 5.7832 10.0798 5.6875 9.96582L4.07422 7.99707C3.95573 7.84668 3.89648 7.69401 3.89648 7.53906C3.89648 7.37044 3.95345 7.22689 4.06738 7.1084C4.18587 6.98535 4.32715 6.92383 4.49121 6.92383C4.59603 6.92383 4.68945 6.94661 4.77148 6.99219C4.85807 7.0332 4.94238 7.1084 5.02441 7.21777L6.2959 8.83105L8.99609 4.50391C9.13737 4.27148 9.3151 4.15527 9.5293 4.15527C9.6888 4.15527 9.83236 4.20768 9.95996 4.3125C10.0876 4.41732 10.1514 4.55404 10.1514 4.72266C10.1514 4.80013 10.1331 4.87988 10.0967 4.96191C10.0648 5.03939 10.026 5.1123 9.98047 5.18066L6.9248 9.95898C6.77897 10.1914 6.57845 10.3076 6.32324 10.3076Z"
            fill="#373B46"
          />
        </svg>
      ),
      title: '진정성 있게 작성하기',
      desc: '당신의 진짜 경험과 생각을\n솔직하게 담아보세요.',
    },
    {
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.60156 11.8398C3.41471 11.9219 3.23242 11.9492 3.05469 11.9219C2.87695 11.8945 2.71973 11.8125 2.58301 11.6758L1.59863 10.6914C1.45736 10.5501 1.37533 10.3906 1.35254 10.2129C1.32975 10.0352 1.3571 9.85286 1.43457 9.66602L2.39844 7.40332C2.4349 7.32129 2.47135 7.25521 2.50781 7.20508C2.54427 7.15039 2.58984 7.0957 2.64453 7.04102L9.24121 0.492188C9.56934 0.164062 9.91797 0.00227865 10.2871 0.00683594C10.6608 0.0113932 11.014 0.177734 11.3467 0.505859L12.8232 1.99609C13.1559 2.32878 13.3223 2.68197 13.3223 3.05566C13.3223 3.4248 13.1582 3.77344 12.8301 4.10156L6.24023 10.6572C6.18099 10.7119 6.12402 10.7575 6.06934 10.7939C6.01921 10.8304 5.95085 10.8646 5.86426 10.8965L3.60156 11.8398ZM3.47168 10.6436L5.41309 9.82324L11.9346 3.34277C12.126 3.15592 12.1328 2.97135 11.9551 2.78906L10.5605 1.38086C10.474 1.28971 10.3805 1.24642 10.2803 1.25098C10.1846 1.25553 10.0911 1.30111 10 1.3877L3.47168 7.875L2.6377 9.80957C2.61491 9.87337 2.60579 9.93262 2.61035 9.9873C2.61491 10.0374 2.64681 10.0898 2.70605 10.1445L3.13672 10.5752C3.19141 10.6299 3.24382 10.6595 3.29395 10.6641C3.34863 10.6686 3.40788 10.6618 3.47168 10.6436ZM0.8125 12.2021C0.648438 12.2021 0.54362 12.1429 0.498047 12.0244C0.457031 11.9059 0.488932 11.792 0.59375 11.6826L1.77637 10.4453L2.8291 11.5117L2.14551 12.0449C2.07259 12.1042 2.00651 12.1452 1.94727 12.168C1.88802 12.1908 1.80599 12.2021 1.70117 12.2021H0.8125ZM2.71289 7.83398L3.44434 7.10254L6.32227 9.99414L5.59082 10.7324L2.71289 7.83398ZM8.41406 2.17383L9.14551 1.44922L12.0303 4.34082L11.292 5.06543L8.41406 2.17383ZM0.59375 14.6289C0.429688 14.6289 0.288411 14.5674 0.169922 14.4443C0.0559896 14.3258 -0.000976562 14.1868 -0.000976562 14.0273C-0.000976562 13.8633 0.0559896 13.722 0.169922 13.6035C0.288411 13.485 0.429688 13.4258 0.59375 13.4258H13.7051C13.8691 13.4258 14.0104 13.485 14.1289 13.6035C14.2474 13.722 14.3066 13.8633 14.3066 14.0273C14.3066 14.1914 14.2474 14.3327 14.1289 14.4512C14.0104 14.5697 13.8691 14.6289 13.7051 14.6289H0.59375Z"
            fill="#373B46"
          />
        </svg>
      ),
      title: '분량 가이드',
      desc: '300자 ~ 500자 내외로\n작성하는 것을 추천드려요.',
    },
  ];

  const navigate = useNavigate();

  const { scholarshipId: _, applicationId: paramAppId } = useParams();
  const applicationId = Number(paramAppId) || 1;

  const [scholarshipTitle, setScholarshipTitle] = useState('');
  const [, setApplicationStatus] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);

  const [questionCategories, setQuestionCategories] = useState<string[]>([]);
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [step2Category, setStep2Category] = useState(0);
  const [, setAnswers] = useState<Record<number, Record<number, string>>>({});
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [progressByCategory, setProgressByCategory] = useState<Record<number, boolean>>({});

  const [deadline, setDeadline] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeadline = async () => {
        try {
            const data = await getArchive({ page: 1, size: 100 });
            const matched = data.items.find(
                (item) => item.applicationId === applicationId
            );
            if (matched) {
                setDeadline(matched.deadline);
            }
        } catch (error) {
            console.error('신청기간 조회 실패:', error);
        }
    };
    fetchDeadline();
}, [applicationId]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const res = await getApplicationDetail(applicationId);

        if (res.success && res.data) {
          setScholarshipTitle(res.data.scholarshipTitle);
          setApplicationStatus(res.data.status);

          const savedQuestions = res.data.questions;
          const categories = savedQuestions.map((q) => q.title);
          setQuestionCategories(categories);

          const ids = savedQuestions.map((q) => q.questionId);
          setQuestionIds(ids);

          const initialAnswers: Record<number, Record<number, string>> = {};
          const initialDrafts: Record<number, string> = {};

          // 임시
          savedQuestions.forEach((savedQ: any, qIndex: number) => {
            initialAnswers[qIndex] = {};
            initialDrafts[qIndex] = savedQ.answer?.userContent || '';

            if (savedQ.interviews) {
              savedQ.interviews.forEach((interview: any) => {
                initialAnswers[qIndex][interview.stepOrder] = interview.answerText || '';
              });
            }
          });

          setQuestions(savedQuestions);
          setAnswers(initialAnswers);
          setDrafts(initialDrafts);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('지원서 통합 상세 정보 불러오기 실패:', error);
      }
    };
    fetchApplicationData();
  }, [applicationId]);

  // 임시저장
  const step1Ref = useRef<Step1Handle>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const isStep1Complete =
    questionCategories.length > 0 &&
    questionCategories.every((_, idx) => progressByCategory[idx] === true);

  const isNextEnabled = currentStep === 1 ? isStep1Complete : true;

  // 다음
  const handleNextStep = async () => {
    if (currentStep === 1) {
        try {
            await step1Ref.current?.saveCurrentCategory();
        } catch (error) {
            console.error('저장 실패:', error);
            return;
        }
        setCurrentStep(2);
    } else if (currentStep === 2) {
        setCurrentStep(3);
    }
};

  const handleSaveDraft = async () => {
    setSaveStatus('saving');
      try {
          if (currentStep === 1) {
              await step1Ref.current?.saveCurrentCategory();
          } else if (currentStep === 2) {
              const questionId = questionIds[step2Category];
              if (questionId) {
                  await putAnswer(applicationId, questionId, {
                      action: 'save',
                      userContent: drafts[step2Category] ?? '',
                  });
              }
          }
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 1500);
      } catch (error) {
          console.error('임시저장 실패:', error);
          setSaveStatus('error');
      }
  };

  // 완료
  const handleComplete = async () => {
    try {
        let lastResponse;

        for (let idx = 0; idx < questionIds.length; idx++) {
            const questionId = questionIds[idx];
            if (!questionId) continue;

            lastResponse = await putAnswer(applicationId, questionId, {
                action: 'confirm',
                userContent: drafts[idx] ?? '',
            });
        }

        if (lastResponse?.data?.applicationCompleted) {
            navigate('/');
        } else {
            console.error('일부 문항이 완료되지 않았습니다.');
        }
    } catch (error) {
        console.error('완료 처리 실패:', error);
    }
};

  return (
    <div className="w-[1440px] min-h-screen font-['Pretendard']">
      <header className="mb-[16px]">
        <Header
          isSearchMode={true}
          onBack={() => {
            navigate(-1);
          }}
        />
      </header>

      <div className="flex flex-1 relative">
        <aside className="relative ml-[64px] ">
          <LeftSidebar />

          {/* 작성 도움말 */}
          {currentStep === 1 ? (
            <div className='fixed'>
              <div className="absolute bottom-[32px] left-[15px] z-10 w-[208px] h-[303px] rounded-[16px] pl-[19px] pr-[43px] pt-[24px] pb-[36px] bg-[#FFF]">
                <span className="block text-[#181C25] text-[16px] font-[700] mb-[20px]">
                  작성 도움말
                </span>
                <div className="flex flex-col gap-[21px]">
                  {tips.map((item, idx) => (
                    <div key={idx} className="flex gap-[4px] items-start">
                      <div>{item.icon}</div>
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[#373B46] text-[12px] font-[600]">{item.title}</span>
                        <span className="text-[#747883] text-[12px] font-[500] whitespace-pre-line">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </aside>

        <main className="flex-1 flex flex-col ml-[32px]">
          {/* 상단 타이틀 */}
          <div className="flex justify-between items-start gap-[40px]">
            <div className="flex flex-col gap-[12px]">
              <div className="flex items-center gap-[8px]">
                <div className=''>
                  <span className="text-[#181C25] text-[36px] font-[700]">{scholarshipTitle}{' '}</span>
                  <span className="inline-block align-middle -translate-y-[12px]">
                    <Tag variant="primary">
                      신청가능
                    </Tag>
                  </span>
                </div>
              </div>
              <div className="flex items-center text-[#555964] font-[600] text-[16px] gap-[8px] flex">
                <span>신청기간</span>
                <span>•</span>

                <span>{deadline ? `~ ${deadline.slice(0, 10).replaceAll('-', '.')}` : '정보 없음'}</span>
              </div>
            </div>

            <div className="flex gap-[11px] mr-[64px]">
              {currentStep === 3 ? (
                <button
                  onClick={handleComplete}
                  className="flex justify-center items-center mt-[5px] w-[148px] h-[48px] rounded-[8px] bg-gradient-to-r from-[#7962ED] to-[#BDB9F9] text-white text-[18px] font-[600] transition-colors hover:bg-[#6049C4]"
                >
                  완료
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saveStatus === 'saving'}
                    className="flex justify-center items-center w-[148px] h-[48px] p-[16px] rounded-[8px] border border-[#9DA1AC] text-[#555964] text-[18px] font-[600]"
                  >
                    {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'saved' ? '저장됨' : '임시저장'}
                  </button>
                  <button
                    disabled={!isNextEnabled}
                    onClick={handleNextStep}
                    className={`flex justify-center items-center w-[148px] h-[48px] p-[16px] rounded-[8px] text-[18px] font-[600] transition-colors ${
                      isNextEnabled
                        ? 'bg-[#7962ED] text-white cursor-pointer hover:bg-[#6049C4]'
                        : 'bg-[#F3F4F6] text-[#9DA1AC] cursor-not-allowed'
                    }`}
                  >
                    다음
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 진행 상태 */}
          <div className="flex items-center mt-[16px] mb-[22px]">
            <div className="flex items-center">
              <div
                className={`flex justify-center items-center w-[24px] h-[24px] rounded-full text-[14px] font-[500] ${currentStep === 1 ? 'bg-[#7962ED] text-white' : 'bg-[#FFF] border border-[#E6E7E8] text-[#9DA1AC]'}`}
              >
                1
              </div>
              <span className={`ml-[8px] text-[16px] font-[500] text-[#555964]`}>사전 인터뷰</span>
            </div>
            <div className="w-[76px] h-[1px] bg-[#9DA1AC] mx-[12px]"></div>
            <div className="flex items-center">
              <div
                className={`flex justify-center items-center w-[24px] h-[24px] rounded-full text-[14px] font-[500] ${currentStep === 2 ? 'bg-[#7962ED] text-white' : 'bg-[#FFF] border border-[#E6E7E8] text-[#9DA1AC]'}`}
              >
                2
              </div>
              <span className={`ml-[8px] text-[16px] font-[500] text-[#555964]`}>
                초안 확인 및 수정
              </span>
            </div>
            <div className="w-[76px] h-[1px] bg-[#9DA1AC] mx-[12px]"></div>
            <div className="flex items-center">
              <div
                className={`flex justify-center items-center w-[24px] h-[24px] rounded-full text-[14px] font-[500] ${currentStep === 3 ? 'bg-[#7962ED] text-white' : 'bg-[#FFF] border border-[#E6E7E8] text-[#9DA1AC]'}`}
              >
                3
              </div>
              <span className={`ml-[8px] text-[16px] font-[500] text-[#555964]`}>저장 및 관리</span>
            </div>
          </div>

          <div className="w-full">
            {!isLoaded ? (
              <div className="flex items-center justify-center h-[500px] text-[#747883]">
                질문 양식을 불러오는 중입니다.
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <Step1
                    ref={step1Ref}
                    applicationId={applicationId}
                    questionCategories={questionCategories}
                    questions={questions}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    onProgressChange={(idx, isComplete) =>
                      setProgressByCategory((prev) => ({ ...prev, [idx]: isComplete }))
                    }
                  />
                )}
                {currentStep === 2 && (
                  <Step2
                    applicationId={applicationId}
                    questionCategories={questionCategories}
                    questionIds={questionIds}
                    questions={questions}
                    step2Category={step2Category}
                    setStep2Category={setStep2Category}
                    drafts={drafts}
                    setDrafts={setDrafts}
                  />
                )}
                {currentStep === 3 && (
                  <Step3 questionCategories={questionCategories} drafts={drafts} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
