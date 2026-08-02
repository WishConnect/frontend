import { useState, useEffect } from 'react';
import TextField3 from '../../components/TextField3';
import { postAiDraft } from '../../api/write/step2/Draft';

interface Step2Props {
    applicationId: number;
    questionCategories: string[];
    step2Category: number;
    setStep2Category: (idx: number) => void;
    drafts: Record<number, string>;
    setDrafts: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

export default function Step2({ applicationId, questionCategories, step2Category, setStep2Category, drafts, setDrafts }: Step2Props) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [aiDrafts, setAiDrafts] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAiDraft = async () => {
            if (aiDrafts[step2Category]) return;

            setIsLoading(true);
            try {
                const questionId = step2Category + 1;
                const response = await postAiDraft(applicationId, questionId);

                if (response.success && response.data) {
                    const generatedText = response.data.aiDraft;
                    
                    setAiDrafts(prev => ({
                        ...prev,
                        [step2Category]: generatedText
                    }));
                    
                    if (!drafts[step2Category]) {
                        setDrafts(prev => ({
                            ...prev,
                            [step2Category]: generatedText
                        }));
                    }
                }
            } catch (error) {
                console.error("AI 초안 생성 실패:", error);
                setAiDrafts(prev => ({
                    ...prev,
                    [step2Category]: "AI 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
                }));
            } finally {
                setIsLoading(false);
            }
        };

        fetchAiDraft();
    }, [step2Category, applicationId, aiDrafts, drafts, setDrafts]);
    

    return (
        <div className='flex-1 w-[1043px] rounded-[16px] border border-[#E5E7E8] bg-white p-[32px] flex flex-col'>
            <div className="mb-[24px]">
                <h3 className="text-[#10131A] text-[16px] font-[600] mb-[12px]">질문 선택</h3>
                
                <div className='relative w-[416px]'>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex justify-between items-center w-[416px] h-[48px] px-[24px] rounded-[8px] bg-[#F9FAFC] border border-[#E5E7EB] text-[#555964] text-[16px] font-[500]"
                    >
                        {questionCategories[step2Category]}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"  xmlns="http://www.w3.org/2000/svg" className={`transition-stransform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            <path d="M8.1207 9.29055L12.0007 13.1705L15.8807 9.29055C16.2707 8.90055 16.9007 8.90055 17.2907 9.29055C17.6807 9.68055 17.6807 10.3105 17.2907 10.7005L12.7007 15.2905C12.3107 15.6805 11.6807 15.6805 11.2907 15.2905L6.7007 10.7005C6.3107 10.3105 6.3107 9.68055 6.7007 9.29055C7.0907 8.91055 7.7307 8.90055 8.1207 9.29055Z" fill="#9DA1AC"/>
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-[56px] left-0 w-[416px] flex flex-col bg-white border border-[#E6E7EB] rounded-[8px] overflow-hidden divide-y divide-[#E6E7EB]">
                            {questionCategories.map((cat, idx) => {
                                if (idx === step2Category) return null;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setStep2Category(idx);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-[24px] py-[12px] text-[15px] text-[#555964] font-[500] bg-white hover:bg-[#F9F8FF] transition-colors"
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex w-[985px] items-center gap-[8px] pl-[24px] py-[14px] bg-[#F9F8FF] border border-[#BDB9F9] rounded-[8px] mb-[32px]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.96875 15.9375C6.86979 15.9375 5.83854 15.7292 4.875 15.3125C3.91146 14.901 3.0651 14.3307 2.33594 13.6016C1.60677 12.8724 1.03385 12.026 0.617188 11.0625C0.205729 10.099 0 9.06771 0 7.96875C0 6.86979 0.205729 5.83854 0.617188 4.875C1.03385 3.91146 1.60677 3.0651 2.33594 2.33594C3.0651 1.60156 3.91146 1.02865 4.875 0.617188C5.83854 0.205729 6.86979 0 7.96875 0C9.06771 0 10.099 0.205729 11.0625 0.617188C12.026 1.02865 12.8724 1.60156 13.6016 2.33594C14.3307 3.0651 14.901 3.91146 15.3125 4.875C15.7292 5.83854 15.9375 6.86979 15.9375 7.96875C15.9375 9.06771 15.7292 10.099 15.3125 11.0625C14.901 12.026 14.3307 12.8724 13.6016 13.6016C12.8724 14.3307 12.026 14.901 11.0625 15.3125C10.099 15.7292 9.06771 15.9375 7.96875 15.9375ZM7.96875 14.6094C8.88542 14.6094 9.74479 14.4375 10.5469 14.0938C11.349 13.75 12.0547 13.2734 12.6641 12.6641C13.2734 12.0547 13.75 11.349 14.0938 10.5469C14.4375 9.74479 14.6094 8.88542 14.6094 7.96875C14.6094 7.05208 14.4375 6.19271 14.0938 5.39062C13.75 4.58333 13.2734 3.8776 12.6641 3.27344C12.0547 2.66406 11.349 2.1875 10.5469 1.84375C9.74479 1.5 8.88542 1.32812 7.96875 1.32812C7.05208 1.32812 6.19271 1.5 5.39062 1.84375C4.58854 2.1875 3.88281 2.66406 3.27344 3.27344C2.66406 3.8776 2.1875 4.58333 1.84375 5.39062C1.5 6.19271 1.32812 7.05208 1.32812 7.96875C1.32812 8.88542 1.5 9.74479 1.84375 10.5469C2.1875 11.349 2.66406 12.0547 3.27344 12.6641C3.88281 13.2734 4.58854 13.75 5.39062 14.0938C6.19271 14.4375 7.05208 14.6094 7.96875 14.6094ZM6.60156 12.3359C6.4401 12.3359 6.30469 12.2839 6.19531 12.1797C6.08594 12.0755 6.03125 11.9453 6.03125 11.7891C6.03125 11.6328 6.08594 11.5026 6.19531 11.3984C6.30469 11.2943 6.4401 11.2422 6.60156 11.2422H7.57031V7.65625H6.73438C6.57292 7.65625 6.4375 7.60417 6.32812 7.5C6.21875 7.39583 6.16406 7.26562 6.16406 7.10938C6.16406 6.95312 6.21875 6.82292 6.32812 6.71875C6.4375 6.61458 6.57292 6.5625 6.73438 6.5625H8.20312C8.40104 6.5625 8.55208 6.6276 8.65625 6.75781C8.76042 6.88281 8.8125 7.05208 8.8125 7.26562V11.2422H9.78125C9.94271 11.2422 10.0781 11.2943 10.1875 11.3984C10.2969 11.5026 10.3516 11.6328 10.3516 11.7891C10.3516 11.9453 10.2969 12.0755 10.1875 12.1797C10.0781 12.2839 9.94271 12.3359 9.78125 12.3359H6.60156ZM7.89844 5.25781C7.61719 5.25781 7.3776 5.15885 7.17969 4.96094C6.98177 4.76302 6.88281 4.52344 6.88281 4.24219C6.88281 3.95573 6.98177 3.71354 7.17969 3.51562C7.3776 3.31771 7.61719 3.21875 7.89844 3.21875C8.1849 3.21875 8.42448 3.31771 8.61719 3.51562C8.8151 3.71354 8.91406 3.95573 8.91406 4.24219C8.91406 4.52344 8.8151 4.76302 8.61719 4.96094C8.42448 5.15885 8.1849 5.25781 7.89844 5.25781Z" fill="#320095"/>
                </svg>
                <span className="text-[#320095] text-[14px] font-[500]">
                    AI가 생성한 초안을 확인하고, 자유롭게 수정해보세요.
                </span>
            </div>

            <div className="flex gap-[30px] flex-1 min-w-0">
                <div className="w-[419px] flex flex-col">
                    <h3 className="text-[#10131A] text-[16px] font-[600] ml-[5px] mb-[7px]">AI가 작성한 초안</h3>
                    <div className="flex-1 rounded-[16px] border border-[#D2D4DA] bg-white pt-[28px] px-[24px] overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-[#D2D4DA] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                        <p className="text-[#747883] text-[14px] leading-[1.4] whitespace-pre-wrap">
                            {isLoading ? "AI가 초안을 작성하고 있습니다." : (aiDrafts[step2Category])}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h3 className="text-[#10131A] text-[16px] font-[600] ml-[5px] mb-[7px]">내가 수정한 내용</h3>
                    <TextField3
                        value={drafts[step2Category]}
                        onChange={(val) => setDrafts(prev => ({ ...prev, [step2Category]: val }))}
                    />
                </div>
            </div>
        </div>
    );
}