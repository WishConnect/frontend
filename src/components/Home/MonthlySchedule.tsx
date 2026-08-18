import { useState } from 'react';
import MonthLeft from '../../assets/icons/MonthLeft.svg';
import MonthRight from '../../assets/icons/MonthRight.svg';

export interface HomeSchedule {
  id: string | number;
  scholarshipId: number;
  date: string;
  type: 'START' | 'DEADLINE';
  title: string;
}

interface MonthlyScheduleProps {
  schedules: HomeSchedule[];
  isLocked?: boolean;
  onLockedClick?: () => void;
  onScheduleClick?: (scholarshipId: number) => void;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ITEMS_PER_PAGE = 4;

function createDateKey(year: number, month: number, date: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

function parseDate(dateString: string) {
  const normalizedDate = dateString.replaceAll('.', '-');
  const [year, month, date] = normalizedDate.split('-').map(Number);

  return new Date(year, month - 1, date);
}

export default function MonthlySchedule({
  schedules,
  isLocked = false,
  onLockedClick,
  onScheduleClick,
}: MonthlyScheduleProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [schedulePage, setSchedulePage] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    const today = new Date();

    return createDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const calendarDates = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => index + 1),
  ];

  const currentMonthSchedules = schedules
    .filter((schedule) => {
      const scheduleDate = parseDate(schedule.date);

      return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month;
    })
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  const scheduleDateSet = new Set(currentMonthSchedules.map((schedule) => schedule.date));

  const selectedDateSchedules = currentMonthSchedules.filter(
    (schedule) => schedule.date === selectedDateKey,
  );

  const totalPages = Math.max(1, Math.ceil(selectedDateSchedules.length / ITEMS_PER_PAGE));

  const visibleSchedules = selectedDateSchedules.slice(
    schedulePage * ITEMS_PER_PAGE,
    schedulePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  const handlePrevMonth = () => {
    if (isLocked) return;

    const newDate = new Date(year, month - 1, 1);

    setCurrentDate(newDate);
    setSelectedDateKey('');
    setSchedulePage(0);
  };

  const handleNextMonth = () => {
    if (isLocked) return;

    const newDate = new Date(year, month + 1, 1);

    setCurrentDate(newDate);
    setSelectedDateKey('');
    setSchedulePage(0);
  };

  const handlePrevSchedule = () => {
    setSchedulePage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextSchedule = () => {
    setSchedulePage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  return (
    <article className="flex h-[256px] w-[774px] flex-col rounded-[16px] border border-[#D2D4DA] bg-white px-[36px] pt-[24px] pb-[24px]">
      {/* 상단 제목 + 월 이동 */}
      <div className="flex h-[32px] items-center justify-between">
        <h2 className="text-[24px] font-bold leading-[32px] text-[#10131A]">이번 달 일정</h2>

        <div className="flex items-center gap-[15px]">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isLocked}
            className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center text-[20px] text-[#747883] disabled:cursor-default"
            aria-label="이전 달"
          >
            <img src={MonthLeft} alt="" />
          </button>

          <span className="relative -top-[1px] h-[24px] min-w-[30px] text-center text-[16px] font-medium leading-[24px] text-[#10131A]">
            {month + 1}월
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isLocked}
            className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center text-[20px] text-[#747883] disabled:cursor-default"
            aria-label="다음 달"
          >
            <img src={MonthRight} alt="" />
          </button>
        </div>
      </div>

      {/* 제목 아래 영역 */}
      <div className="relative mt-[12px] min-h-0 flex-1">
        {isLocked ? (
          /* 로그인하지 않은 상태 */
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            <p className="text-[14px] font-semibold leading-[20px] text-[#10131A]">
              로그인하고 맞춤
              <br />
              장학금 일정 관리를 시작해 보세요.
            </p>

            <button
              type="button"
              onClick={onLockedClick}
              className="mt-[16px] h-[40px] rounded-[8px] bg-[#7962ED] px-[20px] text-[14px] font-semibold text-white"
            >
              로그인하고 시작하기
            </button>
          </div>
        ) : (
          /* 로그인한 상태에서만 실제 달력 + 일정 렌더링 */
          <div className="flex h-full min-h-0">
            {/* 왼쪽 달력 */}
            <div className="w-fit shrink-0">
              {/* 요일 */}
              <div className="grid grid-cols-7 gap-x-[20px] text-center">
                {DAYS.map((day) => (
                  <span
                    key={day}
                    className="flex h-[20px] w-[24px] items-center justify-center text-[14px] font-medium leading-[20px] text-[#9DA1AC]"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* 날짜 */}
              <div className="mt-[4px] grid grid-cols-7 gap-x-[20px] gap-y-[2px]">
                {calendarDates.map((date, index) => {
                  if (date === null) {
                    return <span key={`empty-${index}`} className="h-[24px] w-[24px]" />;
                  }

                  const dateKey = createDateKey(year, month, date);
                  const hasSchedule = scheduleDateSet.has(dateKey);

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      disabled={!hasSchedule}
                      onClick={() => {
                        if (!hasSchedule) return;

                        setSelectedDateKey(dateKey);
                        setSchedulePage(0);
                      }}
                      className={`flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-[14px] font-medium ${
                        hasSchedule
                          ? 'cursor-pointer bg-[#7962ED] text-white'
                          : 'cursor-default text-[#555964]'
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 달력에서 50px 떨어진 중앙선 */}
            <div className="ml-[50px] h-full w-px shrink-0 bg-[#747883]" />

            {/* 중앙선에서 49px 떨어진 오른쪽 일정 */}
            <div className="relative ml-[49px] flex min-w-0 flex-1 flex-col">
              {visibleSchedules.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-[32px] gap-y-[16px]">
                  {visibleSchedules.map((schedule) => {
                    const scheduleDate = parseDate(schedule.date);
                    const weekDay = DAYS[scheduleDate.getDay()];

                    return (
                      <div key={schedule.id} className="min-w-0">
                        <p className="text-[16px] font-bold leading-[24px] text-[#10131A]">
                          {scheduleDate.getMonth() + 1}/{scheduleDate.getDate()} ({weekDay})
                        </p>

                        <button
                          type="button"
                          onClick={() => onScheduleClick?.(schedule.scholarshipId)}
                          className="relative z-20 mt-[4px] block w-full truncate text-left text-[16px] font-medium leading-[24px] text-[#555964] hover:text-[#7962ED]"
                        >
                          {schedule.title}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-[14px] font-medium text-[#9DA1AC]">
                    이번 달 등록된 일정이 없어요.
                  </p>
                </div>
              )}

              {/* 일정 페이지 이동 */}
              {totalPages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSchedule}
                    className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer bg-transparent"
                    aria-label="이전 일정"
                  />

                  <button
                    type="button"
                    onClick={handleNextSchedule}
                    className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer bg-transparent"
                    aria-label="다음 일정"
                  />
                </>
              )}

              {/* 페이지 점 */}
              <div className="relative z-0 mt-auto flex justify-center gap-[6px]">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSchedulePage(index)}
                    className={`h-[6px] w-[6px] cursor-pointer rounded-full ${
                      schedulePage === index ? 'bg-[#7962ED]' : 'bg-[#D2D4DA]'
                    }`}
                    aria-label={`${index + 1}번째 일정`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
