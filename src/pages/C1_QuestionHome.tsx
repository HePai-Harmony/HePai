import { useNavigate } from 'react-router-dom';
import { Target, Flame, Brain, FileText, ChevronRight, BookOpen, History, Star, Calendar, Zap } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { chapters, weeklyStats } from '@/data/mockData';
import { examYearCards, questionBankSummary } from '@/data/examQuestionBank';

const C1QuestionHome = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="題庫" showSearch onSearch={() => navigate('/search')} />
      <div className="px-4 pt-4 space-y-5">

        {/* Section 1: 今日目標 */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-primary" />
              <span className="text-sm font-semibold">今日目標</span>
            </div>
            <div className="flex items-center gap-1 text-warning">
              <Flame size={14} /><span className="text-xs font-medium">連續 {weeklyStats.streak} 天</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${(weeklyStats.completed / weeklyStats.target) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{weeklyStats.completed}/{weeklyStats.target} 題</span>
          </div>
        </div>

        {/* Section 2: 開始練習 */}
        <div>
          <h2 className="text-sm font-semibold mb-2">開始練習</h2>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => navigate('/questions/settings')} className="p-3.5 rounded-xl bg-primary text-primary-foreground shadow-soft flex flex-col items-center gap-1.5 active:scale-[0.98] transition-transform">
              <Zap size={20} />
              <span className="text-xs font-medium">每日練習</span>
            </button>
            <button onClick={() => navigate('/questions/weakness')} className="p-3.5 rounded-xl bg-card border border-border shadow-card flex flex-col items-center gap-1.5 active:scale-[0.98] transition-transform">
              <Brain size={20} className="text-accent" />
              <span className="text-xs font-medium">弱點練習</span>
            </button>
            <button onClick={() => navigate('/questions/mock-exam')} className="p-3.5 rounded-xl bg-card border border-border shadow-card flex flex-col items-center gap-1.5 active:scale-[0.98] transition-transform">
              <FileText size={20} className="text-accent" />
              <span className="text-xs font-medium">模擬測驗</span>
            </button>
          </div>
        </div>

        {/* Section 3: 歷屆題庫 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold">歷屆題庫</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">已匯入 {questionBankSummary.questionCount} 題正式資料</p>
            </div>
            <button onClick={() => navigate('/questions/list')} className="text-xs text-primary">查看全部</button>
          </div>
          <div className="space-y-2">
            {examYearCards.map(y => (
              <button key={y.id} onClick={() => navigate(`/questions/list?paper=${y.id}`)} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border shadow-card text-left active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{y.label}</p>
                  <p className="text-xs text-muted-foreground">{y.questionCount} 題 · 完成 {y.progress}%</p>
                </div>
                <div className="flex items-center gap-2">
                  {y.starred > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-warning">
                      <Star size={12} className="fill-warning" />{y.starred}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: 快速入口 */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => navigate('/questions/wrong-book')} className="p-3 rounded-xl bg-card border border-border shadow-card flex flex-col items-center gap-1.5">
            <BookOpen size={16} className="text-destructive" />
            <span className="text-xs font-medium">錯題本</span>
          </button>
          <button onClick={() => navigate('/questions/history')} className="p-3 rounded-xl bg-card border border-border shadow-card flex flex-col items-center gap-1.5">
            <History size={16} className="text-muted-foreground" />
            <span className="text-xs font-medium">練習紀錄</span>
          </button>
          <button onClick={() => navigate('/questions/list')} className="p-3 rounded-xl bg-card border border-border shadow-card flex flex-col items-center gap-1.5">
            <Star size={16} className="text-warning" />
            <span className="text-xs font-medium">收藏題目</span>
          </button>
        </div>

        {/* Section 5: 章節練習 */}
        <div>
          <h2 className="text-sm font-semibold mb-2">章節練習</h2>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
            {chapters.map(c => (
              <button key={c.id} onClick={() => navigate('/questions/list')} className="shrink-0 px-3 py-2 rounded-xl bg-card border border-border shadow-card flex items-center gap-2 active:scale-[0.98] transition-transform">
                <span className="text-base">{c.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-medium whitespace-nowrap">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.questionCount} 題</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default C1QuestionHome;
