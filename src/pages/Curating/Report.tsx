import { useState } from 'react';
import { postScholarshipReport } from '../../api/Curation/Reports';
import type { ReportReason } from '../../api/Curation/Reports';

// 백엔드 ReportReason enum 과 1:1 로 맞춘 값이다. 예전엔 WRONG_DEADLINE·WRONG_AMOUNT 를
// 보내고 있었는데 둘 다 @Deprecated 된 옛 값이고, "지원 조건이 달라요."에 ALREADY_CLOSED
// (= 이미 마감됨)가 붙어 있어 고르면 전혀 다른 신고로 저장되고 있었다.
const REPORT_REASONS: { label: string; value: ReportReason }[] = [
    { label: '모집 기간이 지났어요.', value: 'ALREADY_CLOSED' },
    { label: '장학금 정보가 잘못되었어요.', value: 'WRONG_INFO' },
    { label: '지원 조건이 달라요.', value: 'WRONG_CONDITION' },
    { label: '중복된 장학금이에요.', value: 'DUPLICATE' },
];

const ETC_REASON_VALUE: ReportReason = 'OTHER';

// 실패 사유를 사용자 말로 바꾼다. 예전엔 console.error 만 찍어서, 400이 나고 있는데도
// 화면엔 아무 반응이 없어 "눌러도 안 된다"로만 보였다.
function getReportErrorMessage(error: unknown): string {
    const res = (error as { response?: { status?: number; data?: { message?: string } } })?.response;

    // 같은 장학금에 아직 처리되지 않은 내 신고가 있으면 서버가 막는다.
    if (res?.status === 409) {
        return '이미 접수된 신고가 있어요. 처리 후에 다시 신고할 수 있어요.';
    }
    if (res?.status === 401 || res?.status === 403) {
        return '로그인이 필요해요. 다시 로그인한 뒤 시도해 주세요.';
    }
    return res?.data?.message ?? '신고 접수에 실패했어요. 잠시 후 다시 시도해 주세요.';
}

interface ReportModalProps {
    scholarshipId: number | string;
    onClose: () => void;
    // 접수는 이 컴포넌트가 직접 한다. 예전엔 onSubmit prop 도 있었지만 어디서도 호출되지 않아
    // 없앴다 — 부모가 넘긴 핸들러가 실행되는 줄 알기 쉬운데 실제로는 죽은 코드였다.
    onSuccess: () => void;
}

export default function ReportModal({ scholarshipId, onClose, onSuccess }: ReportModalProps) {
    const [selectedReasons, setSelectedReasons] = useState<ReportReason[]>([]);
    const [isEtcChecked, setIsEtcChecked] = useState(false);
    const [etcText, setEtcText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const toggleReason = (reason: ReportReason) => {
        setSubmitError(null);
        setSelectedReasons((prev) =>
            prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
        );
    };

    // 사유를 하나도 안 고르면 못 낸다(서버도 reasons 에 @NotEmpty). 다만 "기타"만 체크하고
    // 내용을 안 적는 건 허용한다 — 서버에서 detail 은 선택 입력이고, 입력칸 안내도 "(선택사항)"이다.
    const isSubmitDisabled =
        isSubmitting || (selectedReasons.length === 0 && !isEtcChecked);

    const handleSubmit = async () => {
        if (isSubmitDisabled) return;

        setIsSubmitting(true);
        setSubmitError(null);

        // 사유는 한 번에 배열로 보낸다. 예전엔 사유마다 따로 요청했는데, 서버가 같은 장학금에
        // 미처리 신고가 있으면 409(REPORT_ALREADY_EXISTS)로 막기 때문에 두 번째부터 실패했다.
        const reasons: ReportReason[] = [...selectedReasons];
        if (isEtcChecked) {
            reasons.push(ETC_REASON_VALUE);
        }

        try {
            await postScholarshipReport(scholarshipId, {
                reasons,
                detail: isEtcChecked ? etcText.trim() : '',
            });
            onSuccess();
        } catch (error) {
            console.error('신고 접수 실패:', error);
            setSubmitError(getReportErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="w-[672px] rounded-[16px] bg-white p-[36px]">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col items-center w-full">
                        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#fa58621a]">
                            <svg width="52" height="47" viewBox="0 0 52 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.66504 46.3857C5.28158 46.3857 4.09342 46.0928 3.10059 45.5068C2.10775 44.9209 1.34277 44.1234 0.805664 43.1143C0.268555 42.1214 0 41.0065 0 39.7695C0 38.5814 0.317383 37.4421 0.952148 36.3516L19.8975 3.34375C20.516 2.23698 21.3379 1.4069 22.3633 0.853516C23.3887 0.283854 24.4629 -0.000976562 25.5859 -0.000976562C26.709 -0.000976562 27.7751 0.283854 28.7842 0.853516C29.8096 1.4069 30.6396 2.23698 31.2744 3.34375L50.2197 36.3516C50.529 36.8887 50.765 37.4502 50.9277 38.0361C51.0905 38.6221 51.1719 39.1999 51.1719 39.7695C51.1719 41.0065 50.9033 42.1214 50.3662 43.1143C49.8291 44.1234 49.0641 44.9209 48.0713 45.5068C47.0785 46.0928 45.8903 46.3857 44.5068 46.3857H6.66504ZM25.6104 30.0527C26.8799 30.0527 27.5228 29.3854 27.5391 28.0508L27.9053 14.7695C27.9215 14.1348 27.7018 13.6058 27.2461 13.1826C26.8066 12.7432 26.2533 12.5234 25.5859 12.5234C24.9023 12.5234 24.3408 12.735 23.9014 13.1582C23.4782 13.5814 23.2747 14.1104 23.291 14.7451L23.6084 28.0508C23.641 29.3854 24.3083 30.0527 25.6104 30.0527ZM25.6104 38.2314C26.3428 38.2314 26.9775 37.9792 27.5146 37.4746C28.068 36.9701 28.3447 36.3516 28.3447 35.6191C28.3447 34.8867 28.068 34.2682 27.5146 33.7637C26.9775 33.2428 26.3428 32.9824 25.6104 32.9824C24.8617 32.9824 24.2188 33.2428 23.6816 33.7637C23.1445 34.2845 22.876 34.903 22.876 35.6191C22.876 36.3516 23.1445 36.9701 23.6816 37.4746C24.235 37.9792 24.8779 38.2314 25.6104 38.2314Z" fill="#FA5862"/>
                            </svg>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#9DA1AC] text-[18px]"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                <h2 className="mt-[24px] text-center text-[32px] font-[700] text-[#10131A]">
                    장학금 정보 오류를 알려주세요
                </h2>
                <p className="mt-[12px] text-center text-[16px] font-[500] text-[#747883]">
                    잘못된 정보나 수정이 필요한 내용을 알려주시면 확인 후 빠르게 반영하겠습니다.
                </p>

                {/* 신고 사유 */}
                <p className="mt-[48px] text-[16px] font-[600] text-[#10131A]">
                    신고 사유를 모두 선택해 주세요.
                </p>

                <div className="mt-[12px] flex flex-col gap-[8px]">
                    {REPORT_REASONS.map((reason) => (
                        <label
                            key={reason.value}
                            className="flex items-center gap-[12px] rounded-[8px] border border-[#E6E7EB] pl-[12px] pr-[24px] py-[12px] text-[16px] text-[#10131A] cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedReasons.includes(reason.value)}
                                onChange={() => toggleReason(reason.value)}
                                className="h-[20px] w-[20px] rounded-[4px] border border-[#E6E7EB]"
                            />
                            {reason.label}
                        </label>

                        
                    ))}

                    {/* 기타 */}
                    <div
                        className={`rounded-[8px] border border-[#E6E7EB] pl-[12px] pr-[24px] transition-all ${
                            isEtcChecked ? 'py-[12px]' : 'py-[12px]'
                        }`}
                    >
                        <label className="flex items-center gap-[12px] text-[16px] text-[#10131A] cursor-pointer h-[26px]">
                            <input
                                type="checkbox"
                                checked={isEtcChecked}
                                onChange={(e) => setIsEtcChecked(e.target.checked)}
                                className="h-[20px] w-[20px] rounded-[4px] border border-[#E6E7EB] shrink-0"
                            />
                            기타
                        </label>

                        {isEtcChecked && (
                            <div className="rounded-[8px] mt-[12px] bg-[#F9FAFC]">
                                <textarea
                                    value={etcText}
                                    onChange={(e) => setEtcText(e.target.value.slice(0, 200))}
                                    placeholder="내용을 입력해주세요 (선택사항)"
                                    className="resize-none rounded-[8px] h-[100px] w-full text-[16px] text-[#9DA1AC] p-[12px]"
                                />
                                <div className="text-right text-[12px] pb-[12px] pr-[12px] text-[#9DA1AC]">
                                    {etcText.length} / 200
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {submitError && (
                    <p className="mt-[16px] text-center text-[14px] font-medium text-[#FA5862]">
                        {submitError}
                    </p>
                )}

                {/* 버튼 */}
                <div className="mt-[24px] flex gap-[16px]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-[8px] bg-[#F3F4F6] p-[16px] text-[18px] font-semibold text-[#9DA1AC]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className="flex-1 rounded-[8px] bg-[#FA5862] p-[16px] text-[18px] font-semibold text-white"
                    >
                        {isSubmitting ? '접수 중...' : '신고하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}