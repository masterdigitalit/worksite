'use client';
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useGeolocation } from "../hooks/useGeolocation";

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const { coords } = useGeolocation();

  const handleLogin = async () => {
    // if (!coords) return; // 🔹 Без геопозиции не логиним
    await signIn("credentials", {
      username,
      password,
      callbackUrl: "/",
      // lat: coords.lat,
      // lng: coords.lng,
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

      {/* <button
        onClick={handleLogin}
        // disabled={!coords} // 🔹 Заблокировано, пока нет координат
        className={`px-6 py-2 rounded text-white
           ${
          coords ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        }
        `}
      >
        Войти
      </button> */}
          <button
        onClick={handleLogin}
        // disabled={!coords} // 🔹 Заблокировано, пока нет координат
        className={`px-6 py-2 rounded text-white bg-blue-600 hover:bg-blue-700`}
           
      >
        Войти
      </button>

      {/* {!coords && (
        <p className="text-red-600 text-sm">
          Разрешите доступ к геопозиции, чтобы войти
        </p>
      )} */}
    </div>
  );
}
