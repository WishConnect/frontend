import TextField2 from "../../components/TextField2";

interface Step1Props {
    questionCategories: string[];
    subQuestions: any[];
    completedCount: number;
    selectedCategory: number;
    setSelectedCategory: (idx: number) => void;
    answers: Record<number, Record<number, string>>;
    handleAnswerChange: (categoryId: number, questionId: number, value: string) => void;
}

export default function Step1({
    questionCategories,
    subQuestions,
    completedCount,
    selectedCategory,
    setSelectedCategory,
    answers,
    handleAnswerChange
}: Step1Props) {
    return (
        <div className="flex gap-[24px]">
            {/* 질문 목록 */}
            <div className='w-[237px] h-[736px] gap-[16px] px-[16px] rounded-[16px] border border-[#D2D4DA]'>
                <div className="flex justify-between items-center mt-[24px] mb-[16px]">
                    <h2 className='text-[#10131A] text-[16px] font-[600]'>질문목록</h2>
                    <span className='text-[#9DA1AC] text-[12px] font-[500]'>
                        {completedCount}/{questionCategories.length} 작성 완료
                    </span>
                </div>
                <div className='flex flex-col gap-[16px]'>
                    {questionCategories.map((category, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedCategory(idx)}
                            className={`w-[204px] h-[48px] pl-[13px] flex items-center rounded-[8px] border text-[14px] font-[500] transition-colors ${
                                selectedCategory === idx
                                    ? 'border-[#BDB9F9] bg-[##7962ED0D] text-[#320095]'
                                    : 'border-[#E6E7E8] bg-[#F9FAFC] text-[#9DA1AC] hover:bg-gray-50'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                    <button className='w-[204px] h-[32px] flex justify-center items-center rounded-[8px] gap-[4px] border border-[#E6E7E8] text-[12px] font-[500] text-[#747883]'>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 4.9043C0 4.72461 0.0644531 4.57031 0.193359 4.44141C0.322266 4.30859 0.476562 4.24219 0.65625 4.24219H4.24805V0.65625C4.24805 0.476562 4.3125 0.322266 4.44141 0.193359C4.57031 0.0644531 4.72461 0 4.9043 0C5.08789 0 5.24414 0.0644531 5.37305 0.193359C5.50195 0.322266 5.56641 0.476562 5.56641 0.65625V4.24219H9.15234C9.33203 4.24219 9.48633 4.30859 9.61523 4.44141C9.74414 4.57031 9.80859 4.72461 9.80859 4.9043C9.80859 5.08789 9.74414 5.24414 9.61523 5.37305C9.48633 5.49805 9.33203 5.56055 9.15234 5.56055H5.56641V9.1582C5.56641 9.33398 5.50195 9.48633 5.37305 9.61523C5.24414 9.74414 5.08789 9.80859 4.9043 9.80859C4.72461 9.80859 4.57031 9.74414 4.44141 9.61523C4.3125 9.48633 4.24805 9.33398 4.24805 9.1582V5.56055H0.65625C0.476562 5.56055 0.322266 5.49805 0.193359 5.37305C0.0644531 5.24414 0 5.08789 0 4.9043Z" fill="#747883"/>
                        </svg>
                        문항 추가 (선택)
                    </button>
                </div>
            </div>

            {/* 질문 & 작성칸 */}
            <div className='flex-1 h-[736px] flex flex-col rounded-[16px] border border-[#E5E7E8] bg-[#FFF]'>
                <div className="px-[32px] mt-[28px] mb-[24px]">
                    <h2 className="text-[#181C25] text-[24px] font-[700]">
                        {questionCategories[selectedCategory]}
                    </h2>
                </div>
                <div className='
                    flex-1 flex flex-col gap-[24px] overflow-y-auto 
                    pl-[32px] pr-[14px] mr-[15px] mb-[47px]
                    [&::-webkit-scrollbar]:w-[4px]
                    [&::-webkit-scrollbar-track]:bg-[#E6E7EB]
                    [&::-webkit-scrollbar-track]:rounded-[16px]
                    [&::-webkit-scrollbar-thumb]:bg-[#7962ED]
                    [&::-webkit-scrollbar-thumb]:rounded-[16px]
                '>
                    {subQuestions.map((sq) => (
                        <div key={sq.id} className='flex flex-col gap-[12px]'>
                            <div className="flex gap-[8px] items-start">
                                <div className='flex justify-center items-center w-[20px] h-[20px] rounded-full bg-[#7962ED] text-white text-[12px] font-[500] mt-[2px]'>
                                    {sq.id}
                                </div>
                                <div className="flex flex-col gap-[4px]">
                                    <span className="text-[#000] text-[18px] font-[600]">{sq.title}</span>
                                    <span className="text-[#747883] text-[14px] font-[500]">{sq.desc}</span>
                                </div>
                            </div>
                            <TextField2 
                                height="141px" 
                                value={answers[selectedCategory][sq.id]}
                                onChange={(val) => handleAnswerChange(selectedCategory, sq.id, val)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}