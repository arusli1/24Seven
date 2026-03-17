'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle } from '@/lib/types';
import { Rational } from '@/lib/rational';
import { getDailyPuzzle, getDailyNumber, formatDailyDate } from '@/lib/daily';
import { solvePuzzle } from '@/lib/solver';

type Operator = '+' | '-' | '*' | '/';

const OPS: { op: Operator; sym: string }[] = [
  { op: '+', sym: '+' },
  { op: '-', sym: '−' },
  { op: '*', sym: '×' },
  { op: '/', sym: '÷' },
];

const OP_SYM: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

interface CardState {
  id: string;
  value: Rational;
  label: string;
  expr: string;
}

interface DailyRecord {
  date: string;
  solved: boolean;
  peeked: boolean;
  elapsedSec: number;
  expr: string;
}

const TARGET = new Rational(24, 1);
const STORAGE_KEY = 'game24-daily-v1';

function makeCards(ns: number[]): CardState[] {
  return ns.map((n, i) => ({
    id: `${n}-${i}-${Math.random().toString(36).slice(2)}`,
    value: Rational.fromInteger(n),
    label: n.toString(),
    expr: n.toString(),
  }));
}

function combine(a: Rational, b: Rational, op: Operator): Rational {
  switch (op) {
    case '+': return a.add(b);
    case '-': return a.sub(b);
    case '*': return a.mul(b);
    case '/': return a.div(b);
  }
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function loadRecord(): DailyRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const rec: DailyRecord = JSON.parse(raw);
    if (rec.date !== todayKey()) return null;
    return rec;
  } catch {
    return null;
  }
}

function saveRecord(rec: DailyRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
  } catch {}
}

export function DailyGame({ puzzles }: { puzzles: Puzzle[] }) {
  const puzzle = getDailyPuzzle(puzzles);
  const dailyNum = getDailyNumber();
  const dailyDate = formatDailyDate();

  const [cards, setCards] = useState<CardState[]>(() => makeCards(puzzle.numbers));
  const [hist, setHist] = useState<CardState[][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [op, setOp] = useState<Operator | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const peekedRef = useRef(false);
  const solvedFiredRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef<number>(Date.now());

  // Load persisted record on mount
  useEffect(() => {
    const rec = loadRecord();
    if (rec) {
      setRecord(rec);
      setElapsedSec(rec.elapsedSec);
    } else {
      // Start timer
      startRef.current = Date.now();
      timerRef.current = setInterval(
        () => setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000)),
        1000
      );
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (showSolution) peekedRef.current = true;
  }, [showSolution]);

  const solved = cards.length === 1 && cards[0].value.equals(TARGET);

  useEffect(() => {
    if (!solved || solvedFiredRef.current || record) return;
    solvedFiredRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const rec: DailyRecord = {
      date: todayKey(),
      solved: true,
      peeked: peekedRef.current,
      elapsedSec,
      expr: cards[0].expr,
    };
    saveRecord(rec);
    setRecord(rec);
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const solutionExpr = puzzle.solutions?.[0] ?? solvePuzzle(puzzle.numbers)?.expression;

  const onCard = (id: string) => {
    if (record) return;
    if (!op) { setSel(id); return; }
    if (!sel || sel === id) { setSel(id); return; }
    const a = cards.find((c) => c.id === sel)!;
    const b = cards.find((c) => c.id === id)!;
    try {
      const v = combine(a.value, b.value, op);
      setHist((h) => [...h, cards]);
      const newCard = {
        id: `${Date.now()}`,
        value: v,
        label: v.toString(),
        expr: `(${a.expr} ${OP_SYM[op]} ${b.expr})`,
      };
      setCards(cards.filter((c) => c.id !== sel && c.id !== id).concat(newCard));
      setSel(newCard.id);
      setOp(null);
    } catch {
      setOp(null);
      setSel(null);
    }
  };

  const undo = () => {
    if (hist.length === 0 || record) return;
    const prev = hist[hist.length - 1];
    setHist(hist.slice(0, -1));
    setCards(prev);
    setSel(null);
    setOp(null);
  };

  const share = async () => {
    if (!record) return;
    const min = Math.floor(record.elapsedSec / 60);
    const sec = String(record.elapsedSec % 60).padStart(2, '0');
    const timeStr = `${min}:${sec}`;
    const hint = record.peeked ? ' (with hint) 👀' : ' 🎉';
    const text = `24 Game — Daily #${dailyNum}\nSolved in ${timeStr}${hint}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="game24-game-inner">
      <div className="game24-daily-header">
        <span className="game24-daily-num">Daily #{dailyNum}</span>
        <span className="game24-daily-date">{dailyDate}</span>
      </div>

      <div className="game24-stats">
        <span className="game24-solve-rate">
          {puzzle.solveRate != null ? `${(puzzle.solveRate * 100).toFixed(1)}% solve rate` : 'Solve rate N/A'}
        </span>
        <span className="game24-timer">{fmtTime(elapsedSec)}</span>
      </div>

      {!record && (
        <div className="game24-actions">
          <button
            onClick={() => setShowSolution((s) => !s)}
            className="game24-btn game24-btn-secondary"
          >
            {showSolution ? 'Hide' : 'Hint'}
          </button>
          <button
            onClick={undo}
            disabled={hist.length === 0}
            className="game24-btn game24-btn-secondary"
          >
            Undo
          </button>
        </div>
      )}

      {showSolution && solutionExpr && !record && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="game24-solution"
        >
          {solutionExpr.replace(/\*/g, '×').replace(/\//g, '÷')}
        </motion.p>
      )}

      {record ? (
        <div className="game24-daily-solved">
          <div className="game24-daily-solved-emoji">🎉</div>
          <div className="game24-daily-solved-label">Daily solved!</div>
          <div className="game24-daily-solved-expr">
            {record.expr.replace(/\*/g, '×').replace(/\//g, '÷')}
          </div>
          <div className="game24-daily-solved-time">
            {fmtTime(record.elapsedSec)}{record.peeked ? ' · used hint' : ''}
          </div>
          <button onClick={share} className="game24-btn game24-btn-primary game24-daily-share-btn">
            {copied ? 'Copied!' : 'Share result'}
          </button>
        </div>
      ) : (
        <>
          <div className="game24-grid">
            <AnimatePresence mode="popLayout">
              {cards.map((c) => (
                <motion.button
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => onCard(c.id)}
                  className={`game24-num-card ${sel === c.id ? 'selected' : ''} ${solved && cards[0].id === c.id ? 'solved' : ''}`}
                >
                  {c.value.denominator === 1 ? (
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.value.numerator}</span>
                  ) : (
                    <span className="game24-fraction">
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.value.numerator}</span>
                      <span className="game24-fraction-bar" />
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.value.denominator}</span>
                    </span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="game24-ops">
            {OPS.map(({ op: o, sym }) => (
              <button
                key={o}
                onClick={() => sel && setOp(o)}
                className={`game24-op ${op === o ? 'selected' : ''}`}
              >
                {sym}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
