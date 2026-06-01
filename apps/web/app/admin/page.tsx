"use client";

import { useState } from "react";

type Stats = {
  users: number;
  generations: number;
  completed_generations: number;
  failed_generations: number;
  conversion_rate: number;
  sales: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    setError(null);
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      setError("Не удалось загрузить статистику.");
      return;
    }
    setStats((await response.json()) as Stats);
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">Admin</div>
        <a href="/">Вернуться на сайт</a>
      </header>
      <div className="shell">
        <section className="panel form">
          <div className="field">
            <label>Admin API token</label>
            <input className="input" value={token} onChange={(event) => setToken(event.target.value)} />
          </div>
          <button className="button" type="button" onClick={loadStats}>Загрузить статистику</button>
          {error ? <div className="error">{error}</div> : null}
        </section>

        {stats ? (
          <section className="admin stats">
            <div className="stat"><strong>{stats.users}</strong><span>пользователей</span></div>
            <div className="stat"><strong>{stats.generations}</strong><span>генераций</span></div>
            <div className="stat"><strong>{stats.completed_generations}</strong><span>успешно</span></div>
            <div className="stat"><strong>{stats.failed_generations}</strong><span>ошибок</span></div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
