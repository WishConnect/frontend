import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeftSidebar from "../../components/LeftSidebar";
import Tag from "../../components/Tag";
import Header from "../../components/common/Header/Header";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import { putInterviewAnswer } from '../../api/write/step1/Interview';
import { putSaveDraft } from '../../api/write/step2/SaveDraft';
import { postComplete } from '../../api/write/step3/Complete';
import { getInterviewTemplate, type Question, type WritingTip } from '../../api/write/step1/Detail';
import { getApplicationDetail } from '../../api/archiving/view';


export default function WritePage() {
    const navigate = useNavigate();

    const { scholarshipId: paramScholarId, applicationId: paramAppId } = useParams();
    const applicationId = Number(paramAppId) || 1;
    const scholarshipId = Number(paramScholarId) || 1;

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [tips, setTips] = useState<WritingTip[]>([]);
    const [questionCategories, setQuestionCategories] = useState<string[]>([]);

    const [selectedCategory, setSelectedCategory] = useState(0);
    const [step2Category, setStep2Category] = useState(0);
    const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({});
    const [drafts, setDrafts] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await getInterviewTemplate(scholarshipId);
                
                if (res.success && res.data) {
                    const fetchedQuestions = res.data.questions;
                    setQuestions(fetchedQuestions);
                    setTips(res.data.writingTips);
                    
                    const categories = fetchedQuestions.map(q => q.title);
                    setQuestionCategories(categories);

                    const initialAnswers: Record<number, Record<number, string>> = {};
                    const initialDrafts: Record<number, string> = {};

                    fetchedQuestions.forEach((q, idx) => {
                        initialAnswers[idx] = {};
                        q.subQuestions.forEach(sq => {
                            initialAnswers[idx][sq.id] = "";
                        });
                        initialDrafts[idx] = "";
                    });

                    try {
                        const detailRes = await getApplicationDetail(applicationId);
                        
                        if (detailRes.success && detailRes.data) {
                            const savedQuestions = detailRes.data.questions;

                            savedQuestions.forEach((savedQ, qIndex) => {
                                if (savedQ.interviews) {
                                    savedQ.interviews.forEach(interview => {
                                        initialAnswers[qIndex][interview.stepOrder] = interview.answerText || "";
                                    });
                                }

                                if (savedQ.answer && savedQ.answer.userContent) {
                                    initialDrafts[qIndex] = savedQ.answer.userContent;
                                }
                            });
                        }
                    } catch (detailError) {
                        console.log("새로 작성하는 지원서입니다. (기존 데이터 없음)");
                    }

                    setAnswers(initialAnswers);
                    setDrafts(initialDrafts);
                    setIsLoaded(true);
                }
            } catch (error) {
                console.error("템플릿 로딩 실패:", error);
            }
        };

        fetchTemplate();
    }, [scholarshipId, applicationId]);

    const completedCount = isLoaded ? questionCategories.filter((_, cIdx) => {
        const currentQ = questions[cIdx];
        if (!currentQ) return false;
        return currentQ.subQuestions.every((sq) => answers[cIdx]?.[sq.id]?.trim().length > 0);
    }).length : 0;
    
    const isStep1Complete = questionCategories.length > 0 && completedCount === questionCategories.length;
    const isStep2Complete = questionCategories.length > 0 && questionCategories.every((_, idx) => drafts[idx]?.trim().length > 0);
    const isNextEnabled = currentStep === 1 ? isStep1Complete : currentStep === 2 ? isStep2Complete : false;

    // 다음
    const handleNextStep = async () => {
        if (currentStep === 1) {
            try {
                const promises = questionCategories.map((_, categoryIdx) => {
                    const questionId = categoryIdx + 1;
                    const categoryAnswers = answers[categoryIdx];
                    
                    const requestData = {
                        answers: Object.entries(categoryAnswers).map(([subId, ans]) => ({
                            subQuestionId: Number(subId),
                            answer: ans
                        }))
                    };

                    return putInterviewAnswer(applicationId, questionId, requestData);
                });

                await Promise.all(promises);
                setCurrentStep(2);
                
            } catch (error) {
                console.error("인터뷰 답변 저장 실패:", error);
            }
        } 
        else if (currentStep === 2) {
            setCurrentStep(3);
        }
    };

    // 임시저장
    const handleSaveDraft = async () => {
        if (currentStep === 1) {
            
        } 
        else if (currentStep === 2) {
            try {
                const promises = Object.entries(drafts).map(([categoryIdx, content]) => {
                    if (!content || content.trim().length === 0) return null;

                    const questionId = Number(categoryIdx) + 1;
                    const requestData = {
                        content: content,
                        charCount: content.length
                    };
                    
                    return putSaveDraft(applicationId, questionId, requestData);
                }).filter(Boolean);

                await Promise.all(promises);
                
            } catch (error: any) {
                console.error("임시저장 실패:", error);
            }
        }
    };

    // 완료
    const handleComplete = async () => {
        try {
            await postComplete(applicationId);
            navigate('/');
            
        } catch (error: any) {
            console.error("완료 처리 실패:", error);
            
            if (error.response?.status === 400) {
                alert("아직 작성되지 않은 문항이 있습니다. 이전 단계로 돌아가 확인해 주세요.");
            } 
        }
    };


    const handleAnswerChange = (categoryId: number, questionId: number, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                [questionId]: value,
            },
        }));
    };

    return(
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
                <aside className="relative ml-[64px] h-full">
                    <LeftSidebar />

                    {/* 작성 도움말 */}
                    {currentStep === 1 ? (
                        <div className="absolute bottom-[16px] left-[15px] z-10 w-[208px] h-[303px] rounded-[16px] pl-[19px] pr-[43px] pt-[24px] pb-[36px] bg-[#FFF]">
                            <span className="block text-[#181C25] text-[16px] font-[700] mb-[20px]">작성 도움말</span>
                            <div className="flex flex-col gap-[21px]">
                                {tips.map((item, idx) => (
                                    <div key={idx} className='flex gap-[4px] items-start'>
                                        <div>{item.icon}</div>
                                        <div className='flex flex-col gap-[4px]'>
                                            <span className="text-[#373B46] text-[12px] font-[600]">{item.title}</span>
                                            <span className="text-[#747883] text-[12px] font-[500] whitespace-pre-line">{item.description}</span>
                                        </div>
                                    </div>
                                ))}
                                {/* {guide.map((item, idx) => (
                                    <div key={idx} className="flex gap-[4px] items-start">
                                        <div>{item.icon}</div>
                                        <div className="flex flex-col gap-[4px]">
                                            <span className="text-[#373B46] text-[12px] font-[600]">{item.title}</span>
                                            <span className="text-[#747883] text-[12px] font-[500] whitespace-pre-line">{item.desc}</span>
                                        </div>
                                    </div>
                                ))} */}
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                </aside>

                <main className="flex-1 flex flex-col ml-[32px]">
                    {/* 상단 타이틀 */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-[12px]">
                            <div className="flex items-center gap-[8px]">
                                <h1 className="text-[#181C25] text-[36px] font-[700]">서울미래예체능장학금</h1>
                                <Tag variant="primary">신청가능</Tag>
                            </div>
                            <div className="flex items-center text-[#555964] font-[600] text-[16px] gap-[8px] flex">
                                <span>신청기간</span><span>•</span><span>2026.05.01 - 2026.05.31</span>
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
                                        className="flex justify-center items-center w-[148px] h-[48px] p-[16px] rounded-[8px] border border-[#9DA1AC] text-[#555964] text-[18px] font-[600]">
                                            임시저장
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
                    <div className='flex items-center mt-[16px] mb-[22px]'>
                        <div className='flex items-center'>
                            <div className={`flex justify-center items-center w-[24px] h-[24px] rounded-full text-[14px] font-[500] ${currentStep === 1 ? 'bg-[#7962ED] text-white' : 'bg-[#FFF] border border-[#E6E7E8] text-[#9DA1AC]'}`}>1</div>
                            <span className={`ml-[8px] text-[16px] font-[500] text-[#555964]`}>사전 인터뷰</span>
                        </div>
                        <div className='w-[76px] h-[1px] bg-[#9DA1AC] mx-[12px]'></div>
                        <div className='flex items-center'>
                            <div className={`flex justify-center items-center w-[24px] h-[24px] rounded-full text-[14px] font-[500] ${currentStep === 2 ? 'bg-[#7962ED] text-white' : 'bg-[#FFF] border border-[#E6E7E8] text-[#9DA1AC]'}`}>2</div>
                            <span className={`ml-[8px] text-[16px] font-[500] text-[#555964]`}>초안 확인 및 수정</span>
                        </div>
                        <div className='w-[76px] h-[1px] bg-[#9DA1AC] mx-[12px]'></div>
                        <div className='flex items-center'>
                            <div className={`flex justify-center items-center w-[24px] h-[24px] rounded-full text-[14px] font-[500] ${currentStep === 3 ? 'bg-[#7962ED] text-white' : 'bg-[#FFF] border border-[#E6E7E8] text-[#9DA1AC]'}`}>3</div>
                            <span className={`ml-[8px] text-[16px] font-[500] text-[#555964]`}>저장 및 관리</span>
                        </div>
                    </div>

                    <div className='w-full'>
                        {!isLoaded ? (
                            <div className="flex items-center justify-center h-[500px] text-[#747883]">
                                질문 양식을 불러오는 중입니다.
                            </div>
                        ) : (
                            <>
                                {currentStep === 1 && (
                                    <Step1 
                                        questionCategories={questionCategories}
                                        subQuestions={questions[selectedCategory]?.subQuestions.map(sq =>({
                                            id: sq.id,
                                            title: sq.text,
                                            desc: sq.hint
                                        })) || []}
                                        completedCount={completedCount}
                                        selectedCategory={selectedCategory}
                                        setSelectedCategory={setSelectedCategory}
                                        answers={answers}
                                        handleAnswerChange={handleAnswerChange}
                                    />
                                )}
                                {currentStep === 2 && (
                                    <Step2
                                        applicationId={applicationId} 
                                        questionCategories={questionCategories}
                                        step2Category={step2Category}
                                        setStep2Category={setStep2Category}
                                        drafts={drafts}
                                        setDrafts={setDrafts}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <Step3 
                                        questionCategories={questionCategories}
                                        drafts={drafts}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}