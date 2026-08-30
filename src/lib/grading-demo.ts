import { recentWorks } from "@/data/mockData";

export type RecognitionSeverity = "severe" | "warning";

export interface DemoRecentWork {
  id: string;
  title: string;
  date: string;
  errorCount: number;
  chapter: string;
  thumbnail: string;
  source?: "demo";
}

export interface RecognitionIssue {
  id: string;
  title: string;
  shortLabel: string;
  severity: RecognitionSeverity;
  measureLabel: string;
  voices: string;
  summary: string;
  why: string;
  fix: string;
  checkpoint: string;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  accent: string;
}

const DEMO_STORAGE_KEY = "hepai_demo_recent_works";

export const DEMO_CAPTURE_IMAGE = "/score-original.png";
export const DEMO_REVIEW_IMAGE = "/score-teacher-marked.png";
export const DEMO_WORK_ID = "demo-score-capture";

export const DEMO_RECOGNITION_ISSUES: RecognitionIssue[] = [
  {
    id: "parallel-fifth-1",
    title: "平行五度",
    shortLabel: "5-1",
    severity: "severe",
    measureLabel: "第二小節，第 1 拍至第 2 拍",
    voices: "Soprano / Bass",
    summary: "避免外聲部以相同方向移動後，仍維持純五度。",
    why: "這兩個和弦之間，外聲部同向前進，且前後都形成純五度，會削弱四部和聲的聲部獨立性。",
    fix: "保留低音走向，將高音改為反向或斜向進行，優先改成三度或六度的連接。",
    checkpoint: "檢查外聲部是否『同向移動 + 前後都是 P5』。",
    box: { x: 860, y: 300, width: 182, height: 330 },
    accent: "bg-[#dc2626]/14 text-[#dc2626] border-[#dc2626]/40",
  },
  {
    id: "parallel-fifth-2",
    title: "平行五度",
    shortLabel: "5-2",
    severity: "severe",
    measureLabel: "第二小節，第 2 拍至第 3 拍",
    voices: "Alto / Bass",
    summary: "第二組相鄰和弦再次出現純五度平行，屬於重複性聲部進行錯誤。",
    why: "同一時間窗內又出現一組純五度平行，代表錯誤不是偶發，而是和弦連接策略本身需要重排。",
    fix: "優先調整中間聲部配置，讓其中一個音改為共同音或級進，避免再次落在純五度。",
    checkpoint: "重排時先看 Alto/Tenor 是否能留共同音，再回頭確認外聲部。",
    box: { x: 960, y: 300, width: 170, height: 330 },
    accent: "bg-[#ea580c]/14 text-[#ea580c] border-[#ea580c]/40",
  },
  {
    id: "parallel-octave",
    title: "連續八度",
    shortLabel: "8",
    severity: "severe",
    measureLabel: "第二小節，第 3 拍至第 4 拍",
    voices: "Soprano / Bass",
    summary: "避免外聲部形成連續純八度，否則兩個聲部會被聽成同一條線。",
    why: "此處外聲部以前後兩個純八度相接，會讓高音與低音失去各自的旋律獨立感。",
    fix: "保留低音骨架時，將高音改成反向級進，或讓其中一拍先經過三度、六度再解決。",
    checkpoint: "外聲部只要出現『同向 + P8 到 P8』，就優先重寫高音。",
    box: { x: 1068, y: 300, width: 162, height: 330 },
    accent: "bg-[#2563eb]/14 text-[#2563eb] border-[#2563eb]/40",
  },
  {
    id: "over-8",
    title: "超過八度",
    shortLabel: "over 8",
    severity: "warning",
    measureLabel: "第三小節，第 2 拍",
    voices: "Soprano / Alto",
    summary: "上方相鄰聲部的距離被拉得過開，超過常見 SATB 配置的緊密範圍。",
    why: "傳統四部寫作通常要求 S/A、A/T 盡量保持在八度內，這裡的上聲部間距過寬，會讓和聲重心鬆散。",
    fix: "維持旋律方向不變時，優先把 Alto 補回八度內，或改成轉位讓內聲部更靠近。",
    checkpoint: "每次寫完和弦後，先看 S-A、A-T 是否超過八度，再檢查平行問題。",
    box: { x: 1298, y: 300, width: 182, height: 330 },
    accent: "bg-[#7c3aed]/14 text-[#7c3aed] border-[#7c3aed]/40",
  },
];

const demoRecentWork: DemoRecentWork = {
  id: DEMO_WORK_ID,
  title: "拍攝示範｜四部和聲批改",
  date: "2026-04-10",
  errorCount: DEMO_RECOGNITION_ISSUES.length,
  chapter: "聲部進行",
  thumbnail: "AI",
  source: "demo",
};

export const buildRecognitionCards = (
  issues: RecognitionIssue[],
  selectedId = issues[0]?.id
) => {
  const selected = issues.find((issue) => issue.id === selectedId);
  const rest = issues.filter((issue) => issue.id !== selectedId);

  return selected ? [selected, ...rest] : issues;
};

export const getDemoRecognitionIssue = (id?: string) => {
  return DEMO_RECOGNITION_ISSUES.find((issue) => issue.id === id);
};

export const upsertDemoRecentWork = (works: DemoRecentWork[]) => {
  const others = works.filter((work) => work.id !== DEMO_WORK_ID);
  return [demoRecentWork, ...others];
};

const canUseStorage = () =>
  typeof window !== "undefined" &&
  typeof window.localStorage?.getItem === "function" &&
  typeof window.localStorage?.setItem === "function";

const isDemoRecentWork = (value: unknown): value is DemoRecentWork => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.date === "string" &&
    typeof candidate.errorCount === "number" &&
    typeof candidate.chapter === "string" &&
    typeof candidate.thumbnail === "string"
  );
};

export const saveDemoRecentWork = () => {
  if (!canUseStorage()) return;

  const current = readDemoRecentWorks();
  window.localStorage.setItem(
    DEMO_STORAGE_KEY,
    JSON.stringify(upsertDemoRecentWork(current))
  );
};

export const readDemoRecentWorks = (): DemoRecentWork[] => {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isDemoRecentWork);
  } catch {
    return [];
  }
};

export const getMergedRecentWorks = (): DemoRecentWork[] => {
  return [...readDemoRecentWorks(), ...recentWorks].filter(
    (work, index, list) => list.findIndex((item) => item.id === work.id) === index
  );
};

export const getDemoWork = () => demoRecentWork;
