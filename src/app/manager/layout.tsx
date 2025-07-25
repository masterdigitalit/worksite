// src/app/admin/layout.tsx

import { requireRole } from "../../../lib/auth/requireRole";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireRole("manager"); // проверка роли

	return <>{children}</>;
}
