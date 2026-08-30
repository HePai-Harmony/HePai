import type { DetectedNote, HarmonyVoice } from "@/lib/manual-correction";

export type PlaybackVersion = "original" | "revised";
export type PlaybackVoice = "all" | HarmonyVoice;

export interface PlaybackNote extends DetectedNote {
  originalMidi: number;
  revised: boolean;
}

export interface PlaybackBeat {
  id: string;
  measure: number;
  beat: number;
  notes: PlaybackNote[];
}

export const ERROR_BEAT_IDS = ["2-2", "2-3"];

const REVISED_MIDI_BY_NOTE_ID: Record<string, number> = {
  "m2b3-t": 59,
};

const VOICE_ORDER: HarmonyVoice[] = ["S", "A", "T", "B"];

export const buildPlaybackBeats = (
  notes: DetectedNote[],
  version: PlaybackVersion
): PlaybackBeat[] => {
  const groups = new Map<string, PlaybackNote[]>();

  notes.forEach((note) => {
    const id = `${note.measure}-${note.beat}`;
    const revisedMidi = REVISED_MIDI_BY_NOTE_ID[note.id] ?? note.midi;
    const playbackNote: PlaybackNote = {
      ...note,
      originalMidi: note.midi,
      midi: version === "revised" ? revisedMidi : note.midi,
      revised: version === "revised" && revisedMidi !== note.midi,
    };
    groups.set(id, [...(groups.get(id) ?? []), playbackNote]);
  });

  return [...groups.entries()]
    .map(([id, beatNotes]) => ({
      id,
      measure: beatNotes[0].measure,
      beat: beatNotes[0].beat,
      notes: [...beatNotes].sort(
        (first, second) => VOICE_ORDER.indexOf(first.voice) - VOICE_ORDER.indexOf(second.voice)
      ),
    }))
    .sort((first, second) => first.measure - second.measure || first.beat - second.beat);
};

export const filterPlaybackBeats = (beats: PlaybackBeat[], errorOnly: boolean) =>
  errorOnly ? beats.filter((beat) => ERROR_BEAT_IDS.includes(beat.id)) : beats;

export const filterPlaybackNotes = (beat: PlaybackBeat, voice: PlaybackVoice) =>
  voice === "all" ? beat.notes : beat.notes.filter((note) => note.voice === voice);

export const midiToFrequency = (midi: number) =>
  440 * 2 ** ((Math.round(midi) - 69) / 12);

export const getBeatDurationSeconds = (tempo: number) => 60 / Math.max(40, tempo);

export const countRevisedNotes = (beats: PlaybackBeat[]) =>
  beats.reduce(
    (total, beat) => total + beat.notes.filter((note) => note.revised).length,
    0
  );
