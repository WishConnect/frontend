import { useNavigate } from 'react-router-dom';

import CurationIcon from '../../assets/icons/CurationIcon.svg';
import Mypage from '../../assets/icons/Mypage.svg';
import ArchivingIcon from '../../assets/icons/File.svg';
import InsightIcon from '../../assets/icons/LightBulb.svg';
import RightIcon from '../../assets/icons/ArrowCircle.svg';

interface QuickMenu {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
}

const quickMenus: QuickMenu[] = [
  {
    id: 'curation',
    title: '추천 장학금',
    description: 'AI가 추천하는 맞춤\n장학금을 둘러보세요.',
    path: '/curation',
    icon: CurationIcon,
  },
  {
    // desc 수정 필요
    id: 'application',
    title: '마이페이지',
    description: '내 정보를 관리하고,\n맞춤 추천 기준을 확인해보세요.',
    path: '/mypage',
    icon: Mypage,
  },
  {
    id: 'archiving',
    title: '보관함',
    description: '스크랩한 장학금과 작성한\n지원서를 한눈에 관리해요.',
    path: '/archiving',
    icon: ArchivingIcon,
  },
  {
    id: 'insight',
    title: '인사이트',
    description: '합격 후기와 가이드를 확인하고\n장학금 준비 팁을 얻어보세요.',
    path: '/insight',
    icon: InsightIcon,
  },
];

export default function QuickMenuSection() {
  const navigate = useNavigate();

  return (
    <section className=" w-full">
      <h2 className="text-[24px] font-bold leading-[32px] text-[#10131A]">바로 가기</h2>

      <div className="mt-[16px] grid grid-cols-4 gap-[16px]">
        {quickMenus.map((menu) => (
          <button
            key={menu.id}
            type="button"
            onClick={() => navigate(menu.path)}
            className="group relative h-[160px] rounded-[8px] border border-[#E6E7EB] bg-[#F9FAFC] px-[36px] pt-[28px] pb-[28px] text-left shadow-[0_1px_7px_0_rgba(0,0,0,0.05)]"
          >
            {/* 아이콘 + 제목 */}
            <div className="flex h-[32px] items-center gap-[12px]">
              <img src={menu.icon} alt="" className=" shrink-0 object-contain" />

              <h3 className="text-[24px] font-bold leading-[32px] text-[#10131A]">{menu.title}</h3>
            </div>

            {/* 설명 + 화살표 */}
            <div className="mt-[26px] flex items-end justify-between">
              <p className="whitespace-pre-line text-[14px] font-medium leading-[20px] text-[#555964]">
                {menu.description}
              </p>

              <img src={RightIcon} alt="" className="h-[32px] w-[32px] shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
