import React, { useEffect, useMemo, useState } from "react";

const FRIEND_KEYS = ["Riley", "Kaylin", "Eve", "Jess"];
const DATA_URL = "https://script.google.com/macros/s/AKfycbwhqWjyiXaw7Ir-Xa5_bzyO5nD5IZs4vDD8xvmDjpX855rcFQ67Jnz49C-vEpK51ZmT/exec";

const FRIEND_COLOR = {
  Riley: { card: "from-emerald-500/30 to-emerald-400/20 border-emerald-300", chipPlus: "bg-emerald-400 text-emerald-950", chipMinus: "bg-emerald-700 text-white" },
  Kaylin: { card: "from-sky-500/30 to-sky-400/20 border-sky-300", chipPlus: "bg-sky-400 text-sky-950", chipMinus: "bg-sky-700 text-white" },
  Eve:   { card: "from-fuchsia-500/30 to-fuchsia-400/20 border-fuchsia-300", chipPlus: "bg-fuchsia-400 text-fuchsia-950", chipMinus: "bg-fuchsia-700 text-white" },
  Jess:  { card: "from-amber-400/30 to-amber-300/20 border-amber-300", chipPlus: "bg-amber-300 text-amber-950", chipMinus: "bg-amber-700 text-white" },
};

function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function JoshPointsApp() {
  const [scores, setScores] = useState({ Riley: 0, Kaylin: 0, Eve: 0, Jess: 0 });
  const [updates, setUpdates] = useState([]);
  const [rules, setRules] = useState([]); // ← array from Sheets
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // { scores, updates, rules }

        if (!alive) return;
        setScores({ Riley:0, Kaylin:0, Eve:0, Jess:0, ...(data.scores || {}) });
        setUpdates(Array.isArray(data.updates) ? data.updates : []);
        setRules(Array.isArray(data.rules) ? data.rules : []);
      } catch (e) {
        console.error("Failed to load Josh Points:", e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const total = useMemo(
    () => FRIEND_KEYS.reduce((acc, k) => acc + (scores[k] || 0), 0),
    [scores]
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-800 via-fuchsia-700 to-rose-700 text-white p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow text-center">Josh Points <br></br><span className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow text-center">Calder 405</span></h1>
        </header>

        {/* Scoreboard (2x2 on mobile, horizontal on larger) */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3 sm:overflow-x-auto sm:pb-2">
            {FRIEND_KEYS.map((friend) => (
              <div
                key={friend}
                className={`flex-shrink-0 min-w-[140px] sm:min-w-[180px] rounded-2xl bg-gradient-to-br ${FRIEND_COLOR[friend].card} border shadow-lg p-4 backdrop-blur-sm text-center`}
              >
                {loading ? (
                  <div className="animate-pulse select-none">
                    <div className="h-5 w-16 mx-auto mb-2 rounded bg-white/40"></div>
                    <div className="h-8 w-12 mx-auto rounded bg-white/70"></div>
                    <div className="h-3 w-20 mx-auto mt-2 rounded bg-white/30"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-xl font-bold drop-shadow-sm">{friend}</h2>
                      <span className="text-3xl font-extrabold tabular-nums">{scores[friend]}</span>
                    </div>
                    <div className="text-xs text-white/80 float-right">Josh Points</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Updates */}
        <section className="mb-10">
          <h3 className="text-lg font-bold mb-3 drop-shadow">Recent updates</h3>
          <div className="rounded-2xl bg-white/10 border border-white/30 shadow backdrop-blur divide-y divide-white/20">
            {loading ? (
              <div className="p-4 animate-pulse">
                <div className="h-4 w-2/3 mb-2 rounded bg-white/30"></div>
                <div className="h-4 w-1/2 rounded bg-white/20"></div>
              </div>
            ) : updates.length === 0 ? (
              <div className="p-4 text-white/80">No updates yet.</div>
            ) : (
              updates.slice(0, 20).map((u) => (
                <div key={u.id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">
                      <span>{u.friend}</span>
                      <span
                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-sm tabular-nums ${
                          u.delta >= 0
                            ? FRIEND_COLOR[u.friend]?.chipPlus || "bg-emerald-400 text-emerald-950"
                            : FRIEND_COLOR[u.friend]?.chipMinus || "bg-rose-700 text-white"
                        }`}
                      >
                        {u.delta >= 0 ? `+${u.delta}` : u.delta}
                      </span>
                    </div>
                    {u.note && <div className="text-white/90 text-sm mt-1">{u.note}</div>}
                  </div>
                  <div className="text-white/80 text-sm shrink-0">{formatTimeAgo(u.ts)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Rules from Sheet */}
        <section className="mb-20">
          <h3 className="text-lg font-bold mb-3 drop-shadow">Rules</h3>
          <div className="rounded-2xl bg-white/10 border border-white/30 shadow p-4 backdrop-blur">
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 w-4/5 rounded bg-white/30"></div>
                <div className="h-3 w-3/5 rounded bg-white/20"></div>
                <div className="h-3 w-2/3 rounded bg-white/25"></div>
              </div>
            ) : rules.length === 0 ? (
              <div className="text-white/80">No rules found.</div>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {rules.map((r, i) => (
                  <li key={`${r.order ?? i}-${r.text}`} className="text-sm">
                    <span className="text-white/95">{r.text}</span>
                    {r.points != null && !Number.isNaN(r.points) && (
                      <span className="ml-2 text-white/70">({r.points > 0 ? `+${r.points}` : r.points})</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-white/90 text-sm flex items-center justify-between">
          <span>Total points: <span className="tabular-nums font-semibold">{total}</span></span>
          <span>Built for Calder 405 💙</span>
        </footer>
      </div>
    </div>
  );
}
