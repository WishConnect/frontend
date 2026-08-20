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
                <svg width="168" height="119" viewBox="0 0 168 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="51.0039" y="27.0039" width="70" height="70" rx="35" fill="#7962ED"/>
                    <path d="M82.4663 76.9092C81.646 76.9092 80.9453 76.5446 80.3643 75.8154L71.5117 64.7412C71.2952 64.4792 71.1357 64.2228 71.0332 63.9722C70.9421 63.7215 70.8965 63.4652 70.8965 63.2031C70.8965 62.6107 71.0902 62.1208 71.4775 61.7334C71.8763 61.346 72.3776 61.1523 72.9814 61.1523C73.6764 61.1523 74.2632 61.4657 74.7417 62.0923L82.3979 71.9189L97.2319 48.3521C97.494 47.9533 97.7617 47.6742 98.0352 47.5146C98.3086 47.3438 98.6618 47.2583 99.0947 47.2583C99.6872 47.2583 100.171 47.4463 100.547 47.8223C100.923 48.1868 101.111 48.6654 101.111 49.2578C101.111 49.4971 101.071 49.742 100.992 49.9927C100.912 50.2319 100.787 50.4883 100.616 50.7617L84.5513 75.7983C84.05 76.5389 83.355 76.9092 82.4663 76.9092Z" fill="white"/>
                    <path d="M119.612 3.03258L129.778 19.3994L121.253 21.4281L112 4.84389L119.612 3.03258Z" fill="#BDB9F9"/>
                    <path d="M146.141 24.1007L136.007 37.5748L144.812 41.6716L154.002 27.7585L146.141 24.1007Z" fill="#7962ED"/>
                    <path d="M12.4742 44.0218L0.00209744 58.0721L7.8865 65.0939L19.5139 50.2913L12.4742 44.0218Z" fill="#7962ED"/>
                    <path d="M48.6386 109.249L35.9147 95.5498L31.2056 106.069L44.434 118.641L48.6386 109.249Z" fill="#7962ED"/>
                    <path opacity="0.6" d="M155.686 85.8288L145.005 106.6L155.015 107.428L164.623 86.5687L155.686 85.8288Z" fill="#BDB9F9"/>
                    <path d="M36.6965 14.5153L51.3784 20.5884L49.4773 9.71306L34.9991 4.80513L36.6965 14.5153Z" fill="#BDB9F9"/>
                    <path d="M131.927 103.73L138.065 118.992L142.992 114.816L136.326 100.001L131.927 103.73Z" fill="#BDB9F9"/>
                    <path d="M18.26 91.4666L22.4166 72.999L13.743 75.8992L10.5157 94.056L18.26 91.4666Z" fill="#BDB9F9"/>
                    <path d="M134.006 75.7819C137.084 72.8953 143.83 68.4472 148.964 70.6582C149.83 71.0313 151.09 70.4344 151.137 69.4923C151.461 63.0518 154.101 54.5603 163.084 58.0837" stroke="#7962ED" stroke-width="5" stroke-linecap="round"/>
                    <path d="M36.7442 42.8049C33.6838 41.1242 28.4731 36.766 28.6868 31.3223C28.725 30.3505 27.5933 29.3933 26.6883 29.7495C21.5435 31.7747 14.6047 32.2789 14.9834 23.0023" stroke="#7962ED" stroke-width="5" stroke-linecap="round"/>
                    <circle cx="138.508" cy="60.5039" r="1.5" fill="#7962ED"/>
                    <circle cx="166.508" cy="68.5" r="1.5" fill="#7962ED"/>
                    <circle cx="38.5" cy="86.5" r="1.5" fill="#7962ED"/>
                    <circle cx="22.6523" cy="17.5039" r="1.5" fill="#7962ED"/>
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