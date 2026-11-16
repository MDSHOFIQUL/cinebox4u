import React from 'react';
import { X, Globe, Check, Layers, Film, Music, Ghost, Smile, Gamepad2, Sparkles, Zap, Tv, Heart, PlayCircle, Clock } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { Category } from '../types';

interface CategoryLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategorySlug?: string;
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoryLanguageModal: React.FC<CategoryLanguageModalProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategorySlug,
  onSelectCategory,
}) => {
  const { language, setLanguage } = useLocale();

  if (!isOpen) return null;

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'all': return <Layers className="w-4 h-4 text-red-500" />;
      case 'bangla': return <Film className="w-4 h-4 text-emerald-500" />;
      case 'english': return <Globe className="w-4 h-4 text-sky-500" />;
      case 'tamil': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'song': return <Music className="w-4 h-4 text-pink-500" />;
      case 'horror': return <Ghost className="w-4 h-4 text-purple-500" />;
      case 'cartoon': return <Smile className="w-4 h-4 text-yellow-500" />;
      case 'gaming': return <Gamepad2 className="w-4 h-4 text-green-500" />;
      case 'hindi': return <Sparkles className="w-4 h-4 text-orange-500" />;
      case 'anime': return <Zap className="w-4 h-4 text-cyan-500" />;
      case 'seasons': return <Tv className="w-4 h-4 text-blue-500" />;
      case 'drama-series': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'bangla-natok': return <PlayCircle className="w-4 h-4 text-teal-500" />;
      case 'new-movies': return <Sparkles className="w-4 h-4 text-red-500" />;
      case 'old-movies': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Film className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f1015] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>ক্যাটাগরি ও ভাষা নির্বাচন</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
              Modern Filter
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            আপনার পছন্দের ভাষা পরিবর্তন করুন অথবা যেকোনো ক্যাটাগরি ব্রাউজ করুন
          </p>
        </div>

        {/* Section 1: Language Selection Cards */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-500" />
            <span>সরাসরি ভাষা নির্বাচন / Language Selection</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Bengali Card */}
            <button
              onClick={() => setLanguage('bn')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                language === 'bn'
                  ? 'bg-red-600/20 border-red-500 shadow-md shadow-red-950/60'
                  : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇧🇩</span>
                <div>
                  <h4 className="text-sm font-extrabold text-white">বাংলা</h4>
                  <p className="text-[11px] text-zinc-400">Bengali Edition</p>
                </div>
              </div>
              {language === 'bn' && (
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>

            {/* English Card */}
            <button
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                language === 'en'
                  ? 'bg-red-600/20 border-red-500 shadow-md shadow-red-950/60'
                  : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <div>
                  <h4 className="text-sm font-extrabold text-white">English</h4>
                  <p className="text-[11px] text-zinc-400">Global International</p>
                </div>
              </div>
              {language === 'en' && (
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: 14 Categories in Clean Responsive Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            <span>ক্যাটাগরি নির্বাচন (১৪টি ক্যাটাগরি) / Category Selection</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-zinc-900/90 border-zinc-800/90 hover:bg-zinc-800 text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-black/30' : 'bg-zinc-800'}`}>
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {cat.name}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
