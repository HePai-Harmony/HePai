export type HarmonyVoice = "S" | "A" | "T" | "B";

export interface DetectedNote {
  id: string;
  measure: number;
  beat: number;
  voice: HarmonyVoice;
  midi: number;
  confidence: number;
  x: number;
  y: number;
}

const MANUAL_CORRECTION_STORAGE_KEY = "hepai_manual_corrections_v3";

export const DEFAULT_DETECTED_NOTES: DetectedNote[] = [
  { id: "m2b1-s", measure: 2, beat: 1, voice: "S", midi: 62, confidence: 0.97, x: 846, y: 320 },
  { id: "m2b1-a", measure: 2, beat: 1, voice: "A", midi: 59, confidence: 0.94, x: 846, y: 391 },
  { id: "m2b1-t", measure: 2, beat: 1, voice: "T", midi: 59, confidence: 0.93, x: 846, y: 507 },
  { id: "m2b1-b", measure: 2, beat: 1, voice: "B", midi: 44, confidence: 0.96, x: 846, y: 590 },
  { id: "m2b2-s", measure: 2, beat: 2, voice: "S", midi: 64, confidence: 0.96, x: 968, y: 303 },
  { id: "m2b2-a", measure: 2, beat: 2, voice: "A", midi: 61, confidence: 0.94, x: 968, y: 382 },
  { id: "m2b2-t", measure: 2, beat: 2, voice: "T", midi: 57, confidence: 0.95, x: 968, y: 498 },
  { id: "m2b2-b", measure: 2, beat: 2, voice: "B", midi: 45, confidence: 0.96, x: 968, y: 579 },
  { id: "m2b3-s", measure: 2, beat: 3, voice: "S", midi: 66, confidence: 0.95, x: 1089, y: 286 },
  { id: "m2b3-a", measure: 2, beat: 3, voice: "A", midi: 62, confidence: 0.93, x: 1089, y: 371 },
  { id: "m2b3-t", measure: 2, beat: 3, voice: "T", midi: 57, confidence: 0.68, x: 1089, y: 490 },
  { id: "m2b3-b", measure: 2, beat: 3, voice: "B", midi: 50, confidence: 0.96, x: 1089, y: 568 },
];

const cloneDefaultNotes = () => DEFAULT_DETECTED_NOTES.map((note) => ({ ...note }));

const canUseStorage = () =>
  typeof window !== "undefined" &&
  typeof window.localStorage?.getItem === "function" &&
  typeof window.localStorage?.setItem === "function";

const isHarmonyVoice = (value: unknown): value is HarmonyVoice =>
  value === "S" || value === "A" || value === "T" || value === "B";

const isDetectedNote = (value: unknown): value is DetectedNote => {
  if (!value || typeof value !== "object") return false;

  const note = value as Record<string, unknown>;
  return (
    typeof note.id === "string" &&
    typeof note.measure === "number" &&
    typeof note.beat === "number" &&
    isHarmonyVoice(note.voice) &&
    typeof note.midi === "number" &&
    note.midi >= 21 &&
    note.midi <= 108 &&
    typeof note.confidence === "number" &&
    note.confidence >= 0 &&
    note.confidence <= 1 &&
    typeof note.x === "number" &&
    typeof note.y === "number"
  );
};

export const midiToNoteName = (midi: number) => {
  const noteNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const pitch = Math.max(0, Math.min(127, Math.round(midi)));
  return `${noteNames[pitch % 12]}${Math.floor(pitch / 12) - 1}`;
};

export const readManualCorrections = (): DetectedNote[] => {
  if (!canUseStorage()) return cloneDefaultNotes();

  const raw = window.localStorage.getItem(MANUAL_CORRECTION_STORAGE_KEY);
  if (!raw) return cloneDefaultNotes();

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isDetectedNote)) return cloneDefaultNotes();
    return parsed.map((note) => ({ ...note }));
  } catch {
    return cloneDefaultNotes();
  }
};

export const saveManualCorrections = (notes: DetectedNote[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(MANUAL_CORRECTION_STORAGE_KEY, JSON.stringify(notes));
};

export const countManualCorrections = (notes: DetectedNote[]) => {
  const currentById = new Map(notes.map((note) => [note.id, note]));
  const defaultsById = new Map(DEFAULT_DETECTED_NOTES.map((note) => [note.id, note]));
  const changedDefaults = DEFAULT_DETECTED_NOTES.filter((original) => {
    const current = currentById.get(original.id);
    return !current || current.voice !== original.voice || current.midi !== original.midi;
  }).length;
  const addedNotes = notes.filter((note) => !defaultsById.has(note.id)).length;

  return changedDefaults + addedNotes;
};

export const resetManualCorrections = () => {
  if (canUseStorage()) window.localStorage.removeItem(MANUAL_CORRECTION_STORAGE_KEY);
  return cloneDefaultNotes();
};
