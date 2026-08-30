import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Image as ImageIcon, Search, Star } from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import { examPapers, examQuestions } from '@/data/examQuestionBank';

const C2QuestionList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePaper, setActivePaper] = useState(searchParams.get('paper') ?? 'all');
  const [activeGroup, setActiveGroup] = useState('全部');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [imageOnly, setImageOnly] = useState(false);

  const groupFilters = useMemo(() => {
    const source = activePaper === 'all'
      ? examPapers.flatMap((paper) => paper.groups)
      : examPapers.find((paper) => paper.id === activePaper)?.groups ?? [];
    return ['全部', ...Array.from(new Set(source.map((group) => group.name)))];
  }, [activePaper]);

  const filteredQuestions = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('zh-TW');
    return examQuestions.filter((question) => {
      const matchesPaper = activePaper === 'all' || question.paperId === activePaper;
      const matchesGroup = activeGroup === '全部' || question.groupName === activeGroup;
      const matchesImage = !imageOnly || Boolean(question.imageUrl);
      const matchesQuery = !keyword || [
        question.normalizedId,
        question.question,
        question.keypoint,
        ...question.selections,
      ].some((value) => value.toLocaleLowerCase('zh-TW').includes(keyword));
      return matchesPaper && matchesGroup && matchesImage && matchesQuery;
    });
  }, [activeGroup, activePaper, imageOnly, query]);

  const selectPaper = (paperId: string) => {
    setActivePaper(paperId);
    setActiveGroup('全部');
    if (paperId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ paper: paperId });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="歷屆試題" showBack right={
        <button onClick={() => setShowFilters(!showFilters)} className="p-1.5" aria-label="顯示篩選">
          <Filter size={18} className={showFilters ? 'text-primary' : 'text-muted-foreground'} />
        </button>
      } />
      <div className="px-4 pt-3 space-y-3">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
          <p className="text-sm font-semibold">正式歷屆題庫</p>
          <p className="mt-1 text-xs text-muted-foreground">共 4 份試題、90 題；答案索引與原始 Android 題庫一致。</p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋題目、選項或重點…"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">試題</p>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-4 px-4">
            <button onClick={() => selectPaper('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${activePaper === 'all' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
              全部年度
            </button>
            {examPapers.map((paper) => (
              <button key={paper.id} onClick={() => selectPaper(paper.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${activePaper === paper.id ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                {paper.displayName}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">題組</p>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-4 px-4">
            {groupFilters.map((group) => (
              <button key={group} onClick={() => setActiveGroup(group)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${activeGroup === group ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                {group}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <button
            onClick={() => setImageOnly(!imageOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${imageOnly ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}
          >
            <ImageIcon size={13} /> 只看含譜例題目
          </button>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">顯示 {filteredQuestions.length} 題</p>
          {(query || activePaper !== 'all' || activeGroup !== '全部' || imageOnly) && (
            <button
              onClick={() => {
                setQuery('');
                selectPaper('all');
                setActiveGroup('全部');
                setImageOnly(false);
              }}
              className="text-xs text-primary"
            >
              清除篩選
            </button>
          )}
        </div>

        <div className="space-y-2">
          {filteredQuestions.map((question) => (
            <button
              key={question.normalizedId}
              onClick={() => navigate(`/questions/answer?id=${encodeURIComponent(question.normalizedId)}`)}
              className="w-full p-3 rounded-xl bg-card border border-border shadow-card text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex gap-3">
                {question.imageUrl && (
                  <img
                    src={question.imageUrl}
                    alt={`${question.normalizedId} 譜例`}
                    className="h-14 w-20 shrink-0 rounded-lg border border-border bg-white object-cover"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{question.paperDisplayName} #{question.questionNumber}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground">{question.groupName}</span>
                    </div>
                    <Star size={14} className="text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{question.question}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{question.normalizedId}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">找不到符合條件的題目</div>
        )}
      </div>
    </div>
  );
};

export default C2QuestionList;
