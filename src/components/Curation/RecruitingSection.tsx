import { useState } from 'react';
import type { RecruitingScholarship, ScholarshipCategory } from '../../mock/memberCuration';
import Button from '../Button/Button';
import ChevronDown from '../../assets/icons/ChevronDown.svg';
import ChevronUp from '../../assets/icons/ChevronUp.svg';
import Scrap from '../../assets/icons/ScrapDiasbled.svg';

interface RecruitingSectionProps {
  scholarships: RecruitingScholarship[];
}

const categories: { label: '전체' | ScholarshipCategory; width: string }[] = [
  { label: '전체', width: '49px' },
  { label: '생활비', width: '61px' },
  { label: '성적우수', width: '73px' },
  { label: '전공/특기', width: '78px' },
  { label: '해외연수', width: '76px' },
  { label: '기타', width: '49px' },
];

export default function RecruitingSection({ scholarships }: RecruitingSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'전체' | ScholarshipCategory>('전체');
  const [isOpen, setIsOpen] = useState(false);

  const filteredScholarships =
    selectedCategory === '전체'
      ? scholarships
      : scholarships.filter((scholarship) => scholarship.category === selectedCategory);

  const visibleScholarships = isOpen ? filteredScholarships : filteredScholarships.slice(0, 4);

  return (
    <section className="flex w-[1043px] flex-col ">
      <div className="mt-[20px] flex gap-[8px]">
        {categories.map((category) => (
          <Button
            key={category.label}
            size="sm"
            width={category.width}
            variant={selectedCategory === category.label ? 'primary' : 'outline'}
            weight="medium"
            onClick={() => {
              setSelectedCategory(category.label);
              setIsOpen(false);
            }}
          >
            {category.label}
          </Button>
        ))}
      </div>

      <div className="flex mt-[16px] h-[16px] pb-[12px] items-center border-b border-[#D2D4DA] text-[12px] font-medium leading-[16px] text-[#555964]">
        <div className="w-[413px]" />
        <div className="w-[180px] text-center">최대 금액</div>
        <div className="w-[180px] text-center">마감일</div>
        <div className="w-[270px] text-center">지원 조건 요약</div>
      </div>

      <div className="flex flex-col">
        {visibleScholarships.map((scholarship) => (
          <div
            key={scholarship.id}
            className="flex h-[64px] pt-[20px] pb-[20px] items-center border-b border-[#D2D4DA]"
          >
            <div className="flex w-[413px] items-center ">
              <img src={Scrap} alt="스크랩" className="h-[20px] w-[20px] ml-[23px] mr-[20px]" />

              <span className="text-[16px] font-semibold leading-[24px] text-[#10131A] mr-[12px]">
                {scholarship.title}
              </span>

              <div className="flex items-center gap-[2px]">
                {scholarship.tags.map((tag) => (
                  <span
                    key={tag}
                    className="relative top-[1px] flex h-[24px] items-center justify-center rounded-[16px] bg-[#F3F4F6] px-[12px] text-[12px] font-medium leading-[16px] text-[#747883]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-[180px] text-center text-[14px] font-medium leading-[20px] text-[#555964]">
              {scholarship.amount}
            </div>

            <div className="w-[180px] text-center text-[14px] font-medium leading-[20px] text-[#555964]">
              {scholarship.deadline} ({scholarship.dDay})
            </div>

            <div className="flex w-[270px] justify-center gap-[8px]">
              {scholarship.requirements.map((requirement) => (
                <span
                  key={requirement}
                  className="rounded-[16px] h-[24.992px] px-[12px] py-[4px] text-[12px] font-medium leading-[16px] text-[#555964] shadow-[inset_0_0_0_0.781px_#9DA1AC]"
                >
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex mt-[16px] h-[56px] items-center justify-center gap-[8px] rounded-[8px] border border-[#D2D4DA] bg-white"
      >
        <span className="text-[16px] font-medium text-[#555964]">
          {isOpen ? '접기' : '더 많은 장학금 보기'}
        </span>

        <img src={isOpen ? ChevronUp : ChevronDown} alt="" className="h-[20px] w-[20px]" />
      </button>
    </section>
  );
}
