interface HomeGreetingProps {
  isLoggedIn: boolean;
  name?: string;
}

export default function HomeGreeting({ isLoggedIn, name }: HomeGreetingProps) {
  return (
    <div>
      <h1 className="text-[40px] h-[52px] font-bold leading-[52px] text-[#10131A]">
        안녕하세요
        {isLoggedIn && name && (
          <>
            , <span className="text-[#7962ED]">{name}</span>
            <span>님!</span>
          </>
        )}
      </h1>

      <p className="mt-[4px] h-[24px] text-[16px] font-medium leading-[24px] text-[#555964]">
        오늘의 장학금을 확인해보세요.
      </p>
    </div>
  );
}
