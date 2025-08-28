"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
export default function CheckValidSession() {
    const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    async function check() {
			console.log(session)
      if (!session?.user.token) return;

      try {
        const res = await fetch("/api/session/check", {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        });
        const data = await res.json();

        if (!data.valid) {
          await signOut({ redirect: false });
          router.push("/login");
        }
      } catch (e) {
        console.error(e);
        await signOut({ redirect: false });
        router.push("/login");
      }
    }

    check();
  }, [router, session, pathname]);



  return null;
}
