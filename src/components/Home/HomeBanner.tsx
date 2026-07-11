import AiIcon from '../../assets/icons/AiIcon';
import Button from '../Button/Button';
import ChevronRight from '../../assets/icons/ChevronRight';

interface HomeBannerProps {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  onClick?: () => void;
}

export default function HomeBanner({ isLoggedIn, isOnboarded, onClick }: HomeBannerProps) {
  const bannerContent = !isLoggedIn
    ? {
        title: '맞춤 장학금을 위시커넥트가 추천해드려요!',
        description: '지금 바로 확인하고 기회를 놓치지 마세요.',
        buttonText: '로그인하고 시작하기',
      }
    : !isOnboarded
      ? {
          title: '새로운 맞춤 장학금이 등록되었어요!',
          description: '프로필 업데이트 후 확인하고 기회를 놓치지 마세요.',
          buttonText: '프로필 업데이트하고 확인하기',
        }
      : {
          title: '맞춤 장학금을 위시커넥트가 추천해드려요!',
          description: '지금 바로 확인하고 기회를 놓치지 마세요.',
          buttonText: '맞춤 장학금 확인하기',
        };

  return (
    <div className="flex h-[80px] items-center justify-between rounded-[16px] border border-[#D2D4DA] py-[16px] pl-[32px] pr-[18px]">
      <div className="flex items-center gap-[20px]">
        <AiIcon isLoggedIn={isLoggedIn} />

        <div>
          <p className="text-[16px] font-bold leading-[20px] text-[#10131A]">
            {bannerContent.title}
          </p>

          <p className="mt-[2px] text-[14px] font-medium leading-[20px] text-[#555964]">
            {bannerContent.description}
          </p>
        </div>
      </div>

      <Button
        size="md"
        variant="gradient"
        weight="semibold"
        rightIcon={<ChevronRight />}
        paddingLeft="24px"
        paddingRight="24px"
        className="text-[16px] leading-[24px]"
        onClick={onClick}
      >
        {bannerContent.buttonText}
      </Button>
    </div>
  );
}
