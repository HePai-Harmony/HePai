import rawQuestionBank from '@/data/hepai_exam_question_bank.json';

export interface ExamQuestion {
  id: string;
  sourceId: string;
  normalizedId: string;
  group: string;
  groupName: string;
  paperId: string;
  paperDisplayName: string;
  questionNumber: number;
  question: string;
  image: string;
  imageUrl: string | null;
  selections: string[];
  answer: number;
  answerText: string;
  keypoint: string;
  steps: string;
  wrongAnswers: string;
}

export interface ExamPaper {
  id: string;
  displayName: string;
  questionType: string;
  questionCount: number;
  groups: Array<{
    name: string;
    questionCount: number;
    description: string;
  }>;
  questions: ExamQuestion[];
}

type RawQuestion = Omit<ExamQuestion, 'groupName' | 'paperId' | 'paperDisplayName' | 'questionNumber' | 'imageUrl'>;

const sourcePapers = rawQuestionBank.papers as Array<{
  id: string;
  displayName: string;
  questionType: string;
  questionCount: number;
  groups: ExamPaper['groups'];
  questions: RawQuestion[];
}>;

const getGroupName = (paper: (typeof sourcePapers)[number], groupId: string) => {
  const groupIndex = Number(groupId.split('-').at(-1)) - 1;
  return paper.groups[groupIndex]?.name ?? '綜合題';
};

export const examPapers: ExamPaper[] = sourcePapers.map((paper) => ({
  id: paper.id,
  displayName: paper.displayName,
  questionType: paper.questionType,
  questionCount: paper.questionCount,
  groups: paper.groups,
  questions: paper.questions.map((question, index) => ({
    ...question,
    paperId: paper.id,
    paperDisplayName: paper.displayName,
    questionNumber: index + 1,
    groupName: getGroupName(paper, question.group),
    imageUrl: question.image ? `/question-bank-assets/${question.image}` : null,
  })),
}));

export const examQuestions = examPapers.flatMap((paper) => paper.questions);

export const findExamQuestion = (id?: string | null) =>
  examQuestions.find((question) => question.normalizedId === id || question.sourceId === id);

export const getNextExamQuestion = (question: ExamQuestion) => {
  const paper = examPapers.find((candidate) => candidate.id === question.paperId);
  if (!paper) return examQuestions[0];

  const currentIndex = paper.questions.findIndex((candidate) => candidate.normalizedId === question.normalizedId);
  return paper.questions[(currentIndex + 1) % paper.questions.length];
};

export const examYearCards = examPapers.map((paper) => ({
  id: paper.id,
  label: paper.displayName,
  questionCount: paper.questionCount,
  progress: 0,
  starred: 0,
}));

export const questionBankSummary = rawQuestionBank.summary;
