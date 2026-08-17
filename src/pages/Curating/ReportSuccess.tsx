interface ReportSuccessModalProps {
    onClose: () => void;
}

export default function ReportSuccessModal({ onClose }: ReportSuccessModalProps) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50">
            <div className="w-[672px] rounded-[16px] bg-white p-[36px]">
                <div className="flex flex-col items-center">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" rx="50" fill="#F4F4FE"/>
                        <path d="M45.957 67.3203C45.0195 67.3203 44.2188 66.9036 43.5547 66.0703L33.4375 53.4141C33.1901 53.1146 33.0078 52.8216 32.8906 52.5352C32.7865 52.2487 32.7344 51.9557 32.7344 51.6562C32.7344 50.9792 32.9557 50.4193 33.3984 49.9766C33.8542 49.5339 34.4271 49.3125 35.1172 49.3125C35.9115 49.3125 36.582 49.6706 37.1289 50.3867L45.8789 61.6172L62.832 34.6836C63.1315 34.2279 63.4375 33.9089 63.75 33.7266C64.0625 33.5312 64.4661 33.4336 64.9609 33.4336C65.638 33.4336 66.1914 33.6484 66.6211 34.0781C67.0508 34.4948 67.2656 35.0417 67.2656 35.7188C67.2656 35.9922 67.2201 36.2721 67.1289 36.5586C67.0378 36.832 66.8945 37.125 66.6992 37.4375L48.3398 66.0508C47.7669 66.8971 46.9727 67.3203 45.957 67.3203Z" fill="#7962ED"/>
                    </svg>

                    <h2 className="mt-[24px] text-[32px] font-[700] text-[#10131A]">
                        신고가 접수됐어요
                    </h2>

                    <p className="mt-[12px] text-center text-[16px] font-[500] text-[#747883]">
                        소중한 제보 감사합니다. 확인 후 장학금 정보를 수정하겠습니다.
                    </p>
                </div>

                <div className="mt-[48px] flex items-start gap-[24px] rounded-[8px] bg-[#F9FAFC] p-[24px]">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 24.0009L22 28.0009L30 20.0009M40 26.0009C40 36.0009 33 41.0009 24.68 43.9009C24.2443 44.0485 23.7711 44.0415 23.34 43.8809C15 41.0009 8 36.0009 8 26.0009V12.0009C8 11.4705 8.21071 10.9618 8.58579 10.5867C8.96086 10.2116 9.46957 10.0009 10 10.0009C14 10.0009 19 7.6009 22.48 4.5609C22.9037 4.1989 23.4427 4 24 4C24.5573 4 25.0963 4.1989 25.52 4.5609C29.02 7.6209 34 10.0009 38 10.0009C38.5304 10.0009 39.0391 10.2116 39.4142 10.5867C39.7893 10.9618 40 11.4705 40 12.0009V26.0009Z" stroke="#7962ED" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div>
                        <p className="text-[20px] font-[600] text-[#10131A]">신고 처리 과정</p>
                        <p className="mt-[4px] text-[16px] font-[500] text-[#747883]">
                            제보해주신 내용은 담당자가 확인 후 필요 시 정보 수정 및 반영을 진행합니다.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-[24px] w-full rounded-[8px] bg-[#7962ED] p-[16px] text-[18px] font-[600] text-white"
                >
                    확인
                </button>
            </div>
        </div>
    );
}