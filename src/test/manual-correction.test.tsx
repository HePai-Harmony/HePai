import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { countManualCorrections, readManualCorrections } from "@/lib/manual-correction";
import B5ManualCorrect from "@/pages/B5_ManualCorrect";

describe("manual recognition correction", () => {
  beforeEach(() => {
    window.localStorage.removeItem("hepai_manual_corrections_v3");
  });

  it("edits the selected low-confidence pitch, then persists the result", async () => {
    render(
      <MemoryRouter>
        <B5ManualCorrect />
      </MemoryRouter>
    );

    const editor = screen.getByTestId("note-editor");
    expect(editor).toHaveTextContent("第 2 小節・第 3 拍");
    expect(editor).toHaveTextContent("低信心 68%");
    expect(screen.getByTestId("selected-note-name")).toHaveTextContent("A3");

    fireEvent.click(within(editor).getByRole("button", { name: "音高升半音" }));

    expect(within(editor).getByRole("button", { name: "T Tenor" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByTestId("selected-note-name")).toHaveTextContent("A♯3");

    await waitFor(() => {
      const saved = readManualCorrections().find((note) => note.id === "m2b3-t");
      expect(saved?.voice).toBe("T");
      expect(saved?.midi).toBe(58);
      expect(countManualCorrections(readManualCorrections())).toBe(1);
    });
  });

  it("supports undo and restoring the original recognition", () => {
    render(
      <MemoryRouter>
        <B5ManualCorrect />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "音高升半音" }));
    expect(screen.getByTestId("selected-note-name")).toHaveTextContent("A♯3");

    fireEvent.click(screen.getByRole("button", { name: "復原" }));
    expect(screen.getByTestId("selected-note-name")).toHaveTextContent("A3");

    fireEvent.click(screen.getByRole("button", { name: /還原辨識結果/ }));
    expect(screen.getByText("已還原原始辨識結果")).toBeInTheDocument();
    expect(screen.getByTestId("selected-note-name")).toHaveTextContent("A3");
  });

  it("falls back to defaults when saved recognition data is malformed", () => {
    window.localStorage.setItem(
      "hepai_manual_corrections_v3",
      JSON.stringify([{ id: "broken", voice: "X", midi: 300 }])
    );

    const notes = readManualCorrections();
    expect(notes).toHaveLength(12);
    expect(notes[0].id).toBe("m2b1-s");
  });
});
