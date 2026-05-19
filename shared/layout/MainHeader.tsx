import { Header, HeaderIconButton } from "@/shared/layout/Header";

export function MainHeader() {
  return (
    <Header
      leftClassName="text-title-md min-w-0 flex-1 text-grayscale-1000"
      leftSlot="BURTY"
      rightSlot={
        <HeaderIconButton
          aria-label="알림 보기"
          iconSrc="/icons/header/alarm.svg"
        />
      }
    />
  );
}
