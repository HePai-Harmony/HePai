import { describe, expect, it } from "vitest";

import {
  buildPlaybackBeats,
  countRevisedNotes,
  filterPlaybackBeats,
  filterPlaybackNotes,
  getBeatDurationSeconds,
  midiToFrequency,
} from "@/lib/harmony-playback";
import { DEFAULT_DETECTED_NOTES } from "@/lib/manual-correction";

describe("harmony playback helpers", () => {
  it("builds chronological SATB playback beats", () => {
    const beats = buildPlaybackBeats(DEFAULT_DETECTED_NOTES, "original");

    expect(beats.map((beat) => beat.id)).toEqual(["2-1", "2-2", "2-3"]);
    expect(beats[0].notes.map((note) => note.voice)).toEqual(["S", "A", "T", "B"]);
    expect(beats[0].notes.map((note) => note.midi)).toEqual([62, 59, 59, 44]);
  });

  it("creates a distinct revised version without mutating the original", () => {
    const original = buildPlaybackBeats(DEFAULT_DETECTED_NOTES, "original");
    const revised = buildPlaybackBeats(DEFAULT_DETECTED_NOTES, "revised");

    expect(countRevisedNotes(revised)).toBe(1);
    expect(original[2].notes.find((note) => note.voice === "T")?.midi).toBe(57);
    expect(revised[2].notes.find((note) => note.voice === "T")?.midi).toBe(59);
    expect(DEFAULT_DETECTED_NOTES.find((note) => note.id === "m2b3-t")?.midi).toBe(57);
  });

  it("filters to the two error beats and a solo voice", () => {
    const beats = buildPlaybackBeats(DEFAULT_DETECTED_NOTES, "original");
    const errorBeats = filterPlaybackBeats(beats, true);

    expect(errorBeats.map((beat) => beat.id)).toEqual(["2-2", "2-3"]);
    expect(filterPlaybackNotes(errorBeats[0], "A")).toHaveLength(1);
    expect(filterPlaybackNotes(errorBeats[0], "A")[0].midi).toBe(61);
  });

  it("converts MIDI and tempo to audio scheduling values", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 5);
    expect(getBeatDurationSeconds(120)).toBe(0.5);
  });
});
