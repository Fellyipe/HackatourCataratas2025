// app/page.js
"use client";
import { useState } from "react";

export default function Page() {
  const [serverTime, setServerTime] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchTime() {
    setLoading(true);
    try {
      const res = await fetch("/api/time");
      const json = await res.json();
      setServerTime(json.time);
    } catch (err) {
      setServerTime("Erro ao chamar API: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  async function sendEcho() {
    if (!message) return alert("Digite algo primeiro");
    setLoading(true);
    try {
      const res = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      setResponse(json);
    } catch (err) {
      setResponse({ error: "Erro: " + String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Protótipo básico — Next.js (App Router) + API</h1>

      <section style={{ marginTop: 20 }}>
        <h2>1) Pegar hora do servidor</h2>
        <p>
          Testa um endpoint GET em <code>/api/time</code>
        </p>
        <button onClick={fetchTime} disabled={loading}>
          {loading ? "Carregando..." : "Pegar hora do servidor"}
        </button>
        <div style={{ marginTop: 10 }}>
          {serverTime ? (
            <strong>Hora do servidor: {serverTime}</strong>
          ) : (
            "Nenhuma hora ainda."
          )}
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>2) Teste Echo (POST)</h2>
        <p>Digite algo e a API vai devolver o que você enviou.</p>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreve algo aqui..."
          style={{ padding: 8, width: 320 }}
        />
        <button onClick={sendEcho} style={{ marginLeft: 8 }} disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>

        <div style={{ marginTop: 12 }}>
          {response ? (
            <div>
              <div>
                <strong>Resposta do servidor:</strong>
              </div>
              <pre style={{ background: "#5787b8ff", padding: 10 }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          ) : (
            "Nenhuma resposta ainda."
          )}
        </div>
      </section>
    </main>
  );
}
