import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle, RotateCw } from 'lucide-react';
import { countManualCorrections, readManualCorrections } from '@/lib/manual-correction';

const steps = [
  { label: '譜面辨識', desc: '解析手寫譜面的音符與記號…' },
  { label: '調性與功能分析', desc: '判斷調性、和弦功能與級數…' },
  { label: '和聲規則檢核', desc: '對照四部和聲寫作規則…' },
  { label: '生成分析回饋', desc: '整理錯誤並產生修正建議…' },
];

const B6AnalysisProgress = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [failed, setFailed] = useState(false);
  const [correctedCount] = useState(() => countManualCorrections(readManualCorrections()));

  useEffect(() => {
    if (failed) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => navigate('/grading/feedback'), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [navigate, failed]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-6 w-full max-w-xs"
      >
        {/* Animated icon */}
        <div className="relative w-20 h-20">
          {!failed ? (
            <>
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-display font-bold text-primary">{Math.round(progress)}%</span>
              </div>
            </>
          ) : (
            <div className="w-20 h-20 rounded-full bg-destructive/8 flex items-center justify-center">
              <AlertCircle size={32} className="text-destructive" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center">
          {correctedCount > 0 && (
            <p className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              已套用 {correctedCount} 項手動校正
            </p>
          )}
          <h2 className="text-lg font-display font-semibold mb-1">
            {failed ? '分析失敗' : '正在分析'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {failed ? '處理過程中發生錯誤，請重試' : '正在為你的四部和聲作業進行和聲分析'}
          </p>
        </div>

        {/* Step list */}
        <div className="w-full space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all duration-500 ${
                failed && i === currentStep
                  ? 'bg-destructive/10 text-destructive'
                  : i < currentStep
                    ? 'bg-success text-success-foreground'
                    : i === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
              }`}>
                {i < currentStep ? <CheckCircle size={14} /> :
                 failed && i === currentStep ? <AlertCircle size={14} /> :
                 i === currentStep ? <Loader2 size={14} className="animate-spin" /> :
                 i + 1}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium transition-colors ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground/50'}`}>{s.label}</p>
                {i === currentStep && !failed && (
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2 w-full">
          {failed ? (
            <>
              <button onClick={() => { setFailed(false); setCurrentStep(0); }}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 shadow-soft">
                <RotateCw size={14} /> 重試
              </button>
              <button onClick={() => navigate(-1)}
                className="flex-1 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-medium shadow-card">
                返回
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate(-1)} className="px-5 py-2.5 text-xs text-muted-foreground">取消</button>
              <button className="px-5 py-2.5 text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle size={12} /> 回報問題
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default B6AnalysisProgress;
