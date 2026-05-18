import { SolutionScreen } from "@/features/solution/components/SolutionScreen";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <SolutionScreen />
    </ProtectedRoute>
  );
}
