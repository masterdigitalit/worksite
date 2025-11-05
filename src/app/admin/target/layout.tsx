
import { AuthProvider } from "contexts/AuthContext";

export default function GoalLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}