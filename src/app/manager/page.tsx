import LogoutButton from "@/app/components/LogoutButton";

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">👑 менеджер-панель</h1>
      <LogoutButton />
    </div>
  );
}
