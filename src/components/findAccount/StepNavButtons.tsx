import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import Button from '../Button/Button';

// 계정 찾기 단계 이동 버튼(이전/다음). Figma 2462:4696
//   이전  123x60, 배경 #F3F4F6, 글자 #747883, 좌측 화살표
//   다음  123x60, 그라데이션(#7962ED→#BDB9F9), 글자 흰색, 우측 화살표
// 공용 Button의 size="lg"(h-60, 20px)와 variant="gradient"가 Figma 값과 그대로 일치해 재사용한다.
interface StepNavButtonsProps {
  onPrev?: () => void; // 없으면 이전 버튼을 그리지 않는다(1단계)
  onNext: () => void;
  nextLabel?: string;
  // 마지막 단계의 "확인"은 화살표 없이 좁은 폭(99px)으로 나온다. Figma 2462:5359
  isSubmit?: boolean;
  disabled?: boolean;
}

export default function StepNavButtons({
  onPrev,
  onNext,
  nextLabel = '다음',
  isSubmit = false,
  disabled = false,
}: StepNavButtonsProps) {
  return (
    <div className="flex gap-[16px]">
      {onPrev && (
        <Button
          size="lg"
          variant="inactive"
          width="123px"
          onClick={onPrev}
          leftIcon={<MdKeyboardArrowLeft size={24} />}
          iconGap={16}
          className="!text-[#747883]"
        >
          이전
        </Button>
      )}

      <Button
        size="lg"
        variant={disabled ? 'disabled' : 'gradient'}
        width={isSubmit ? '99px' : '123px'}
        disabled={disabled}
        onClick={onNext}
        rightIcon={isSubmit ? undefined : <MdKeyboardArrowRight size={24} />}
        iconGap={16}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
