import { GrantScreen } from "@/features/grant/components/GrantScreen";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <GrantScreen />
    </ProtectedRoute>
  );
}
