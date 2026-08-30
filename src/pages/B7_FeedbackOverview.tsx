import {
  AlertTriangle,
  BookmarkPlus,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/shared/PageHeader";
import {
  DEMO_CAPTURE_IMAGE,
  DEMO_RECOGNITION_ISSUES,
  type RecognitionIssue,
} from "@/lib/grading-demo";
import { cn } from "@/lib/utils";

const SCORE_WIDTH = 2048;
const SCORE_HEIGHT = 840;

const issueColors: Record<string, { stroke: string; fill: string }> = {
  "parallel-fifth-1": { stroke: "#dc2626", fill: "rgba(220,38,38,0.14)" },
  "parallel-fifth-2": { stroke: "#ea580c", fill: "rgba(234,88,12,0.14)" },
  "parallel-octave": { stroke: "#2563eb", fill: "rgba(37,99,235,0.14)" },
  "over-8": { stroke: "#7c3aed", fill: "rgba(124,58,237,0.14)" },
};

const defaultIssueColor = { stroke: "#0f172a", fill: "rgba(15,23,42,0.10)" };

const B7FeedbackOverview = () => {
  const navigate = useNavigate();
  const [selectedIssueId, setSelectedIssueId] = useState(
    DEMO_RECOGNITION_ISSUES[0].id
  );
  const selectedIssue =
    DEMO_RECOGNITION_ISSUES.find((issue) => issue.id === selectedIssueId) ??
    DEMO_RECOGNITION_ISSUES[0];
  const severeCount = DEMO_RECOGNITION_ISSUES.filter(
    (issue) => issue.severity === "severe"
  ).length;
  const warningCount = DEMO_RECOGNITION_ISSUES.length - severeCount;

  const renderIssueDetail = (issue: RecognitionIssue) => (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                issue.accent
              )}
            >
              {issue.shortLabel}
            </span>
            <span className="text-[11px] text-muted-foreground">{issue.measureLabel}</span>
          </div>
          <h2 className="mt-3 text-lg font-display font-semibold">{issue.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{issue.voices}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            issue.severity === "severe"
              ? "bg-destructive/10 text-destructive"
              : "bg-warning/10 text-warning"
          }`}
        >
          {issue.severity === "severe" ? "嚴重" : "提醒"}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <section className="rounded-2xl bg-background px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            錯誤摘要
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed">{issue.summary}</p>
        </section>
        <section className="rounded-2xl bg-destructive/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-destructive/75">
            為什麼會被判定
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{issue.why}</p>
        </section>
        <section className="rounded-2xl bg-success/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-success">
            修改方向
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{issue.fix}</p>
        </section>
      </div>

      <div className="mt-3 rounded-2xl border border-dashed border-border bg-background px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          快速檢查點
        </p>
        <p className="mt-2 text-sm leading-relaxed">{issue.checkpoint}</p>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/grading/error/${issue.id}?source=demo`)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-sm font-medium"
      >
        查看規則詳情 <ChevronRight size={15} />
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title="回饋總覽"
        showBack
        right={
          <button
            onClick={() => navigate("/grading/save")}
            className="text-xs font-medium text-primary"
          >
            儲存
          </button>
        }
      />

      <main className="space-y-4 px-4 pt-4">
        <section className="rounded-[2rem] border border-border bg-card p-4 shadow-elevated">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">
            Harmony Analysis
          </p>
          <h1 className="mt-1 text-lg font-display font-semibold">
            分析完成，發現 {DEMO_RECOGNITION_ISSUES.length} 個和聲問題
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            點選譜面框選或下方問題，即可查看原本的錯誤原因、修改方向與快速檢查方式。
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-background px-3 py-3 text-center">
              <p className="text-lg font-semibold">{DEMO_RECOGNITION_ISSUES.length}</p>
              <p className="text-[10px] text-muted-foreground">問題總數</p>
            </div>
            <div className="rounded-2xl bg-destructive/5 px-3 py-3 text-center">
              <p className="text-lg font-semibold text-destructive">{severeCount}</p>
              <p className="text-[10px] text-muted-foreground">嚴重錯誤</p>
            </div>
            <div className="rounded-2xl bg-warning/5 px-3 py-3 text-center">
              <p className="text-lg font-semibold text-warning">{warningCount}</p>
              <p className="text-[10px] text-muted-foreground">間距提醒</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-card">
          <div
            className="relative w-full overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted/30"
            style={{ aspectRatio: `${SCORE_WIDTH} / ${SCORE_HEIGHT}` }}
          >
            <svg
              viewBox={`0 0 ${SCORE_WIDTH} ${SCORE_HEIGHT}`}
              className="absolute inset-0 h-full w-full"
              aria-labelledby="feedback-score-title"
            >
              <title id="feedback-score-title">原始四部和聲譜面與分析錯誤定位</title>
              <image
                href={DEMO_CAPTURE_IMAGE}
                x="0"
                y="0"
                width={SCORE_WIDTH}
                height={SCORE_HEIGHT}
                preserveAspectRatio="xMidYMid meet"
              />

              {DEMO_RECOGNITION_ISSUES.map((issue, index) => {
                const isActive = issue.id === selectedIssueId;
                const color = issueColors[issue.id] ?? defaultIssueColor;
                const centerX = issue.box.x + issue.box.width / 2;
                const markerY = issue.box.y - 18;

                return (
                  <g
                    key={issue.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${issue.title}，${issue.measureLabel}`}
                    onClick={() => setSelectedIssueId(issue.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedIssueId(issue.id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {isActive ? (
                      <>
                        <rect
                          x={issue.box.x}
                          y={issue.box.y}
                          width={issue.box.width}
                          height={issue.box.height}
                          rx="18"
                          fill={color.fill}
                          stroke={color.stroke}
                          strokeWidth="5"
                        />
                        <g transform={`translate(${issue.box.x + 8}, ${issue.box.y - 40})`}>
                          <rect
                            width={Math.max(118, issue.title.length * 16)}
                            height="28"
                            rx="14"
                            fill="rgba(255,255,255,0.96)"
                            stroke={color.stroke}
                            strokeWidth="1.5"
                          />
                          <text x="12" y="19" fontSize="14" fontWeight="700" fill={color.stroke}>
                            {issue.title}
                          </text>
                        </g>
                      </>
                    ) : (
                      <>
                        <line
                          x1={centerX}
                          y1={markerY + 14}
                          x2={centerX}
                          y2={issue.box.y}
                          stroke={color.stroke}
                          strokeWidth="2"
                          opacity="0.68"
                        />
                        <circle
                          cx={centerX}
                          cy={markerY}
                          r="16"
                          fill="rgba(255,255,255,0.95)"
                          stroke={color.stroke}
                          strokeWidth="2"
                        />
                        <text
                          x={centerX}
                          y={markerY + 4.5}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="700"
                          fill={color.stroke}
                        >
                          {index + 1}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                目前選取
              </p>
              <p className="mt-1 text-sm font-medium">{selectedIssue.title}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {selectedIssue.voices}
            </span>
          </div>
        </section>

        <section aria-label="分析問題導覽" className="rounded-[2rem] border border-border bg-card p-3 shadow-card">
          <div data-testid="feedback-issue-navigator" className="flex gap-2 overflow-x-auto hide-scrollbar">
            {DEMO_RECOGNITION_ISSUES.map((issue, index) => {
              const isActive = issue.id === selectedIssueId;

              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setSelectedIssueId(issue.id)}
                  aria-pressed={isActive}
                  aria-label={`${issue.title}，${issue.measureLabel}`}
                  className={cn(
                    "min-w-[13.5rem] shrink-0 rounded-[1.25rem] border px-4 py-3 text-left transition-all",
                    isActive
                      ? "border-primary/30 bg-primary/5 shadow-soft"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            issue.accent
                          )}
                        >
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium">{issue.title}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{issue.measureLabel}</p>
                    </div>
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        isActive ? "bg-primary" : "bg-muted-foreground/25"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section
          data-testid="feedback-issue-detail"
          className="rounded-[2rem] border border-border bg-card p-4 shadow-card"
        >
          <p className="border-b border-border/70 pb-3 text-[11px] uppercase tracking-[0.22em] text-primary/68">
            Issue Detail
          </p>
          <div className="pt-3">{renderIssueDetail(selectedIssue)}</div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-950">建議修正順序</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/75">
                先處理三個嚴重的平行問題，再收斂超過八度的聲部間距，避免調整 spacing 時再次產生平行。
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => navigate("/grading/rewrite")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground shadow-soft"
          >
            <Headphones size={16} /> 比較並播放改寫版本
          </button>
          <button
            onClick={() => navigate("/grading/save")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium shadow-card"
          >
            <BookmarkPlus size={16} /> 加入作品庫
          </button>
        </div>
      </main>
    </div>
  );
};

export default B7FeedbackOverview;
