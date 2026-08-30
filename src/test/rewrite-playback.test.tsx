import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import B9RewriteSuggestion from "@/pages/B9_RewriteSuggestion";

describe("rewrite harmony playback controls", () => {
  beforeEach(() => {
    window.localStorage.removeItem("hepai_manual_corrections_v3");
  });

  it("offers original/revised playback, SATB solo, error beats, and tempo", () => {
    const { container } = render(
      <MemoryRouter>
        <B9RewriteSuggestion />
      </MemoryRouter>
    );

    expect(screen.getByRole("region", { name: "四部和聲聲音播放" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "播放原始譜例" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "播放原始版本" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "播放修正版" })).toBeInTheDocument();
    const scoreImage = container.querySelector(
      "svg[aria-labelledby='playback-score-title'] image"
    );
    expect(scoreImage).toHaveAttribute("href", "/score-original.png");
    expect(scoreImage).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");

    const soprano = screen.getByRole("button", { name: "播放聲部 S" });
    fireEvent.click(soprano);
    expect(soprano).toHaveAttribute("aria-pressed", "true");

    const errorOnly = screen.getByRole("button", { name: /只播放發生錯誤的兩拍/ });
    fireEvent.click(errorOnly);
    expect(errorOnly).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("第 2 小節，第 2 拍至第 3 拍")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("slider", { name: "播放速度" }), {
      target: { value: "120" },
    });
    expect(screen.getByText("120 BPM")).toBeInTheDocument();
    expect(screen.getByText("準備播放 · 錯誤兩拍")).toBeInTheDocument();
  });
});
