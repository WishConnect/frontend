interface HomeLockedContentProps {
  isLocked: boolean;
  description: React.ReactNode;
  buttonText: string;
  children: React.ReactNode;
  onClick?: () => void;
  overlayColor?: string;
}

export default function HomeLockedContent({
  isLocked,
  description,
  buttonText,
  children,
  onClick,
  overlayColor = '#FFFFFF',
}: HomeLockedContentProps) {
  return (
    <div className="relative h-full">
      <div className="relative">
        <div className={isLocked ? 'pointer-events-none blur-[10px]' : ''}>{children}</div>

        {isLocked && <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />}
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
          <p className="text-[14px] font-semibold leading-[20px] text-[#10131A]">{description}</p>

          <button
            type="button"
            onClick={onClick}
            className="mt-[16px] h-[40px] rounded-[8px] bg-[#7962ED] px-[20px] text-[14px] font-semibold text-white"
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
