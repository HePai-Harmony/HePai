import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import BottomTabBar from '@/components/layout/BottomTabBar';

import A0Splash from '@/pages/A0_Splash';
import A1Onboarding from '@/pages/A1_Onboarding';
import A2Login from '@/pages/A2_Login';
import A3Permissions from '@/pages/A3_Permissions';
import A5GlobalSearch from '@/pages/A5_GlobalSearch';

import B1GradingHome from '@/pages/B1_GradingHome';
import B2Upload from '@/pages/B2_Upload';
import B3ImageProcess from '@/pages/B3_ImageProcess';
import B4RecognitionResult from '@/pages/B4_RecognitionResult';
import B5ManualCorrect from '@/pages/B5_ManualCorrect';
import B6AnalysisProgress from '@/pages/B6_AnalysisProgress';
import B7FeedbackOverview from '@/pages/B7_FeedbackOverview';
import B8ErrorDetail from '@/pages/B8_ErrorDetail';
import B9RewriteSuggestion from '@/pages/B9_RewriteSuggestion';
import B10SaveWork from '@/pages/B10_SaveWork';
import B11WorkLibrary from '@/pages/B11_WorkLibrary';
import B12WorkDetail from '@/pages/B12_WorkDetail';

import C1QuestionHome from '@/pages/C1_QuestionHome';
import C2QuestionList from '@/pages/C2_QuestionList';
import C3PracticeSettings from '@/pages/C3_PracticeSettings';
import C4PracticeProgress from '@/pages/C4_PracticeProgress';
import C5AnswerInterface from '@/pages/C5_AnswerInterface';
import C6AnswerFeedback from '@/pages/C6_AnswerFeedback';
import C7WrongBook from '@/pages/C7_WrongBook';
import C8WeaknessTraining from '@/pages/C8_WeaknessTraining';
import C9MockExam from '@/pages/C9_MockExam';
import C10PracticeHistory from '@/pages/C10_PracticeHistory';

import D1ReportHome from '@/pages/D1_ReportHome';
import D2ErrorStats from '@/pages/D2_ErrorStats';
import D3TrendAnalysis from '@/pages/D3_TrendAnalysis';
import D4WeeklyReport from '@/pages/D4_WeeklyReport';
import D5GoalsReminders from '@/pages/D5_GoalsReminders';

import E1ProfileHome from '@/pages/E1_ProfileHome';
import E2Preferences from '@/pages/E2_Preferences';
import E3PermissionManage from '@/pages/E3_PermissionManage';
import E4AccountSecurity from '@/pages/E4_AccountSecurity';
import E5HelpSupport from '@/pages/E5_HelpSupport';

const queryClient = new QueryClient();

type AppScreen = 'splash' | 'onboarding' | 'login' | 'permissions' | 'main';

const App = () => {
  const [screen, setScreen] = useState<AppScreen>(() => {
    const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
    const onboarded = typeof window.localStorage?.getItem === 'function'
      && window.localStorage.getItem('hepai_onboarded') === 'true';
    return (demoMode || onboarded) ? 'main' : 'splash';
  });

  const goMain = () => {
    if (typeof window.localStorage?.setItem === 'function') {
      window.localStorage.setItem('hepai_onboarded', 'true');
    }
    setScreen('main');
  };

  const renderScreen = () => {
    if (screen === 'splash') return <A0Splash onComplete={() => setScreen('onboarding')} />;
    if (screen === 'onboarding') return <A1Onboarding onComplete={() => setScreen('login')} />;
    if (screen === 'login') return <A2Login onComplete={() => setScreen('permissions')} />;
    if (screen === 'permissions') return <A3Permissions onComplete={goMain} />;

    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <div className="max-w-lg mx-auto min-h-screen bg-background relative">
              <Routes>
                <Route path="/" element={<B1GradingHome />} />
                <Route path="/grading" element={<B1GradingHome />} />
                <Route path="/grading/upload" element={<B2Upload />} />
                <Route path="/grading/process" element={<B3ImageProcess />} />
                <Route path="/grading/recognition" element={<B4RecognitionResult />} />
                <Route path="/grading/correct" element={<B5ManualCorrect />} />
                <Route path="/grading/analysis" element={<B6AnalysisProgress />} />
                <Route path="/grading/feedback" element={<B7FeedbackOverview />} />
                <Route path="/grading/error/:id" element={<B8ErrorDetail />} />
                <Route path="/grading/rewrite" element={<B9RewriteSuggestion />} />
                <Route path="/grading/save" element={<B10SaveWork />} />
                <Route path="/grading/library" element={<B11WorkLibrary />} />
                <Route path="/grading/work/:id" element={<B12WorkDetail />} />
                <Route path="/questions" element={<C1QuestionHome />} />
                <Route path="/questions/list" element={<C2QuestionList />} />
                <Route path="/questions/settings" element={<C3PracticeSettings />} />
                <Route path="/questions/practice" element={<C4PracticeProgress />} />
                <Route path="/questions/answer" element={<C5AnswerInterface />} />
                <Route path="/questions/feedback" element={<C6AnswerFeedback />} />
                <Route path="/questions/wrong-book" element={<C7WrongBook />} />
                <Route path="/questions/weakness" element={<C8WeaknessTraining />} />
                <Route path="/questions/mock-exam" element={<C9MockExam />} />
                <Route path="/questions/history" element={<C10PracticeHistory />} />
                <Route path="/reports" element={<D1ReportHome />} />
                <Route path="/reports/errors" element={<D2ErrorStats />} />
                <Route path="/reports/trends" element={<D3TrendAnalysis />} />
                <Route path="/reports/weekly" element={<D4WeeklyReport />} />
                <Route path="/reports/goals" element={<D5GoalsReminders />} />
                <Route path="/profile" element={<E1ProfileHome />} />
                <Route path="/profile/preferences" element={<E2Preferences />} />
                <Route path="/profile/permissions" element={<E3PermissionManage />} />
                <Route path="/profile/account" element={<E4AccountSecurity />} />
                <Route path="/profile/help" element={<E5HelpSupport />} />
                <Route path="/search" element={<A5GlobalSearch />} />
              </Routes>
              <BottomTabBar />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {renderScreen()}
    </ThemeProvider>
  );
};

export default App;
