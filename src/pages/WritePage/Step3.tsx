import { useState } from 'react';

interface Step3Props {
    questionCategories: string[];
    drafts: Record<number, string>;
}

export default function Step3({ questionCategories, drafts }: Step3Props) {
    const [openPreviewIdx, setOpenPreviewIdx] = useState<number>(0);

    return (
        <div className='flex-1 flex flex-col items-center min-h-0'>
            <div className="mt-[58px] mb-[44px]">
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="70" height="70" rx="35" fill="#7962ED"/>
                    <path d="M31.4624 49.9053C30.6421 49.9053 29.9414 49.5407 29.3604 48.8115L20.5078 37.7373C20.2913 37.4753 20.1318 37.2189 20.0293 36.9683C19.9382 36.7176 19.8926 36.4613 19.8926 36.1992C19.8926 35.6068 20.0863 35.1169 20.4736 34.7295C20.8724 34.3421 21.3737 34.1484 21.9775 34.1484C22.6725 34.1484 23.2593 34.4618 23.7378 35.0884L31.394 44.915L46.228 21.3481C46.4901 20.9494 46.7578 20.6702 47.0312 20.5107C47.3047 20.3398 47.6579 20.2544 48.0908 20.2544C48.6833 20.2544 49.1675 20.4424 49.5435 20.8184C49.9194 21.1829 50.1074 21.6615 50.1074 22.2539C50.1074 22.4932 50.0675 22.7381 49.9878 22.9888C49.908 23.228 49.7827 23.4844 49.6118 23.7578L33.5474 48.7944C33.0461 49.535 32.3511 49.9053 31.4624 49.9053Z" fill="white"/>
                </svg>
            </div>
            
            <h2 className="text-[28px] font-[700] text-[#000]">자기소개서 작성이 완료되었어요!</h2>
            <p className="text-[16px] font-[500] text-[#555964] mb-[51px]">좋은 결과가 있길 바라요! 작성한 내용을 복사해 장학금 신청 페이지에 제출해주세요.</p>

            <div className="w-[1042px] h-[448px] shrink-0 rounded-[16px] border border-[#D2D4DA] bg-white px-[33px] pb-[16px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="pt-[32px] pb-[16px]">
                    <h3 className="text-[16px] font-[600] text-[#10131A]">내가 작성한 내용 미리보기</h3>
                    <p className="text-[14px] font-[500] text-[#555964]">최종 저장되는 내용을 미리 확인하고, 복사하여 제출하세요.</p>
                </div>

                <div className="flex flex-col border border-[#E6E7EB] rounded-[8px] overflow-hidden divide-y divide-[#E6E7EB]">
                    {questionCategories.map((cat, idx) => (
                        <div key={idx} className="flex flex-col border-b border-[#E5E7EB]">
                            <button 
                                onClick={() => setOpenPreviewIdx(openPreviewIdx === idx ? -1 : idx)}
                                className={`flex justify-between items-center pl-[24px] pr-[12px] ${
                                    openPreviewIdx === idx ? 'pt-[16px] pb-[9px]' : 'h-[56px] py-[12px]'
                                }`}
                            >
                                <span className="text-[16px] font-[500] text-[#555964]">{cat}</span>
                                <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`mr-[8.41px] ${openPreviewIdx === idx ? 'rotate-180' : ''}`}>
                                    <path d="M1.7125 0.2925L5.5925 4.1725L9.4725 0.2925C9.8625 -0.0975 10.4925 -0.0975 10.8825 0.2925C11.2725 0.6825 11.2725 1.3125 10.8825 1.7025L6.2925 6.2925C5.9025 6.6825 5.2725 6.6825 4.8825 6.2925L0.2925 1.7025C-0.0975 1.3125 -0.0975 0.6825 0.2925 0.2925C0.6825 -0.0875 1.3225 -0.0975 1.7125 0.2925Z" fill="#9DA1AC"/>
                                </svg>
                            </button>
                            
                            {openPreviewIdx === idx && (
                                <div className="px-[24px] pb-[12px]">
                                    <div className="bg-[#F9FAFC] rounded-[14px] px-[23px] pt-[15px] flex flex-col gap-[24px]">
                                        <p className="text-[#747883] text-[15px] leading-[1.4] whitespace-pre-wrap">
                                            {drafts[idx] || "작성된 내용이 없습니다."}
                                        </p>
                                        <span className="text-right pb-[14px] text-[#9DA1AC] text-[14px] font-[500]">
                                            ({drafts[idx]?.length || 0}자)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}