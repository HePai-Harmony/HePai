import PageHeader from '@/components/shared/PageHeader';
import HarmonyPlaybackPanel from '@/components/grading/HarmonyPlaybackPanel';

const B9RewriteSuggestion = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="改寫建議" showBack />
      <div className="px-4 pt-4 space-y-4">
        <HarmonyPlaybackPanel />

        <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
          <h3 className="text-sm font-semibold mb-2">修改說明</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            比賽示範版會先把第 2 小節第 3 拍的 Tenor 辨識為 A3，使用者可在手動修正頁確認並調整；
            播放修正版時暫以 B3 示範前後差異。你也可以獨聽 T，或只循環第 2 至第 3 拍比較音高變化。
          </p>
        </div>
      </div>
    </div>
  );
};

export default B9RewriteSuggestion;
