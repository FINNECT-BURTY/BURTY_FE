import { FinanceScreen } from "@/features/finance/components/FinanceScreen";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <FinanceScreen />
    </ProtectedRoute>
  );
}
