import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import { requireRole } from "../../../lib/auth/requireRole";
import { redirect } from "next/navigation";
import AdvertisingHeader from "./components/AdvertisingHeader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  await requireRole("advertising");

  return (
    <div className="min-h-screen flex flex-col">
      <AdvertisingHeader
        fullName={session.user.fullName ?? "?"}
        visibility={session.user.visibility}
      />
      <main className="flex-1 p-6 bg-gray-50">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </main>
    </div>
  );
}
