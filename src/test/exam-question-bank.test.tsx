import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { examPapers, examQuestions, findExamQuestion } from '@/data/examQuestionBank';
import C2QuestionList from '@/pages/C2_QuestionList';
import C5AnswerInterface from '@/pages/C5_AnswerInterface';

describe('歷屆試題題庫', () => {
  it('loads all four papers and 90 unique questions', () => {
    expect(examPapers).toHaveLength(4);
    expect(examQuestions).toHaveLength(90);
    expect(new Set(examQuestions.map((question) => question.normalizedId)).size).toBe(90);
  });

  it('keeps answer indexes valid and derives answer text', () => {
    examQuestions.forEach((question) => {
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThan(question.selections.length);
      expect(question.answerText).toBe(question.selections[question.answer]);
    });
  });

  it('normalizes the one malformed source id without losing the original id', () => {
    const question = findExamQuestion('114-1-06');
    expect(question?.sourceId).toBe('114-06');
    expect(question?.normalizedId).toBe('114-1-06');
  });

  it('filters the question list from a paper query parameter', () => {
    render(
      <MemoryRouter initialEntries={['/questions/list?paper=114-1']}>
        <C2QuestionList />
      </MemoryRouter>,
    );

    expect(screen.getByText('顯示 25 題')).toBeInTheDocument();
    expect(screen.getByText(/此譜例出自普賽爾/)).toBeInTheDocument();
  });

  it('opens a specific imported question with its real options', () => {
    render(
      <MemoryRouter initialEntries={['/questions/answer?id=112-1-01']}>
        <Routes>
          <Route path="/questions/answer" element={<C5AnswerInterface />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/披頭四/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /搖滾樂團/ })).toBeInTheDocument();
  });
});
