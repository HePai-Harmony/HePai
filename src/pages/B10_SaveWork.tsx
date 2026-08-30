import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertTriangle, Music } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { chapters } from '@/data/mockData';

const B10SaveWork = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [difficulty, setDifficulty] = useState('中');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleBack = () => {
    if (title || notes) {
      setShowLeaveConfirm(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="儲存作品" showBack />

      {/* Leave confirmation overlay */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-elevated p-5 text-center">
            <AlertTriangle size={28} className="text-warning mx-auto mb-3" />
            <h3 className="text-base font-display font-semibold mb-1">尚未儲存</h3>
            <p className="text-sm text-muted-foreground mb-4">確定要離開嗎？未儲存的內容將會遺失。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-2.5 bg-card border border-border rounded-xl text-sm font-medium shadow-card">
                繼續編輯
              </button>
              <button onClick={() => navigate(-1)} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium">
                離開
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Score thumbnail preview */}
        <div className="h-24 rounded-xl bg-card border border-border shadow-card flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
            <Music size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">四部和聲作業</p>
            <p className="text-xs text-muted-foreground">G 大調 · 8 小節 · 5 個錯誤</p>
          </div>
        </div>

        {/* Title warning */}
        {!title && (
          <div className="p-3 rounded-xl bg-warning/8 border border-warning/15 flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning shrink-0" />
            <p className="text-xs text-warning">建議為作品命名，以便日後在作品庫中查找。</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">作品標題</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="例：四部和聲作業 Ch.5"
            className="w-full h-11 px-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Chapter tag */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">章節標記</label>
          <div className="flex flex-wrap gap-2">
            {chapters.slice(0, 7).map(c => (
              <button key={c.id} onClick={() => setSelectedChapter(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedChapter === c.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">難度</label>
          <div className="flex gap-2">
            {['易', '中', '難'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  difficulty === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">備註</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="可記錄練習心得、待加強的部分…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        {/* Save */}
        <button onClick={() => navigate('/grading/library')}
          className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-soft flex items-center justify-center gap-2">
          <Save size={16} /> 儲存作品
        </button>
      </div>
    </div>
  );
};

export default B10SaveWork;
