import { NotificationsScreen } from "@/features/notifications/components/NotificationsScreen";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <NotificationsScreen />
    </ProtectedRoute>
  );
}
