import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { readManualCorrections, saveManualCorrections } from "@/lib/manual-correction";
import B4RecognitionResult from "@/pages/B4_RecognitionResult";

describe("B4RecognitionResult", () => {
  beforeEach(() => {
    window.localStorage.removeItem("hepai_manual_corrections_v3");
  });

  it("lists the SATB notes recognized at each measure and beat", () => {
    render(
      <MemoryRouter>
        <B4RecognitionResult />
      </MemoryRouter>
    );

    expect(screen.getByText("已辨識 12 個音符，請先確認")).toBeInTheDocument();
    expect(screen.getByText("3 拍")).toBeInTheDocument();
    expect(screen.getByText("1 音")).toBeInTheDocument();

    const firstBeat = screen.getByRole("button", { name: "第 2 小節第 1 拍辨識音符" });
    expect(firstBeat).toHaveTextContent("S · Soprano");
    expect(firstBeat).toHaveTextContent("D4");
    expect(firstBeat).toHaveTextContent("A · Alto");
    expect(firstBeat).toHaveTextContent("B3");
    expect(firstBeat).toHaveTextContent("T · Tenor");
    expect(firstBeat).toHaveTextContent("B3");
    expect(firstBeat).toHaveTextContent("B · Bass");
    expect(firstBeat).toHaveTextContent("G♯2");

    const scoreVoiceLabels = [...document.querySelectorAll(
      "svg[aria-labelledby='recognition-score-title'] g[role='button'] text"
    )]
      .slice(0, 4)
      .map((label) => label.textContent);
    expect(scoreVoiceLabels).toEqual(["S", "A", "T", "B"]);
  });

  it("moves the score locator when the user selects another recognized beat", () => {
    render(
      <MemoryRouter>
        <B4RecognitionResult />
      </MemoryRouter>
    );

    const beatList = screen.getByTestId("recognized-beat-list");
    const secondBeat = within(beatList).getByRole("button", {
      name: "第 2 小節第 2 拍辨識音符",
    });

    fireEvent.click(secondBeat);

    expect(secondBeat).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("第 2 小節・第 2 拍", { selector: "p.text-xs" })).toBeInTheDocument();
    expect(secondBeat).toHaveTextContent("C♯4");
    expect(secondBeat).toHaveTextContent("清楚");
  });

  it("keeps harmonic-rule feedback out of the recognition confirmation step", () => {
    render(
      <MemoryRouter>
        <B4RecognitionResult />
      </MemoryRouter>
    );

    expect(screen.getByText(/這一步只確認辨識結果/)).toBeInTheDocument();
    expect(screen.queryByText("平行五度")).not.toBeInTheDocument();
    expect(screen.queryByText("連續八度")).not.toBeInTheDocument();
  });

  it("offers correction only for wrong recognition and analysis for confirmed notes", () => {
    render(
      <MemoryRouter>
        <B4RecognitionResult />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: "辨識有誤，手動修正" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "音符正確，開始分析" })
    ).toBeInTheDocument();
  });

  it("shows previously corrected notes when returning from manual correction", () => {
    const corrected = readManualCorrections().map((note) =>
      note.id === "m2b3-t" ? { ...note, midi: 58 } : note
    );
    saveManualCorrections(corrected);

    render(
      <MemoryRouter>
        <B4RecognitionResult />
      </MemoryRouter>
    );

    const thirdBeat = screen.getByRole("button", { name: "第 2 小節第 3 拍辨識音符" });
    expect(thirdBeat).toHaveTextContent("T · Tenor");
    expect(thirdBeat).toHaveTextContent("A♯3");
  });

  it("preserves the native aspect ratio of the score capture image", () => {
    const { container } = render(
      <MemoryRouter>
        <B4RecognitionResult />
      </MemoryRouter>
    );

    const scoreImage = container.querySelector(
      "svg[aria-labelledby='recognition-score-title'] image"
    );
    expect(scoreImage).not.toBeNull();
    expect(scoreImage).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
  });
});
