import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Bookmark, BookOpen, CheckCircle, XCircle, Plus, Headphones } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { harmonyErrors } from '@/data/mockData';
import { useState } from 'react';
import { getDemoRecognitionIssue } from '@/lib/grading-demo';

const B8ErrorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoSource = searchParams.get('source') === 'demo';
  const demoError = isDemoSource ? getDemoRecognitionIssue(id) : undefined;
  const error = harmonyErrors.find(e => e.id === id) || harmonyErrors[0];
  const [bookmarked, setBookmarked] = useState(false);
  const [addedToWrong, setAddedToWrong] = useState(false);

  if (demoError) {
    const severityStyles = {
      severe: { label: '嚴重', tone: 'text-destructive', pill: 'bg-destructive/8 border-destructive/15' },
      warning: { label: '警告', tone: 'text-warning', pill: 'bg-warning/8 border-warning/15' },
    } as const;
    const style = severityStyles[demoError.severity];

    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader
          title="錯誤詳情"
          showBack
          right={
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`transition-colors ${bookmarked ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          }
        />

        <div className="px-4 pt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${style.pill} ${style.tone}`}>
                {style.label}
              </span>
              <span className="text-xs text-muted-foreground">{demoError.measureLabel}</span>
            </div>
            <h2 className="mt-2 text-lg font-display font-semibold">{demoError.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{demoError.voices}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-[10px] font-medium text-muted-foreground">錯誤摘要</p>
            <p className="mt-2 text-sm leading-relaxed">{demoError.summary}</p>
          </div>

          <div className="rounded-2xl border border-destructive/10 bg-destructive/5 p-4">
            <h3 className="text-xs font-semibold text-destructive">為什麼會被判定</h3>
            <p className="mt-2 text-sm leading-relaxed">{demoError.why}</p>
          </div>

          <div className="rounded-2xl border border-success/10 bg-success/5 p-4">
            <h3 className="text-xs font-semibold text-success">修正方向</h3>
            <p className="mt-2 text-sm leading-relaxed">{demoError.fix}</p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/35 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground">快速檢查點</h3>
            <p className="mt-2 text-sm leading-relaxed">{demoError.checkpoint}</p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => navigate('/grading/recognition')}
              className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground shadow-soft"
            >
              回到辨識結果
            </button>
            <button
              onClick={() => navigate(`/grading/work/demo-score-capture`)}
              className="w-full rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground shadow-card"
            >
              回到作品詳情
            </button>
          </div>
        </div>
      </div>
    );
  }

  const severityConfig = {
    severe: { label: '嚴重', color: 'text-destructive', bg: 'bg-destructive/8', borderColor: 'border-destructive/15' },
    warning: { label: '警告', color: 'text-warning', bg: 'bg-warning/8', borderColor: 'border-warning/15' },
    suggestion: { label: '建議', color: 'text-accent', bg: 'bg-accent/8', borderColor: 'border-accent/15' },
  };
  const s = severityConfig[error.severity];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="錯誤詳情" showBack right={
        <button onClick={() => setBookmarked(!bookmarked)} className={`transition-colors ${bookmarked ? 'text-primary' : 'text-muted-foreground'}`}>
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      } />

      <div className="px-4 pt-4 space-y-4">
        {/* Header card */}
        <div className={`p-4 rounded-2xl bg-card border shadow-card ${s.borderColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${s.bg} ${s.color}`}>{s.label}</span>
            <span className="text-xs text-muted-foreground">{error.rule}</span>
          </div>
          <h2 className="text-lg font-display font-semibold">{error.title}</h2>
          <p className="text-xs text-muted-foreground mt-1">第 {error.measure} 小節 · 第 {error.beat} 拍 · {error.voice} 聲部 · {error.category}</p>
        </div>

        {/* Score context - mini preview */}
        <div className="p-3 rounded-xl bg-card border border-border shadow-card">
          <p className="text-[10px] text-muted-foreground mb-2 font-medium">錯誤位置</p>
          <div className="h-16 bg-secondary/50 rounded-lg flex items-center justify-center relative">
            <div className="absolute inset-x-4 space-y-1">
              {[0,1,2,3,4].map(i => <div key={i} className="h-[0.5px] bg-muted-foreground/15" />)}
            </div>
            <div className={`absolute w-10 h-10 rounded-full ${s.bg} border ${s.borderColor} flex items-center justify-center`}>
              <span className={`text-xs font-bold ${s.color}`}>!</span>
            </div>
            <div className="absolute bottom-1 left-3 text-[8px] text-muted-foreground">第 {error.measure} 小節</div>
          </div>
        </div>

        {/* Rule text */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">📜 規則條文</h3>
          <p className="text-sm leading-relaxed">{error.ruleText}</p>
        </div>

        {/* Why wrong */}
        <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
          <h3 className="text-xs font-semibold text-destructive mb-2">❌ 為什麼錯</h3>
          <p className="text-sm leading-relaxed text-foreground">{error.why}</p>
        </div>

        {/* How to fix */}
        <div className="p-4 rounded-2xl bg-success/5 border border-success/10">
          <h3 className="text-xs font-semibold text-success mb-2">✅ 如何修正</h3>
          <p className="text-sm leading-relaxed text-foreground">{error.howToFix}</p>
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-card border border-success/15 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-success" />
              <h4 className="text-xs font-medium text-success">正確範例</h4>
            </div>
            <p className="text-sm font-mono bg-success/5 px-3 py-2.5 rounded-lg leading-relaxed">{error.goodExample}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-destructive/15 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={14} className="text-destructive" />
              <h4 className="text-xs font-medium text-destructive">錯誤範例</h4>
            </div>
            <p className="text-sm font-mono bg-destructive/5 px-3 py-2.5 rounded-lg leading-relaxed">{error.badExample}</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-2 pt-1">
          <button onClick={() => navigate('/questions/list')} className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-soft">
            <BookOpen size={16} /> 練習相關題目
          </button>
          <button onClick={() => navigate('/grading/rewrite')} className="w-full py-3 bg-card border border-border text-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-card">
            <Headphones size={16} /> 查看並播放改寫建議
          </button>
          <div className="flex gap-2">
            <button onClick={() => setBookmarked(!bookmarked)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border ${bookmarked ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground shadow-card'}`}>
              <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? '已收藏' : '收藏規則'}
            </button>
            <button onClick={() => setAddedToWrong(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border ${addedToWrong ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground shadow-card'}`}>
              <Plus size={14} /> {addedToWrong ? '已加入' : '加入錯題本'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B8ErrorDetail;
