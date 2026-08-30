import { AlertTriangle, CheckCircle2, Music2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/shared/PageHeader";
import { DEMO_CAPTURE_IMAGE, saveDemoRecentWork } from "@/lib/grading-demo";
import {
  DetectedNote,
  HarmonyVoice,
  midiToNoteName,
  readManualCorrections,
} from "@/lib/manual-correction";

const SCORE_WIDTH = 2048;
const SCORE_HEIGHT = 840;
const VOICE_ORDER: HarmonyVoice[] = ["S", "A", "T", "B"];
const VOICE_NAMES: Record<HarmonyVoice, string> = {
  S: "Soprano",
  A: "Alto",
  T: "Tenor",
  B: "Bass",
};

const getVisualVoice = (note: DetectedNote, notes: DetectedNote[]) => {
  const notesAtSameBeat = notes
    .filter((item) => item.measure === note.measure && item.beat === note.beat)
    .sort((first, second) => first.y - second.y);
  const verticalIndex = notesAtSameBeat.findIndex((item) => item.id === note.id);

  return VOICE_ORDER[verticalIndex] ?? note.voice;
};

interface RecognizedBeat {
  id: string;
  measure: number;
  beat: number;
  notes: DetectedNote[];
  confidence: number;
}

const groupRecognizedBeats = (notes: DetectedNote[]): RecognizedBeat[] => {
  const groups = new Map<string, DetectedNote[]>();

  notes.forEach((note) => {
    const key = `${note.measure}-${note.beat}`;
    groups.set(key, [...(groups.get(key) ?? []), note]);
  });

  return [...groups.entries()]
    .map(([id, beatNotes]) => ({
      id,
      measure: beatNotes[0].measure,
      beat: beatNotes[0].beat,
      notes: [...beatNotes].sort(
        (first, second) => VOICE_ORDER.indexOf(first.voice) - VOICE_ORDER.indexOf(second.voice)
      ),
      confidence:
        beatNotes.reduce((total, note) => total + note.confidence, 0) / beatNotes.length,
    }))
    .sort((first, second) => first.measure - second.measure || first.beat - second.beat);
};

const B4RecognitionResult = () => {
  const navigate = useNavigate();
  const [recognizedNotes] = useState(() => readManualCorrections());
  const beats = useMemo(() => groupRecognizedBeats(recognizedNotes), [recognizedNotes]);
  const [selectedBeatId, setSelectedBeatId] = useState(beats[0]?.id ?? "");
  const selectedBeat = beats.find((beat) => beat.id === selectedBeatId) ?? beats[0];
  const lowConfidenceCount = recognizedNotes.filter((note) => note.confidence < 0.8).length;
  const overallConfidence = Math.round(
    (recognizedNotes.reduce((total, note) => total + note.confidence, 0) /
      Math.max(recognizedNotes.length, 1)) *
      100
  );

  useEffect(() => {
    saveDemoRecentWork();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-40">
      <PageHeader title="確認辨識音符" showBack />

      <main className="space-y-4 px-4 pt-4">
        <section className="rounded-[2rem] border border-border bg-card p-4 shadow-elevated">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">
                Recognition Check
              </p>
              <h1 className="mt-1 text-lg font-display font-semibold">
                已辨識 {recognizedNotes.length} 個音符，請先確認
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                下方是 AI 從譜面讀到的 SATB 音名。這一步只確認辨識結果，確認後才會開始檢查平行五度等和聲規則。
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-primary/15 bg-primary/8 px-3 py-2 text-right">
              <p className="text-[11px] text-primary/70">平均信心度</p>
              <p className="mt-1 text-lg font-semibold text-primary">{overallConfidence}%</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-background px-3 py-3">
              <p className="text-[11px] text-muted-foreground">辨識位置</p>
              <p className="mt-1 text-lg font-semibold">{beats.length} 拍</p>
            </div>
            <div className="rounded-2xl bg-background px-3 py-3">
              <p className="text-[11px] text-muted-foreground">建議優先核對</p>
              <p className="mt-1 text-lg font-semibold text-amber-600">{lowConfidenceCount} 音</p>
            </div>
          </div>
        </section>

        {selectedBeat && (
          <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">原始譜面定位</p>
                <p className="text-xs text-muted-foreground">
                  第 {selectedBeat.measure} 小節・第 {selectedBeat.beat} 拍
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {Math.round(selectedBeat.confidence * 100)}%
              </span>
            </div>

            <div className="overflow-x-auto bg-[#f8f5ee] p-2">
              <div className="min-w-[680px]">
                <svg
                  viewBox={`0 0 ${SCORE_WIDTH} ${SCORE_HEIGHT}`}
                  className="h-auto w-full rounded-xl bg-white"
                  aria-labelledby="recognition-score-title"
                >
                  <title id="recognition-score-title">AI 辨識音符在原始四部和聲譜面的定位</title>
                  <image
                    href={DEMO_CAPTURE_IMAGE}
                    x="0"
                    y="0"
                    width={SCORE_WIDTH}
                    height={SCORE_HEIGHT}
                    preserveAspectRatio="xMidYMid meet"
                  />

                  <rect
                    x={Math.max(0, selectedBeat.notes[0].x - 55)}
                    y="245"
                    width="110"
                    height="400"
                    rx="20"
                    fill="rgba(14,165,233,0.08)"
                    stroke="#0ea5e9"
                    strokeWidth="4"
                    strokeDasharray="12 8"
                  />

                  {recognizedNotes.map((note) => {
                    const isSelected = selectedBeat.notes.some((item) => item.id === note.id);
                    const isLowConfidence = note.confidence < 0.8;
                    const visualVoice = getVisualVoice(note, recognizedNotes);

                    return (
                      <g
                        key={note.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`第 ${note.measure} 小節第 ${note.beat} 拍，${visualVoice} ${midiToNoteName(note.midi)}`}
                        onClick={() => setSelectedBeatId(`${note.measure}-${note.beat}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedBeatId(`${note.measure}-${note.beat}`);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <circle cx={note.x} cy={note.y} r="31" fill="transparent" />
                        <circle
                          cx={note.x}
                          cy={note.y}
                          r={isSelected ? 18 : 13}
                          fill={isSelected ? "#0284c7" : "#ffffff"}
                          stroke={isLowConfidence ? "#d97706" : isSelected ? "#0369a1" : "#64748b"}
                          strokeWidth={isLowConfidence ? 5 : 3}
                          strokeDasharray={isLowConfidence ? "7 4" : undefined}
                        />
                        <text
                          x={note.x}
                          y={note.y + 6}
                          textAnchor="middle"
                          fontSize="16"
                          fontWeight="700"
                          fill={isSelected ? "#ffffff" : "#334155"}
                        >
                          {visualVoice}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </section>
        )}

        <section aria-label="AI 辨識音符列表" className="rounded-[2rem] border border-border bg-card p-3 shadow-card">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-sm font-semibold">AI 辨識到的音</p>
              <p className="mt-0.5 text-xs text-muted-foreground">點選任一拍，可在上方譜面定位</p>
            </div>
            <Music2 size={18} className="text-primary" />
          </div>

          <div data-testid="recognized-beat-list" className="space-y-2">
            {beats.map((recognizedBeat) => {
              const isSelected = recognizedBeat.id === selectedBeat?.id;
              const hasLowConfidenceNote = recognizedBeat.notes.some((note) => note.confidence < 0.8);

              return (
                <button
                  key={recognizedBeat.id}
                  type="button"
                  onClick={() => setSelectedBeatId(recognizedBeat.id)}
                  aria-pressed={isSelected}
                  aria-label={`第 ${recognizedBeat.measure} 小節第 ${recognizedBeat.beat} 拍辨識音符`}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        第 {recognizedBeat.measure} 小節・第 {recognizedBeat.beat} 拍
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        辨識信心度 {Math.round(recognizedBeat.confidence * 100)}%
                      </p>
                    </div>
                    {hasLowConfidenceNote ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800">
                        <AlertTriangle size={12} /> 請核對
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 size={13} /> 清楚
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {VOICE_ORDER.map((voice) => {
                      const voiceNotes = recognizedBeat.notes.filter((item) => item.voice === voice);
                      const hasLowConfidence = voiceNotes.some((note) => note.confidence < 0.8);
                      const hasMultipleNotes = voiceNotes.length > 1;

                      return (
                        <div
                          key={voice}
                          className={`rounded-xl border px-2.5 py-2 ${
                            hasLowConfidence || hasMultipleNotes
                              ? "border-amber-200 bg-amber-50"
                              : "border-border/70 bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {voice} · {VOICE_NAMES[voice]}
                            </span>
                            {(hasLowConfidence || hasMultipleNotes) && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <p className="mt-1 text-base font-semibold">
                            {voiceNotes.length > 0
                              ? voiceNotes.map((note) => midiToNoteName(note.midi)).join(" / ")
                              : "—"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {hasMultipleNotes
                              ? `${voiceNotes.length} 個音，請確認聲部`
                              : voiceNotes[0]
                                ? `MIDI ${voiceNotes[0].midi}`
                                : "未辨識"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950">
          <p className="text-sm font-medium">請確認的是「音符辨識」，不是作答是否正確</p>
          <p className="mt-1 text-xs leading-relaxed text-sky-900/75">
            如果音名與譜面一致，選擇開始分析；若 AI 讀錯音高或聲部，再進入手動修正。
          </p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-lg gap-3">
          <button
            type="button"
            onClick={() => navigate("/grading/correct")}
            className="h-11 flex-1 rounded-xl border border-border bg-card text-sm font-medium"
          >
            辨識有誤，手動修正
          </button>
          <button
            type="button"
            onClick={() => navigate("/grading/analysis")}
            className="h-11 flex-[1.2] rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-soft"
          >
            音符正確，開始分析
          </button>
        </div>
      </div>
    </div>
  );
};

export default B4RecognitionResult;
