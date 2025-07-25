"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = async () => {
    await signIn("credentials", {
      username,
      password,
      callbackUrl: window.location.origin, 
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <input
        placeholder="Логин"
        className="border px-4 py-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        className="border px-4 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <div className="text-red-600">Неверный логин или пароль</div>
      )}
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Войти
      </button>
    </div>
  );
}
