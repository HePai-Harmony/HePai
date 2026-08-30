import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import { examPapers, examQuestions, findExamQuestion } from '@/data/examQuestionBank';

const optionLabel = (index: number) => String.fromCharCode(65 + index);

const C5AnswerInterface = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const question = findExamQuestion(searchParams.get('id')) ?? examQuestions[0];
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const paper = examPapers.find((candidate) => candidate.id === question.paperId);
  const total = paper?.questionCount ?? examQuestions.length;
  const current = paper?.questions.findIndex((candidate) => candidate.normalizedId === question.normalizedId) ?? 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="歷屆試題作答" showBack />
      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((current + 1) / total) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{current + 1} / {total}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[10px] bg-primary/8 text-primary">{question.paperDisplayName}</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] bg-secondary text-muted-foreground">#{question.questionNumber}</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] bg-secondary text-muted-foreground">{question.groupName}</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] bg-secondary text-muted-foreground">{question.normalizedId}</span>
        </div>

        {question.imageUrl && (
          <div className="rounded-2xl border border-border bg-white p-2 shadow-card">
            <img
              src={question.imageUrl}
              alt={`${question.normalizedId} 題目譜例`}
              className="max-h-[28rem] w-full rounded-xl object-contain"
            />
          </div>
        )}

        <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
          <p className="text-base font-medium leading-relaxed">{question.question}</p>
        </div>

        <div className="space-y-2">
          {question.selections.map((option, index) => (
            <button
              key={`${question.normalizedId}-${index}`}
              onClick={() => setSelected(index)}
              className={`w-full p-4 rounded-xl border text-left text-sm flex items-center gap-3 transition-all active:scale-[0.98] ${
                selected === index
                  ? 'bg-primary/5 border-primary/30 shadow-soft'
                  : 'bg-card border-border shadow-card'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                selected === index ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>{optionLabel(index)}</span>
              <span className="leading-relaxed">{option}</span>
            </button>
          ))}
        </div>

        {showHint && (
          <div className="rounded-xl border border-accent/15 bg-accent/5 p-3 text-sm leading-relaxed">
            <p className="text-xs font-semibold text-accent mb-1">提示</p>
            <p>{question.keypoint || '先排除與題幹時期、曲種或樂譜特徵不相符的選項。'}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setShowHint(!showHint)} className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm flex items-center gap-1.5 text-muted-foreground shadow-card">
            <Lightbulb size={14} /> 提示
          </button>
          <button
            onClick={() => selected !== null && navigate(`/questions/feedback?id=${encodeURIComponent(question.normalizedId)}&selected=${selected}`)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium shadow-soft ${
              selected !== null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            提交答案
          </button>
        </div>
      </div>
    </div>
  );
};

export default C5AnswerInterface;
