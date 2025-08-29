import React, { useMemo, useState, useEffect, useRef } from "react";

/** Riley's Word Game — fixed:
 *  - Live typing row shows in the grid
 *  - On-screen keyboard clicks (letters, Enter, Backspace)
 *  - Backspace from hardware keyboard works
 */

const WORDS = ["RILEY","PEACH","HEART","SMILE","PETAL","HONEY","GRACE","CANDY","ROSIE","PARTY","BLOSS","BERRY","PINKY"];
const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

const pickRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

function evaluateGuess(guess, answer) {
  const res = Array(WORD_LENGTH).fill("absent");
  const counts = {};
  for (let i = 0; i < WORD_LENGTH; i++) counts[answer[i]] = (counts[answer[i]] || 0) + 1;
  for (let i = 0; i < WORD_LENGTH; i++) if (guess[i] === answer[i]) { res[i] = "correct"; counts[guess[i]]--; }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (res[i] === "correct") continue;
    const ch = guess[i];
    if (counts[ch] > 0) { res[i] = "present"; counts[ch]--; }
  }
  return res;
}

export default function App() {
  const [answer, setAnswer] = useState(pickRandomWord);
  const [rows, setRows] = useState([]);          // {guess, eval}[]
  const [current, setCurrent] = useState("");    // live guess
  const [status, setStatus] = useState("playing"); // "playing" | "won" | "lost"
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [status]);

  const keyboardHints = useMemo(() => {
    const order = { absent: 0, present: 1, correct: 2 };
    const best = {};
    for (const r of rows) {
      r.eval.forEach((st, i) => {
        const ch = r.guess[i];
        if (!best[ch] || order[st] > order[best[ch]]) best[ch] = st;
      });
    }
    return best;
  }, [rows]);

  function resetGame() {
    setAnswer(pickRandomWord());
    setRows([]);
    setCurrent("");
    setStatus("playing");
    inputRef.current?.focus();
  }

  function submitGuess() {
    if (status !== "playing") return;
    const g = current.toUpperCase().replace(/[^A-Z]/g, "");
    if (g.length !== WORD_LENGTH) return;
    const evaluation = evaluateGuess(g, answer);
    const newRows = [...rows, { guess: g, eval: evaluation }];
    setRows(newRows);
    setCurrent("");
    if (g === answer) setStatus("won");
    else if (newRows.length >= MAX_ATTEMPTS) setStatus("lost");
  }

  function onKeyDown(e) {
    if (status !== "playing") return;
    if (e.key === "Enter") { e.preventDefault(); submitGuess(); return; }
    if (e.key === "Backspace") { setCurrent(c => c.slice(0, -1)); return; }
  }

  function handleKey(k) {
    if (status !== "playing") return;
    if (k === "ENTER") { submitGuess(); return; }
    if (k === "BACKSPACE") { setCurrent(c => c.slice(0, -1)); return; }
    if (/^[A-Z]$/.test(k)) setCurrent(c => (c + k).slice(0, WORD_LENGTH));
  }

  return (
    <div className="riley-game">
      <style>{`
        :root { --pink-900:#7a224f; --pink-700:#b83280; --pink-600:#d9468f; --pink-500:#ec4899;
                --pink-400:#f472b6; --pink-300:#f9a8d4; --pink-200:#fbcfe8; --pink-100:#fce7f3;
                --ink-900:#1f1a22; --ink-700:#2f2430; --gray-300:#dad2da; --gray-600:#7b7380; --white:#fff; }
        *{box-sizing:border-box} body{margin:0}
        .riley-game{min-height:100svh;display:grid;place-items:center;
          background:linear-gradient(180deg,var(--pink-100),var(--pink-200));
          font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;
          color:var(--ink-900); padding:24px;}
        .card{width:min(720px,100%);background:var(--white);border:1px solid var(--pink-200);
          box-shadow:0 20px 60px rgba(236,72,153,.25);border-radius:24px;padding:24px;}
        .title{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
        .pill{background:var(--pink-100);color:var(--pink-700);border:1px solid var(--pink-200);
          padding:4px 10px;border-radius:999px;font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase;}
        h1{margin:0;font-size:28px;color:var(--pink-900)}
        .subtitle{color:var(--ink-700);margin:0 0 20px}

        .grid{display:grid;grid-template-columns:repeat(${WORD_LENGTH},1fr);gap:8px;margin:16px 0 8px;}
        .cell{width:56px;height:56px;border-radius:12px;display:grid;place-items:center;font-weight:800;font-size:22px;
          letter-spacing:.05em;border:1px solid var(--gray-300);color:var(--ink-900);background:#fff;}
        .cell.correct{background:var(--pink-500);color:#fff;border-color:var(--pink-500)}
        .cell.present{background:var(--pink-200);color:var(--ink-900);border-color:var(--pink-300)}
        .cell.absent{background:#f5f5f7;color:var(--gray-600)}
        .row-spacer{height:8px}

        .controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:16px 0 8px;}
        .input{flex:1 1 220px;min-width:220px;background:#fff;border:2px solid var(--pink-300);outline:none;border-radius:12px;
          padding:12px 14px;font-size:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
        .btn{background:var(--pink-600);color:#fff;border:none;padding:12px 16px;border-radius:12px;font-weight:700;cursor:pointer;
          transition:transform .05s ease, filter .15s ease;}
        .btn:hover{filter:brightness(1.02)} .btn:active{transform:translateY(1px)}
        .btn.secondary{background:transparent;color:var(--pink-700);border:2px solid var(--pink-300)}

        .status{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px dashed var(--pink-300);
          background:var(--pink-100);color:var(--pink-900);border-radius:12px;margin-top:8px;font-weight:600;}

        .kbd{display:grid;grid-template-columns:repeat(10,1fr);gap:6px;margin-top:16px;}
        .key{padding:10px 0;text-align:center;border-radius:8px;border:1px solid var(--pink-200);background:#fff;
          font-weight:700;cursor:pointer;user-select:none;color:black;}
        .key.correct{background:var(--pink-500);color:#fff;border-color:var(--pink-500)}
        .key.present{background:var(--pink-200);color:var(--ink-900);border-color:var(--pink-300)}
        .key.absent{background:#f5f5f7;color:var(--gray-600)}

        @media (max-width:480px){ .cell{width:44px;height:44px;font-size:18px} }
      `}</style>

      <div className="card" role="region" aria-label="Riley's Word Game">
        <div className="title">
          <span className="pill">Riley's</span>
          <h1>Word Game</h1>
        </div>
        <p className="subtitle">
          Guess the <strong>{WORD_LENGTH}</strong>-letter word in <strong>{MAX_ATTEMPTS}</strong> tries. Pink power only ✨
        </p>

        {/* Guess grid (now includes a live typing row) */}
        <div aria-live="polite">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            let letters = Array(WORD_LENGTH).fill("");
            let evals = Array(WORD_LENGTH).fill("empty");

            if (rowIdx < rows.length) {
              const row = rows[rowIdx];
              letters = row.guess.split("");
              evals = row.eval;
            } else if (rowIdx === rows.length && status === "playing") {
              const live = current.padEnd(WORD_LENGTH, " ").slice(0, WORD_LENGTH);
              letters = live.split("");
            }

            return (
              <div className="grid" key={rowIdx} aria-label={`Row ${rowIdx + 1}`}>
                {letters.map((ch, i) => (
                  <div key={i} className={`cell ${evals[i] === "empty" ? "" : evals[i]}`} aria-label={ch || "empty"}>
                    {ch}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="controls">
          <input
            ref={inputRef}
            className="input"
            aria-label="Type your guess"
            placeholder="Type 5 letters"
            value={current}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
              setCurrent(v.slice(0, WORD_LENGTH));
            }}
            onKeyDown={onKeyDown}
            disabled={status !== "playing"}
          />
          <button className="btn" onClick={submitGuess} disabled={status !== "playing"}>Guess</button>
          <button className="btn secondary" onClick={resetGame}>New Game</button>
        </div>

        {/* Status */}
        {status !== "playing" && (
          <div className="status" role="status">
            {status === "won" ? (
              <>
                <span>💖</span>
                <span>You nailed it! The word was <strong>{answer}</strong>.</span>
              </>
            ) : (
              <>
                <span>🫣</span>
                <span>Out of tries. The word was <strong>{answer}</strong>.</span>
              </>
            )}
          </div>
        )}

        {/* On-screen keyboard (now clickable) */}
        <Keyboard keyboardHints={keyboardHints} onKey={handleKey} />

        <p className="subtitle" style={{ marginTop: 16 }}>
          Tip: Press <b>Enter</b> to submit. Use ⌫ for backspace.
        </p>
      </div>
    </div>
  );
}

function Keyboard({ keyboardHints, onKey }) {
  const rows = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"],
  ];

  return (
    <div className="kbd">
      {rows.flat().map((key, idx) => {
        const hint = keyboardHints[key] || keyboardHints[key?.slice(0,1)];
        const label = key === "BACKSPACE" ? "⌫" : key === "ENTER" ? "Enter" : key;
        return (
          <button
            key={idx}
            type="button"
            className={`key ${hint || ''}`}
            onClick={() => onKey && onKey(key)}
            aria-label={key}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
