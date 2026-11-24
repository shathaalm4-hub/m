import React, { useState } from 'react';
import { QuestionList } from '../types';
import { Sparkles, Download, Trash2 } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { Logo } from './Logo';

interface ListManagerProps {
  lists: QuestionList[];
  setLists: React.Dispatch<React.SetStateAction<QuestionList[]>>;
  soundEnabled: boolean;
}

export const ListManager: React.FC<ListManagerProps> = ({ lists, setLists, soundEnabled }) => {
  const [selectedList, setSelectedList] = useState<QuestionList | null>(lists[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('السعودية والخليج');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    soundManager.playClick(soundEnabled);
    setIsGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/generate-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, category: aiCategory })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل توليد القائمة.');
      }

      const newList: QuestionList = {
        id: `ai-list-${Date.now()}`,
        title: data.title || aiTopic,
        category: data.category || aiCategory,
        description: data.description || `قائمة مخصصة لـ ${aiTopic}`,
        criteria: data.criteria || 'مرتبة حسب الشهرة في السعودية',
        source: 'تم التوليد بواسطة الذكاء الاصطناعي (Gemini)',
        updatedAt: new Date().toISOString().split('T')[0],
        answers: data.answers || []
      };

      setLists(prev => [newList, ...prev]);
      setSelectedList(newList);
      setSuccessMsg('تم توليد القائمة بنجاح وبها 100 إجابة سعودية!');
      setAiTopic('');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteList = (id: string) => {
    if (lists.length <= 1) {
      alert('لا يمكنك حذف جميع القوائم.');
      return;
    }
    soundManager.playClick(soundEnabled);
    if (confirm('هل أنت متأكد من حذف هذه القائمة؟')) {
      const remaining = lists.filter(l => l.id !== id);
      setLists(remaining);
      if (selectedList?.id === id) {
        setSelectedList(remaining[0]);
      }
    }
  };

  const handleExportJSON = () => {
    if (!selectedList) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${selectedList.title}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 pb-24">
      {/* Hero Header */}
      <div className="bg-[#34202B] border-2 border-[#922D50]/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(146,45,80,0.2),transparent_60%)]"></div>
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#922D50]/30 border border-[#922D50]/50 text-[#F5DDE2] text-xs font-black">
            <Sparkles className="w-4 h-4 text-[#D99AAA]" />
            <span>مكتبة القوائم والذكاء الاصطناعي</span>
          </div>
          <Logo size="md" />
          <p className="text-[#F5DDE2]/80 text-sm max-w-xl">
            استعرض القوائم الحالية، أضف قوائم جديدة بضغطة زر باستخدام الذكاء الاصطناعي، أو قم بتصدير القوائم بكل سهولة.
          </p>
        </div>

        {/* AI Generator Box */}
        <form onSubmit={handleAIGenerate} className="bg-[#34202B] p-6 rounded-3xl border-2 border-[#922D50] w-full md:w-96 space-y-4 shadow-2xl relative z-10">
          <h3 className="text-sm font-black text-[#D99AAA] flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>توليد قائمة 100 عنصر بالذكاء الاصطناعي</span>
          </h3>
          <input
            type="text"
            value={aiTopic}
            onChange={e => setAiTopic(e.target.value)}
            placeholder="مثال: أشهر 100 أكلة شعبية في جازان..."
            className="w-full bg-[#34202B]/60 border border-[#922D50]/40 rounded-xl px-4 py-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#D99AAA] shadow-inner font-bold"
            required
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-[#922D50] hover:bg-[#922D50]/90 text-[#FFFFFF] font-black text-xs shadow-lg shadow-[#922D50]/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#D99AAA]/30"
          >
            {isGenerating ? <span>جاري التوليد (100 إجابة)...</span> : <span>توليد القائمة الآن 🚀</span>}
          </button>
          {errorMsg && <p className="text-xs text-[#D99AAA] font-medium">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-[#F5DDE2] font-medium">{successMsg}</p>}
        </form>
      </div>

      {/* Lists Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists Sidebar */}
        <div className="bg-[#34202B] rounded-[2rem] border border-[#922D50]/40 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#922D50]/30 pb-3">
            <h3 className="text-sm font-black text-[#FFFFFF]">القوائم المتاحة ({lists.length})</h3>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {lists.map(lst => {
              const isSelected = selectedList?.id === lst.id;
              return (
                <div
                  key={lst.id}
                  onClick={() => {
                    soundManager.playClick(soundEnabled);
                    setSelectedList(lst);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#922D50]/30 border-[#922D50] text-[#FFFFFF] shadow-lg'
                      : 'bg-[#34202B]/60 border-[#922D50]/30 hover:border-[#922D50]/60 text-[#F5DDE2]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-black text-[#D99AAA]">{lst.category}</span>
                    <h4 className="font-black text-sm truncate text-[#FFFFFF] mt-1">{lst.title}</h4>
                    <span className="text-[11px] text-[#F5DDE2]/70">{lst.answers.length} إجابة</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(lst.id);
                    }}
                    className="p-2 rounded-xl bg-[#34202B] hover:bg-[#922D50] text-[#F5DDE2] hover:text-[#FFFFFF] transition-all border border-[#922D50]/40"
                    title="حذف القائمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected List Details & Answers */}
        <div className="bg-[#34202B] rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl lg:col-span-2 space-y-6">
          {selectedList ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#922D50]/30 pb-4">
                <div>
                  <span className="text-xs font-black text-[#F5DDE2] bg-[#922D50]/40 px-3.5 py-1 rounded-full border border-[#922D50]/50">
                    {selectedList.category}
                  </span>
                  <h3 className="text-xl font-black text-[#FFFFFF] mt-3">{selectedList.title}</h3>
                  <p className="text-xs text-[#F5DDE2]/80 mt-1">{selectedList.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="px-5 py-2.5 rounded-xl bg-[#922D50]/20 hover:bg-[#922D50] text-[#F5DDE2] hover:text-[#FFFFFF] text-xs font-black border border-[#922D50]/50 flex items-center gap-2 transition-all cursor-pointer shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير JSON</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#F5DDE2]">عينة من إجابات القائمة (ترتيب 1 إلى {selectedList.answers.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto p-1 bg-[#34202B]/60 rounded-2xl border border-[#922D50]/30 shadow-inner">
                  {selectedList.answers.map(ans => (
                    <div key={ans.id} className="p-3 rounded-xl bg-[#34202B] border border-[#922D50]/30 flex items-center justify-between text-xs shadow">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-[#D99AAA] bg-[#34202B] border border-[#922D50]/40 px-2 py-0.5 rounded">#{ans.rank}</span>
                        <span className="font-bold text-[#FFFFFF]">{ans.text}</span>
                      </div>
                      <span className="text-[11px] text-[#F5DDE2]/70 font-bold">{ans.points} نقطة</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#F5DDE2]/60 font-bold">اختر قائمة لعرض تفاصيلها</div>
          )}
        </div>
      </div>
    </div>
  );
};
