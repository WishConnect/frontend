import Button from '../Button/Button';
import { useNavigate } from 'react-router-dom';

interface LockedSectionProps {
  isLocked: boolean;
  children: React.ReactNode;
}

export default function LockedSection({ isLocked, children }: LockedSectionProps) {
  const navigate = useNavigate();
  return (
    <div className="relative">
      <div className={isLocked ? 'pointer-events-none blur-[20px]' : ''}>{children}</div>

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-[16px] text-center">
            <div className="text-[16px] font-medium leading-[24px] text-[#10131A]">
              프로필을 업데이트하고
              <br />
              나에게 딱 맞는 장학금을 추천받아 보세요.
            </div>

            <Button
              size="md"
              variant="primary"
              weight="semibold"
              width="242px"
              className="text-[18px] leading-[26px]"
              onClick={() => navigate('/onboarding')}
            >
              프로필 업데이트하고 확인하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
