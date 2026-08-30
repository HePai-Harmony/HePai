import {
  AlertTriangle,
  Gauge,
  Headphones,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildPlaybackBeats,
  countRevisedNotes,
  filterPlaybackBeats,
  filterPlaybackNotes,
  getBeatDurationSeconds,
  midiToFrequency,
  PlaybackVersion,
  PlaybackVoice,
} from "@/lib/harmony-playback";
import { DEMO_CAPTURE_IMAGE } from "@/lib/grading-demo";
import { midiToNoteName, readManualCorrections } from "@/lib/manual-correction";

const VOICES: Array<{ id: PlaybackVoice; label: string; detail: string }> = [
  { id: "all", label: "全部", detail: "SATB" },
  { id: "S", label: "S", detail: "女高音" },
  { id: "A", label: "A", detail: "女低音" },
  { id: "T", label: "T", detail: "男高音" },
  { id: "B", label: "B", detail: "男低音" },
];

const OSCILLATOR_TYPES: Record<Exclude<PlaybackVoice, "all">, OscillatorType> = {
  S: "sine",
  A: "triangle",
  T: "sine",
  B: "triangle",
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const HarmonyPlaybackPanel = () => {
  const recognizedNotes = useMemo(() => readManualCorrections(), []);
  const originalBeats = useMemo(
    () => buildPlaybackBeats(recognizedNotes, "original"),
    [recognizedNotes]
  );
  const revisedBeats = useMemo(
    () => buildPlaybackBeats(recognizedNotes, "revised"),
    [recognizedNotes]
  );
  const [selectedVersion, setSelectedVersion] = useState<PlaybackVersion>("original");
  const [selectedVoice, setSelectedVoice] = useState<PlaybackVoice>("all");
  const [errorOnly, setErrorOnly] = useState(false);
  const [tempo, setTempo] = useState(88);
  const [playingVersion, setPlayingVersion] = useState<PlaybackVersion | null>(null);
  const [currentBeatId, setCurrentBeatId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState("");
  const contextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const timersRef = useRef<number[]>([]);

  const stopPlayback = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    oscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // An oscillator that already ended does not need another stop call.
      }
    });
    oscillatorsRef.current = [];
    setPlayingVersion(null);
    setCurrentBeatId(null);
  }, []);

  useEffect(() => stopPlayback, [stopPlayback]);

  const playVersion = async (version: PlaybackVersion) => {
    if (playingVersion === version) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setSelectedVersion(version);
    setAudioError("");

    const AudioContextConstructor =
      window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) {
      setAudioError("這個瀏覽器不支援聲音播放，請改用 Chrome 或 Safari。");
      return;
    }

    const context = contextRef.current ?? new AudioContextConstructor();
    contextRef.current = context;
    if (context.state === "suspended") await context.resume();

    const sourceBeats = version === "original" ? originalBeats : revisedBeats;
    const beats = filterPlaybackBeats(sourceBeats, errorOnly);
    const beatDuration = getBeatDurationSeconds(tempo);
    const startAt = context.currentTime + 0.06;

    beats.forEach((beat, index) => {
      const beatStart = startAt + index * beatDuration;
      const beatEnd = beatStart + beatDuration * 0.9;
      const audibleNotes = filterPlaybackNotes(beat, selectedVoice);
      const peakGain = Math.min(0.075, 0.24 / Math.max(audibleNotes.length, 1));

      audibleNotes.forEach((note) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = OSCILLATOR_TYPES[note.voice];
        oscillator.frequency.setValueAtTime(midiToFrequency(note.midi), beatStart);
        gain.gain.setValueAtTime(0.0001, beatStart);
        gain.gain.exponentialRampToValueAtTime(peakGain, beatStart + 0.025);
        gain.gain.setValueAtTime(peakGain, Math.max(beatStart + 0.03, beatEnd - 0.08));
        gain.gain.exponentialRampToValueAtTime(0.0001, beatEnd);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(beatStart);
        oscillator.stop(beatEnd + 0.02);
        oscillatorsRef.current.push(oscillator);
      });

      timersRef.current.push(
        window.setTimeout(() => setCurrentBeatId(beat.id), index * beatDuration * 1000)
      );
    });

    timersRef.current.push(
      window.setTimeout(() => {
        setPlayingVersion(null);
        setCurrentBeatId(null);
        oscillatorsRef.current = [];
      }, beats.length * beatDuration * 1000 + 120)
    );
    setPlayingVersion(version);
  };

  const updateVoice = (voice: PlaybackVoice) => {
    stopPlayback();
    setSelectedVoice(voice);
  };

  const updateErrorOnly = () => {
    stopPlayback();
    setErrorOnly((current) => !current);
  };

  const updateTempo = (nextTempo: number) => {
    stopPlayback();
    setTempo(nextTempo);
  };

  const visibleBeats = filterPlaybackBeats(
    selectedVersion === "original" ? originalBeats : revisedBeats,
    errorOnly
  );
  const revisedCount = countRevisedNotes(revisedBeats);
  const selectedBeats = selectedVersion === "original" ? originalBeats : revisedBeats;
  const activeBeat = selectedBeats.find((beat) => beat.id === currentBeatId);
  const activeBeatX = activeBeat
    ? activeBeat.notes.reduce((total, note) => total + note.x, 0) / activeBeat.notes.length
    : null;
  const revisedNotes = revisedBeats.flatMap((beat) => beat.notes.filter((note) => note.revised));

  return (
    <section
      aria-label="四部和聲聲音播放"
      className="rounded-[2rem] border border-border bg-card p-4 shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">Audio Compare</p>
          <h2 className="mt-1 flex items-center gap-2 text-base font-semibold">
            <Headphones size={18} className="text-primary" /> 聽出修改前後的差異
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            可比較整體和聲、獨聽任一聲部，或只重播發生錯誤的兩拍。
          </p>
        </div>
        <Volume2 size={20} className="mt-1 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-[#f8f5ee]">
        <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2.5">
          <div>
            <p className="text-sm font-semibold">原始譜例</p>
            <p className="text-[11px] text-muted-foreground">
              {selectedVersion === "original" ? "播放辨識後的原始作答" : "原譜上標示 AI 建議改寫音"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => playVersion(selectedVersion)}
            aria-label={`${playingVersion === selectedVersion ? "停止播放" : "播放"}${
              selectedVersion === "original" ? "原始譜例" : "修正版譜例"
            }`}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-soft"
          >
            {playingVersion === selectedVersion ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
            {playingVersion === selectedVersion ? "停止" : "播放譜例"}
          </button>
        </div>

        <svg
          viewBox="0 0 2048 840"
          className="h-auto w-full bg-white"
          aria-labelledby="playback-score-title"
        >
          <title id="playback-score-title">可播放的原始四部和聲譜例</title>
          <image
            href={DEMO_CAPTURE_IMAGE}
            x="0"
            y="0"
            width="2048"
            height="840"
            preserveAspectRatio="xMidYMid meet"
          />

          {activeBeatX !== null && (
            <rect
              x={activeBeatX - 48}
              y="245"
              width="96"
              height="410"
              rx="18"
              fill="rgba(14,165,233,0.14)"
              stroke="#0284c7"
              strokeWidth="5"
            />
          )}

          {selectedVersion === "revised" &&
            revisedNotes.map((note) => (
              <g key={note.id} aria-label={`${note.voice} 改為 ${midiToNoteName(note.midi)}`}>
                <circle
                  cx={note.x}
                  cy={note.y}
                  r="24"
                  fill="rgba(5,150,105,0.18)"
                  stroke="#059669"
                  strokeWidth="5"
                />
                <g transform={`translate(${note.x - 31}, ${note.y - 58})`}>
                  <rect width="76" height="29" rx="14" fill="#047857" />
                  <text
                    x="38"
                    y="20"
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="700"
                    fill="#ffffff"
                  >
                    {note.voice} {midiToNoteName(note.midi)}
                  </text>
                </g>
              </g>
            ))}
        </svg>

        <div className="flex items-center justify-between bg-card px-3 py-2 text-[11px] text-muted-foreground">
          <span>{activeBeat ? `播放中：第 ${activeBeat.measure} 小節・第 ${activeBeat.beat} 拍` : "點播放後，藍框會跟著拍點移動"}</span>
          {selectedVersion === "revised" && (
            <span className="font-medium text-emerald-700">綠色＝改寫音</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["original", "revised"] as PlaybackVersion[]).map((version) => {
          const isPlaying = playingVersion === version;
          const isSelected = selectedVersion === version;
          const isRevised = version === "revised";

          return (
            <button
              key={version}
              type="button"
              onClick={() => playVersion(version)}
              aria-label={`${isPlaying ? "停止" : "播放"}${isRevised ? "修正版" : "原始版本"}`}
              className={`rounded-2xl border p-3 text-left transition-all ${
                isSelected
                  ? isRevised
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-primary/30 bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{isRevised ? "修正版" : "原始版本"}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {isRevised ? `${revisedCount} 個音已調整` : "學生原始作答"}
                  </p>
                </div>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isRevised ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">播放聲部</p>
          <p className="text-[11px] text-muted-foreground">
            {VOICES.find((voice) => voice.id === selectedVoice)?.detail}
          </p>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {VOICES.map((voice) => (
            <button
              key={voice.id}
              type="button"
              onClick={() => updateVoice(voice.id)}
              aria-pressed={selectedVoice === voice.id}
              aria-label={`播放聲部 ${voice.label}`}
              className={`rounded-xl border py-2 text-xs font-semibold transition-colors ${
                selectedVoice === voice.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {voice.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={updateErrorOnly}
        aria-pressed={errorOnly}
        className={`mt-4 flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors ${
          errorOnly ? "border-amber-300 bg-amber-50" : "border-border bg-background"
        }`}
      >
        <span className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          <span>
            <span className="block text-sm font-medium">只播放發生錯誤的兩拍</span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              第 2 小節，第 2 拍至第 3 拍
            </span>
          </span>
        </span>
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            errorOnly ? "bg-amber-500" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              errorOnly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </button>

      <div className="mt-4 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Gauge size={15} className="text-primary" /> 播放速度
          </p>
          <output htmlFor="harmony-tempo" className="text-sm font-semibold text-primary">
            {tempo} BPM
          </output>
        </div>
        <input
          id="harmony-tempo"
          type="range"
          min="50"
          max="140"
          step="2"
          value={tempo}
          onChange={(event) => updateTempo(Number(event.target.value))}
          aria-label="播放速度"
          className="mt-3 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>慢 50</span>
          <span>正常 88</span>
          <span>快 140</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5" aria-label="播放進度">
        {visibleBeats.map((beat) => (
          <span
            key={beat.id}
            className={`h-2 flex-1 rounded-full transition-colors ${
              currentBeatId === beat.id
                ? "bg-primary"
                : playingVersion
                  ? "bg-primary/20"
                  : "bg-muted"
            }`}
            title={`第 ${beat.measure} 小節第 ${beat.beat} 拍`}
          />
        ))}
      </div>
      <p aria-live="polite" className="mt-2 min-h-4 text-center text-[11px] text-muted-foreground">
        {audioError ||
          (playingVersion
            ? `正在播放${playingVersion === "original" ? "原始版本" : "修正版"} · ${
                selectedVoice === "all" ? "SATB 全部聲部" : `${selectedVoice} 聲部`
              }`
            : `準備播放 · ${errorOnly ? "錯誤兩拍" : `全段 ${visibleBeats.length} 拍`}`)}
      </p>
    </section>
  );
};

export default HarmonyPlaybackPanel;
