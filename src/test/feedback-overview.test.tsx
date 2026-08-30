import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import B7FeedbackOverview from "@/pages/B7_FeedbackOverview";

describe("B7FeedbackOverview", () => {
  it("restores the original four harmony issues on the real score", () => {
    const { container } = render(
      <MemoryRouter>
        <B7FeedbackOverview />
      </MemoryRouter>
    );

    expect(screen.getByText("分析完成，發現 4 個和聲問題")).toBeInTheDocument();
    expect(screen.getByText("3", { selector: "p.text-lg" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "p.text-lg" })).toBeInTheDocument();
    const scoreImage = container.querySelector(
      "svg[aria-labelledby='feedback-score-title'] image"
    );
    expect(scoreImage).toHaveAttribute("href", "/score-original.png");
    expect(scoreImage).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");

    const detail = screen.getByTestId("feedback-issue-detail");
    expect(detail).toHaveTextContent("平行五度");
    expect(detail).toHaveTextContent("避免外聲部以相同方向移動後，仍維持純五度");
    expect(screen.queryByText("不當跳進")).not.toBeInTheDocument();
  });

  it("switches the score highlight and full explanation from the issue navigator", () => {
    render(
      <MemoryRouter>
        <B7FeedbackOverview />
      </MemoryRouter>
    );

    const navigator = screen.getByTestId("feedback-issue-navigator");
    fireEvent.click(
      within(navigator).getByRole("button", {
        name: /連續八度，第二小節，第 3 拍至第 4 拍/,
      })
    );

    const detail = screen.getByTestId("feedback-issue-detail");
    expect(detail).toHaveTextContent("連續八度");
    expect(detail).toHaveTextContent("外聲部以前後兩個純八度相接");
    expect(detail).toHaveTextContent("外聲部只要出現『同向 + P8 到 P8』");
  });

  it("keeps the rewrite playback and save actions available", () => {
    render(
      <MemoryRouter>
        <B7FeedbackOverview />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: "比較並播放改寫版本" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "加入作品庫" })).toBeInTheDocument();
  });
});
