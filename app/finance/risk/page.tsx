import { RiskDetailScreen } from "@/features/finance/components/RiskDetailScreen";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <RiskDetailScreen />
    </ProtectedRoute>
  );
}
