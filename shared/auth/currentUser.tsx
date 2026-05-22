"use client";

import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

export type CurrentUser = Readonly<{
  displayName: string;
  profileComplete?: boolean;
  userId?: string;
}>;

type CurrentUserContextValue = Readonly<{
  user: CurrentUser;
}>;

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({
  children,
  user,
}: Readonly<{
  children: ReactNode;
  user: CurrentUser;
}>) {
  return (
    <CurrentUserContext.Provider value={{ user }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    return {
      user: {
        displayName: "고객",
      },
    };
  }

  return context;
}
