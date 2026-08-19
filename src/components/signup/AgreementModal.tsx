import { useEffect } from 'react';

export type AgreementDocumentType = 'terms' | 'privacy';

interface AgreementModalProps {
  type: AgreementDocumentType;
  onClose: () => void;
}

const TERMS_SECTIONS = [
  {
    title: '제1조 (목적)',
    body: '이 약관은 위시커넥트(이하 "서비스 운영자")가 제공하는 AI 기반 장학금 매칭 및 자기소개서 작성 지원 서비스(이하 "서비스")의 이용조건 및 절차, 서비스 운영자와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 (정의)',
    body: '① "서비스"란 서비스 운영자가 제공하는 장학금 정보 및 맞춤형 장학금 추천, 경험 관리, 자기소개서 작성 지원 등 일체의 서비스를 의미합니다.\n② "이용자"란 서비스에 접속하여 본 약관에 따라 서비스를 이용하는 자를 말합니다.\n③ "회원"이란 본 약관에 동의하고 서비스 이용계약을 체결한 이용자를 말합니다.',
  },
  {
    title: '제3조 (회원가입)',
    body: '① 이용자는 서비스 운영자가 정한 절차에 따라 회원가입을 신청하며, 서비스 이용에 필요한 정보를 정확하게 제공해야 합니다.\n② 이용자가 허위 정보를 등록하거나 타인의 정보를 도용하여 발생하는 문제에 대해서는 이용자에게 책임이 있습니다.',
  },
  {
    title: '제4조 (서비스 제공)',
    body: '① 서비스 운영자는 회원이 입력한 정보를 바탕으로 맞춤형 장학금 정보를 제공합니다.\n② 서비스 운영자는 학교, 기관, 기업, 재단 등의 다양한 출처에서 장학금 정보를 수집·정리하여 제공합니다.\n③ 서비스에서 제공하는 장학금 정보는 참고용이며, 모집 기간, 지원 조건, 지원 금액, 선발 기준 등의 정보가 변경되거나 오류가 발생할 수 있습니다. 최종 지원 전 반드시 해당 장학금 운영기관의 공식 안내를 확인하시기 바랍니다.\n④ 서비스 운영자는 AI를 활용하여 자기소개서 작성 및 기타 콘텐츠 생성을 지원할 수 있습니다.',
  },
  {
    title: '제5조 (AI 생성 콘텐츠)',
    body: '① 서비스에서 제공되는 AI 생성 콘텐츠는 이용자의 작성을 돕기 위한 참고 자료입니다.\n② AI가 생성한 내용에는 부정확하거나 적절하지 않은 내용이 포함될 수 있으며, 이용자는 최종적으로 내용을 확인하고 수정한 후 사용해야 합니다.',
  },
  {
    title: '제6조 (이용자의 의무)',
    body: '이용자는 다음 각 호의 행위를 해서는 안 됩니다.\n① 허위 정보를 등록하거나 타인의 정보를 도용하는 행위\n② 서비스의 정상적인 운영을 방해하는 행위\n③ 타인의 개인정보 또는 권리를 침해하는 행위\n④ 관련 법령 또는 본 약관을 위반하는 행위\n⑤ 서비스 운영자의 사전 동의 없이 서비스를 상업적으로 이용하는 행위',
  },
  {
    title: '제7조 (서비스의 변경 및 중단)',
    body: '① 서비스 운영자는 서비스의 기능 및 내용을 변경할 수 있습니다.\n② 시스템 점검, 장애 및 기타 부득이한 사유가 발생한 경우 서비스의 일부 또는 전부를 일시적으로 중단할 수 있습니다.',
  },
  {
    title: '제8조 (회원 탈퇴)',
    body: '① 회원은 서비스에서 정한 절차에 따라 언제든지 회원 탈퇴를 신청할 수 있습니다.\n② 회원 탈퇴에 따른 개인정보의 처리는 개인정보처리방침에 따릅니다.',
  },
  {
    title: '제9조 (면책)',
    body: '① 서비스 운영자는 장학금 운영기관의 사정에 따른 모집 내용의 변경, 취소 또는 정보 오류에 대해 서비스 운영자의 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.\n② 서비스 운영자는 AI가 생성한 콘텐츠의 정확성이나 완전성을 보장하지 않으며, 이용자는 AI 생성 결과를 확인하고 자신의 책임 하에 사용해야 합니다.\n③ 이용자의 귀책사유로 발생한 손해에 대해서는 서비스 운영자가 책임을 지지 않습니다.',
  },
  {
    title: '제10조 (약관의 변경)',
    body: '서비스 운영자는 관련 법령을 준수하는 범위에서 본 약관을 변경할 수 있으며, 변경사항은 서비스 내 공지 등을 통해 안내합니다.',
  },
  {
    title: '제11조 (분쟁해결 및 관할법원)',
    body: '① 서비스 이용과 관련하여 발생한 분쟁에 대해서는 대한민국 법을 적용합니다.\n② 서비스 이용과 관련하여 서비스 운영자와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.',
  },
];

const PRIVACY_SECTIONS = [
  {
    title: '제1조 (수집 항목)',
    body: '① 필수: 이름, 이메일, 비밀번호, 학교, 학년, 전공\n② 매칭용: 가구 소득분위, 가족관계 정보\n③ 서비스 이용 중 생성: 자기소개서 작성 내용, 면접 답변 내용',
  },
  {
    title: '제2조 (이용 목적)',
    body: '① 회원 식별 및 로그인\n② 맞춤형 장학금 매칭\n③ AI 기반 자기소개서 초안 생성 및 면접 질문 생성',
  },
  {
    title: '제3조 (보유 및 이용 기간)',
    body: '① 회원 탈퇴 시까지 보관합니다.\n② 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.',
  },
  {
    title: '제4조 (동의 거부 권리 및 불이익)',
    body: '① 이용자는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.\n② 다만, 필수 항목에 동의하지 않을 경우 서비스 이용(장학금 매칭 등)이 제한될 수 있습니다.',
  },
  {
    title: '제5조 (개인정보 처리 위탁)',
    body: '① 서비스 운영자는 서비스 제공을 위해 아래와 같이 개인정보 처리업무를 위탁하고 있습니다.\n\n수탁업체: Anthropic, PBC\n위탁업무: AI 기반 자기소개서 초안 생성, 면접 질문 생성을 위한 데이터 처리\n보유 및 이용기간: 위탁계약 종료 시 또는 서비스 목적 달성 시까지\n\n② 서비스 운영자는 위탁계약 체결 시 개인정보보호법 제26조에 따라 안전성 확보에 필요한 사항을 규정하고 있습니다.',
  },
];

export default function AgreementModal({ type, onClose }: AgreementModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const title = type === 'terms' ? '위시커넥트 이용 약관' : '개인정보 수집 및 이용 동의';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-[24px] py-[40px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="agreement-modal-title"
        className="relative flex max-h-[calc(100vh-80px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_16px_48px_rgba(16,19,26,0.2)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E6E7EB] px-[40px] py-[28px]">
          <h2 id="agreement-modal-title" className="text-[28px] font-bold text-[#10131A]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="약관 창 닫기"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[28px] leading-none text-[#555964] hover:bg-[#F3F4F6]"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-[40px] py-[32px] text-[14px] leading-[22px] text-[#30343D]">
          {type === 'terms' ? (
            <div className="flex flex-col gap-[24px]">
              {TERMS_SECTIONS.map((section) => (
                <section key={section.title}>
                  <h3 className="mb-[6px] font-bold text-[#10131A]">{section.title}</h3>
                  <p className="whitespace-pre-line">{section.body}</p>
                </section>
              ))}

              <section>
                <h3 className="mb-[6px] font-bold text-[#10131A]">부칙</h3>
                <p>본 약관은 2026년 8월 20일부터 시행합니다.</p>
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-[24px]">
              <p>
                위시커넥트(이하 "서비스 운영자")는 다음과 같이 개인정보를 수집·이용합니다.
              </p>

              {PRIVACY_SECTIONS.map((section) => (
                <section key={section.title}>
                  <h3 className="mb-[6px] font-bold text-[#10131A]">{section.title}</h3>
                  <p className="whitespace-pre-line">{section.body}</p>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
