import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ChevronRight, Plus, RotateCw, XCircle } from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import { examQuestions, findExamQuestion, getNextExamQuestion } from '@/data/examQuestionBank';

const optionLabel = (index: number) => String.fromCharCode(65 + index);

const C6AnswerFeedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const question = findExamQuestion(searchParams.get('id')) ?? examQuestions[0];
  const selectedValue = Number(searchParams.get('selected'));
  const selected = Number.isInteger(selectedValue) && selectedValue >= 0 && selectedValue < question.selections.length
    ? selectedValue
    : -1;
  const isCorrect = selected === question.answer;
  const nextQuestion = getNextExamQuestion(question);

  const goNext = () => navigate(`/questions/answer?id=${encodeURIComponent(nextQuestion.normalizedId)}`);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="作答回饋" showBack />
      <div className="px-4 pt-4 space-y-4">
        <div className={`p-4 rounded-2xl border text-center ${isCorrect ? 'bg-success/5 border-success/15' : 'bg-destructive/5 border-destructive/15'}`}>
          {isCorrect ? <CheckCircle size={32} className="text-success mx-auto mb-2" /> : <XCircle size={32} className="text-destructive mx-auto mb-2" />}
          <h2 className="text-lg font-display font-semibold">{isCorrect ? '答對了！' : '答錯了'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            正確答案：{optionLabel(question.answer)}. {question.answerText}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          {question.paperDisplayName} · 第 {question.questionNumber} 題 · {question.groupName} · {question.normalizedId}
        </div>

        {question.imageUrl && (
          <div className="rounded-2xl border border-border bg-white p-2 shadow-card">
            <img src={question.imageUrl} alt={`${question.normalizedId} 題目譜例`} className="max-h-[24rem] w-full rounded-xl object-contain" />
          </div>
        )}

        <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
          <h3 className="text-sm font-semibold mb-2">考點解析</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {question.keypoint || '原始題庫尚未提供解析。請依正確答案回看題幹與選項。'}
          </p>
          {question.steps && (
            <div className="mt-3 rounded-xl bg-secondary/60 p-3">
              <p className="text-xs font-semibold mb-1">解題步驟</p>
              <p className="text-sm leading-relaxed">{question.steps}</p>
            </div>
          )}
          {question.wrongAnswers && (
            <div className="mt-3 rounded-xl bg-warning/5 border border-warning/10 p-3">
              <p className="text-xs font-semibold text-warning mb-1">錯誤選項說明</p>
              <p className="text-sm leading-relaxed">{question.wrongAnswers}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">選項核對</h3>
          <div className="space-y-1.5">
            {question.selections.map((option, index) => (
              <div key={`${question.normalizedId}-${index}`} className={`p-3 rounded-xl border text-sm flex items-center gap-3 ${
                index === question.answer ? 'bg-success/5 border-success/15' : index === selected ? 'bg-destructive/5 border-destructive/15' : 'bg-card border-border'
              }`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0 ${
                  index === question.answer ? 'bg-success text-success-foreground' : index === selected ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-muted-foreground'
                }`}>{optionLabel(index)}</span>
                <span className="flex-1">{option}</span>
                {index === question.answer && <CheckCircle size={14} className="text-success shrink-0" />}
                {index === selected && index !== question.answer && <XCircle size={14} className="text-destructive shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button onClick={goNext} className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-soft flex items-center justify-center gap-2">
            <ChevronRight size={16} /> 下一題
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/questions/answer?id=${encodeURIComponent(question.normalizedId)}`)} className="flex-1 py-3 bg-card border border-border text-foreground rounded-xl text-sm font-medium shadow-card flex items-center justify-center gap-2">
              <RotateCw size={14} /> 再答一次
            </button>
            <button className="flex-1 py-3 bg-card border border-border text-foreground rounded-xl text-sm font-medium shadow-card flex items-center justify-center gap-2">
              <Plus size={14} /> 加入錯題本
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default C6AnswerFeedback;
