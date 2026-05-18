import { MyPageScreen } from "@/features/mypage";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <MyPageScreen />
    </ProtectedRoute>
  );
}
