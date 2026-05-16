import { Menu, UserRound } from "lucide-react";

export function MainHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-sub-background px-6">
      <button
        aria-label="메뉴 열기"
        className="-ml-2 flex size-9 items-center justify-center text-primary"
        type="button"
      >
        <Menu aria-hidden="true" size={19} strokeWidth={2.25} />
      </button>
      <div className="min-w-0 flex-1 pl-1 text-base font-semibold text-primary">
        Berty
      </div>
      <button
        aria-label="내 정보 보기"
        className="flex size-10 items-center justify-center rounded-full bg-sub-background text-primary"
        type="button"
      >
        <UserRound aria-hidden="true" size={22} strokeWidth={1.8} />
      </button>
    </header>
  );
}
