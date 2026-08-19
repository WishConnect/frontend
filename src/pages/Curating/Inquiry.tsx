import { useState } from 'react';

// 시안(3269:6788)의 라디오 항목. 값은 화면 문구를 그대로 쓰고, API 연동 시 서버 코드로 바꾼다.
const INQUIRY_TYPES = [
  '포스터/이미지 사용 중단 요청',
  '장학금 정보 게시 중단 요청',
  '저작권 침해 신고',
  '정보 수정 요청',
  '기타 문의',
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number];

const DETAIL_MAX_LENGTH = 500;

interface InquiryModalProps {
  scholarshipId: number | string;
  onClose: () => void;
  onSuccess: () => void;
}

// 항목 라벨. "(선택)"이 붙는 건 시안 그대로다.
function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-[6px]">
      <span className="text-[16px] font-semibold leading-[24px] text-[#10131A]">{children}</span>
      {optional && (
        <span className="text-[16px] font-normal leading-[24px] text-[#747883]">(선택)</span>
      )}
    </div>
  );
}

// 문의자 정보 3칸은 라벨이 작고 입력칸이 흰 배경 + 테두리다(문의 대상·문의 내용과 다름).
function OutlinedField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <span className="text-[14px] font-medium leading-[20px] text-[#555964]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="내용을 입력해주세요"
        className="h-[50px] w-full rounded-[8px] border border-[#E6E7EB] bg-white px-[12px] text-[16px] font-medium leading-[24px] text-[#10131A] placeholder:text-[#9DA1AC] focus:outline-none"
      />
    </div>
  );
}

/**
 * 콘텐츠 이용 문의 모달.
 *
 * 시안 높이가 1340px 라 화면(보통 1024px)에 다 안 들어간다. 그래서 바깥 높이를 뷰포트에 맞춰
 * 제한하고 본문만 스크롤시킨다 — 제목과 하단 버튼은 늘 보이는 편이 낫다.
 * 폭(672px)은 신고 팝업과 동일하게 맞췄다.
 *
 * TODO: 접수 API 연동. 지금은 화면만 만들어 두고 제출 시 성공 처리만 한다.
 */
export default function InquiryModal({ scholarshipId, onClose, onSuccess }: InquiryModalProps) {
  const [type, setType] = useState<InquiryType | null>(null);
  const [target, setTarget] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');
  const [fileName, setFileName] = useState('');

  const isSubmitDisabled = target.trim() === '' || detail.trim() === '';

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    // TODO: API 연동 시 이 자리에서 접수 요청을 보낸다.
    console.log('콘텐츠 이용 문의 (API 연동 전):', {
      scholarshipId,
      type,
      target,
      organization,
      email,
      phone,
      detail,
      fileName,
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-[24px]">
      <div className="flex max-h-full w-[672px] flex-col rounded-[16px] bg-white">
        {/* 닫기 버튼과 제목은 스크롤과 무관하게 위에 고정한다 */}
        <div className="relative shrink-0 px-[36px] pt-[36px]">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-[36px] top-[36px] flex h-[30px] w-[30px] items-center justify-center text-[#10131A]"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M1 1L14 14M14 1L1 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h2 className="text-[32px] font-bold leading-[44px] text-[#10131A]">콘텐츠 이용 문의</h2>
          <p className="mt-[12px] text-[16px] font-medium leading-[24px] text-[#747883]">
            위시커넥트에 게시된 장학금 콘텐츠의 이용과 관련하여 문의사항이나 권리침해 문제가 있는
            경우 알려주세요. 확인 후 필요한 조치를 진행하겠습니다.
          </p>
        </div>

        {/* 본문만 스크롤된다 */}
        <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-y-auto px-[36px] py-[24px]">
          {/* 문의 유형 */}
          <div className="flex flex-col gap-[12px]">
            <FieldLabel optional>문의 유형</FieldLabel>
            <div className="flex flex-col gap-[12px]">
              {INQUIRY_TYPES.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-[12px] text-[16px] font-medium leading-[24px] text-[#10131A]"
                >
                  <input
                    type="radio"
                    name="inquiry-type"
                    checked={type === item}
                    onChange={() => setType(item)}
                    className="h-[24px] w-[24px] shrink-0 appearance-none rounded-full border border-[#E6E7EB] checked:border-[7px] checked:border-[#7962ED]"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* 문의 대상 */}
          <div className="flex flex-col gap-[12px]">
            <FieldLabel>문의 대상</FieldLabel>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="내용을 입력해주세요"
              className="h-[50px] w-full rounded-[8px] bg-[#F9FAFC] px-[12px] text-[16px] font-medium leading-[24px] text-[#10131A] placeholder:text-[#9DA1AC] focus:outline-none"
            />
          </div>

          {/* 문의자 정보 */}
          <div className="flex flex-col gap-[12px]">
            <FieldLabel>문의자 정보</FieldLabel>
            <div className="flex flex-col gap-[12px]">
              <OutlinedField label="기관/성명" value={organization} onChange={setOrganization} />
              <OutlinedField label="이메일" value={email} onChange={setEmail} type="email" />
              <OutlinedField label="연락처" value={phone} onChange={setPhone} type="tel" />
            </div>
          </div>

          {/* 문의 내용 */}
          <div className="flex flex-col gap-[12px]">
            <FieldLabel>문의 내용</FieldLabel>
            <div className="relative rounded-[8px] bg-[#F9FAFC]">
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value.slice(0, DETAIL_MAX_LENGTH))}
                placeholder="문의 내용을 자세히 입력해주세요."
                className="h-[160px] w-full resize-none rounded-[8px] bg-transparent px-[12px] pb-[32px] pt-[12px] text-[16px] font-medium leading-[24px] text-[#10131A] placeholder:text-[#9DA1AC] focus:outline-none"
              />
              <span className="absolute bottom-[12px] right-[12px] text-[12px] font-medium leading-[16px] text-[#9DA1AC]">
                {detail.length} / {DETAIL_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* 첨부파일 */}
          <div className="flex flex-col gap-[12px]">
            <FieldLabel optional>첨부파일</FieldLabel>
            <div className="flex h-[50px] w-full items-center justify-between rounded-[8px] border border-[#E6E7EB] bg-white pl-[12px] pr-[8px]">
              <span
                className={`truncate text-[16px] font-medium leading-[24px] ${
                  fileName ? 'text-[#10131A]' : 'text-[#9DA1AC]'
                }`}
              >
                {fileName || '파일을 첨부해주세요.'}
              </span>
              {/* label + 숨긴 input 이라 버튼처럼 보이면서 실제 파일 선택창이 열린다 */}
              <label className="flex h-[36px] shrink-0 cursor-pointer items-center rounded-[6px] border border-[#D2D4DA] bg-white px-[15px] text-[12px] font-bold leading-[18px] text-[#747883]">
                파일 선택
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                />
              </label>
            </div>
            <p className="text-[14px] font-medium leading-[20px] text-[#9DA1AC]">
              *권리 보유 또는 이용 권한을 확인할 수 있는 자료가 있다면 첨부해 주세요.
            </p>
          </div>
        </div>

        {/* 버튼도 스크롤과 무관하게 아래에 고정 */}
        <div className="flex shrink-0 gap-[12px] px-[36px] pb-[36px] pt-[12px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] flex-1 rounded-[8px] bg-[#F3F4F6] text-[18px] font-semibold text-[#9DA1AC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="h-[48px] flex-1 rounded-[8px] bg-[#FA5862] text-[18px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            문의 접수하기
          </button>
        </div>
      </div>
    </div>
  );
}
