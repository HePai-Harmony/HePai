import {
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/shared/PageHeader";
import { DEMO_CAPTURE_IMAGE } from "@/lib/grading-demo";
import {
  DetectedNote,
  HarmonyVoice,
  midiToNoteName,
  readManualCorrections,
  resetManualCorrections,
  saveManualCorrections,
} from "@/lib/manual-correction";

const VOICES: Array<{ id: HarmonyVoice; label: string }> = [
  { id: "S", label: "Soprano" },
  { id: "A", label: "Alto" },
  { id: "T", label: "Tenor" },
  { id: "B", label: "Bass" },
];

const cloneNotes = (notes: DetectedNote[]) => notes.map((note) => ({ ...note }));

const B5ManualCorrect = () => {
  const navigate = useNavigate();
  const initialNotes = useMemo(() => readManualCorrections(), []);
  const [history, setHistory] = useState<DetectedNote[][]>([initialNotes]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(
    initialNotes.find((note) => note.confidence < 0.8)?.id ?? initialNotes[0]?.id
  );
  const [savedAt, setSavedAt] = useState("已載入辨識結果");

  const notes = useMemo(
    () => history[historyIndex] ?? [],
    [history, historyIndex]
  );
  const selectedNote = notes.find((note) => note.id === selectedId) ?? notes[0];
  const lowConfidenceNotes = notes.filter((note) => note.confidence < 0.8);

  useEffect(() => {
    saveManualCorrections(notes);
  }, [notes]);

  const commit = (nextNotes: DetectedNote[]) => {
    const nextHistory = [...history.slice(0, historyIndex + 1), cloneNotes(nextNotes)];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setSavedAt("已自動儲存");
  };

  const updateSelected = (patch: Partial<DetectedNote>) => {
    if (!selectedNote) return;
    commit(notes.map((note) => (note.id === selectedNote.id ? { ...note, ...patch } : note)));
  };

  const deleteSelected = () => {
    if (!selectedNote || notes.length <= 1) return;
    const next = notes.filter((note) => note.id !== selectedNote.id);
    commit(next);
    setSelectedId(next[0]?.id);
  };

  const undo = () => {
    if (historyIndex === 0) return;
    setHistoryIndex(historyIndex - 1);
    setSavedAt("已自動儲存");
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    setSavedAt("已自動儲存");
  };

  const reset = () => {
    const restored = resetManualCorrections();
    setHistory([restored]);
    setHistoryIndex(0);
    setSelectedId(restored.find((note) => note.confidence < 0.8)?.id ?? restored[0]?.id);
    setSavedAt("已還原原始辨識結果");
  };

  const finish = () => {
    saveManualCorrections(notes);
    navigate("/grading/analysis");
  };

  return (
    <div className="min-h-screen bg-background pb-36">
      <PageHeader
        title="手動校正辨識結果"
        showBack
        right={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex === 0}
              aria-label="復原"
              className="rounded-lg p-2 text-muted-foreground disabled:opacity-30"
            >
              <Undo2 size={18} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              aria-label="重做"
              className="rounded-lg p-2 text-muted-foreground disabled:opacity-30"
            >
              <Redo2 size={18} />
            </button>
          </div>
        }
      />

      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-950">
                優先確認 {lowConfidenceNotes.length} 個低信心音符
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/75">
                點選譜面上的標記，再修正聲部或音高。修改只會更新辨識資料，不會改動原始照片。
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-amber-800">{savedAt}</span>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">辨識譜面</p>
              <p className="text-xs text-muted-foreground">橘色虛線＝低信心；藍色實線＝目前選取</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground"
            >
              <RotateCcw size={14} /> 還原辨識結果
            </button>
          </div>

          <div className="overflow-x-auto bg-[#f8f5ee] p-2 sm:p-4">
            <div className="min-w-[720px]">
              <svg
                viewBox="0 0 2048 840"
                role="img"
                aria-labelledby="manual-correction-score-title"
                className="h-auto w-full rounded-xl bg-white shadow-sm"
              >
                <title id="manual-correction-score-title">可手動校正的四部和聲辨識譜面</title>
                <image
                  href={DEMO_CAPTURE_IMAGE}
                  width="2048"
                  height="840"
                  preserveAspectRatio="xMidYMid meet"
                />
                {notes.map((note) => {
                  const isSelected = note.id === selectedNote?.id;
                  const isLowConfidence = note.confidence < 0.8;
                  const label = `選取第 ${note.measure} 小節第 ${note.beat} 拍，${note.voice} 聲部 ${midiToNoteName(note.midi)}，信心度 ${Math.round(note.confidence * 100)}%`;

                  return (
                    <g
                      key={note.id}
                      role="button"
                      tabIndex={0}
                      aria-label={label}
                      onClick={() => setSelectedId(note.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(note.id);
                        }
                      }}
                      className="cursor-pointer outline-none"
                    >
                      <circle cx={note.x} cy={note.y} r="34" fill="transparent" />
                      <circle
                        cx={note.x}
                        cy={note.y}
                        r={isSelected ? 21 : 17}
                        fill={isSelected ? "#2563eb" : isLowConfidence ? "#fffbeb" : "#ffffff"}
                        stroke={isSelected ? "#1d4ed8" : isLowConfidence ? "#d97706" : "#64748b"}
                        strokeWidth={isSelected ? 6 : 4}
                        strokeDasharray={isLowConfidence && !isSelected ? "8 5" : undefined}
                      />
                      <text
                        x={note.x}
                        y={note.y + 7}
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="700"
                        fill={isSelected ? "#ffffff" : isLowConfidence ? "#92400e" : "#334155"}
                      >
                        {note.voice}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {lowConfidenceNotes.length > 0 && (
          <section aria-label="低信心音符" className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">待確認</p>
              <p className="text-xs text-muted-foreground">信心度低於 80%</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {lowConfidenceNotes.map((note) => (
                <button
                  type="button"
                  key={note.id}
                  onClick={() => setSelectedId(note.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${
                    selectedNote?.id === note.id
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-amber-200 bg-amber-50 text-amber-950"
                  }`}
                >
                  <span className="block text-xs font-semibold">
                    第 {note.measure} 小節・第 {note.beat} 拍・{note.voice}
                  </span>
                  <span className="mt-0.5 block text-[11px] opacity-70">
                    {midiToNoteName(note.midi)} · {Math.round(note.confidence * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedNote && (
          <section data-testid="note-editor" className="rounded-[2rem] border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary/70">Selected Note</p>
                <h2 className="mt-1 text-lg font-semibold">
                  第 {selectedNote.measure} 小節・第 {selectedNote.beat} 拍
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {selectedNote.confidence < 0.8 ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    低信心 {Math.round(selectedNote.confidence * 100)}%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={13} /> {Math.round(selectedNote.confidence * 100)}%
                  </span>
                )}
                <button
                  type="button"
                  onClick={deleteSelected}
                  aria-label="刪除選取音符"
                  className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>

            <div className="grid gap-5 pt-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">聲部</p>
                <div className="grid grid-cols-2 gap-2">
                  {VOICES.map((voice) => (
                    <button
                      type="button"
                      key={voice.id}
                      onClick={() => updateSelected({ voice: voice.id })}
                      aria-label={`${voice.id} ${voice.label}`}
                      aria-pressed={selectedNote.voice === voice.id}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        selectedNote.voice === voice.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      <span className="text-sm font-semibold">{voice.id}</span>
                      <span className="ml-2 text-xs opacity-75">{voice.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">MIDI 音高</p>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
                  <button
                    type="button"
                    onClick={() => updateSelected({ midi: Math.max(21, selectedNote.midi - 1) })}
                    aria-label="音高降半音"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="min-w-0 flex-1 text-center" aria-live="polite">
                    <p data-testid="selected-note-name" className="text-xl font-semibold">
                      {midiToNoteName(selectedNote.midi)}
                    </p>
                    <p className="text-xs text-muted-foreground">MIDI {selectedNote.midi}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSelected({ midi: Math.min(108, selectedNote.midi + 1) })}
                    aria-label="音高升半音"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  目前先以半音為單位調整；下一版可加入直接點五線譜拖曳音符。
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl gap-3">
          <button
            type="button"
            onClick={() => navigate("/grading/recognition")}
            className="h-11 flex-1 rounded-xl border border-border bg-card text-sm font-medium"
          >
            返回辨識結果
          </button>
          <button
            type="button"
            onClick={finish}
            className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-soft"
          >
            <Save size={16} /> 儲存並繼續分析
          </button>
        </div>
      </div>
    </div>
  );
};

export default B5ManualCorrect;
