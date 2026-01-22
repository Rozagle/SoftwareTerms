import React, { useState, useEffect } from 'react';
import { GroupedTerms } from '../types';
import { BookOpen, Layers, Filter, Check, Trash, Hash } from 'lucide-react';

interface DictionaryDisplayProps {
  groupedTerms: GroupedTerms;
  onDeleteTerm: (term: string) => void;
}

const DictionaryDisplay: React.FC<DictionaryDisplayProps> = ({ groupedTerms, onDeleteTerm }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const categories = Object.keys(groupedTerms).sort();

  // Smart filter reset: Only reset if the active category no longer exists (e.g. last item deleted)
  useEffect(() => {
    if (activeFilter !== 'ALL' && !categories.includes(activeFilter)) {
      setActiveFilter('ALL');
    }
  }, [categories, activeFilter]);

  if (categories.length === 0) return null;

  // Calculate total terms for "All" badge
  const totalTerms = Object.values(groupedTerms).reduce((acc, curr) => acc + curr.length, 0);

  // Determine which categories to display based on filter
  const displayedCategories = activeFilter === 'ALL' 
    ? categories 
    : categories.filter(c => c === activeFilter);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Title Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 inline-flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Sözlük Sonuçları
        </h2>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <div className="flex items-center gap-2 mb-3 px-2 pt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          Kategorilere Göre Filtrele
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* 'All' Button */}
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeFilter === 'ALL' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}
            `}
          >
            {activeFilter === 'ALL' && <Check className="w-3.5 h-3.5" />}
            Tümü
            <span className={`
              text-xs px-1.5 py-0.5 rounded-full ml-1
              ${activeFilter === 'ALL' ? 'bg-indigo-500/30 text-white' : 'bg-slate-200 text-slate-600'}
            `}>
              {totalTerms}
            </span>
          </button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeFilter === category 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}
              `}
            >
              {activeFilter === category && <Check className="w-3.5 h-3.5" />}
              {category}
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full ml-1
                ${activeFilter === category ? 'bg-indigo-500/30 text-white' : 'bg-slate-200 text-slate-600'}
              `}>
                {groupedTerms[category].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-8">
        {displayedCategories.map((category) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid">
            {/* Category Header */}
            <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-indigo-900 uppercase tracking-wide">
                {category}
              </h3>
              <span className="ml-auto text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                {groupedTerms[category].length} Terim
              </span>
            </div>

            {/* Terms List */}
            <div className="divide-y divide-slate-100">
              {groupedTerms[category].map((item, index) => (
                <div key={index} className="p-6 hover:bg-slate-50 transition-colors group relative">
                  
                  {/* Delete Button - Fixed: Always visible (lightly), easier to click */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTerm(item.term);
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10"
                    title="Bu terimi sil"
                  >
                    <Trash className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2 pr-10">
                    <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                      {item.term}
                    </span>
                    {item.fullForm && item.fullForm.toLowerCase() !== item.term.toLowerCase() && (
                      <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        ({item.fullForm})
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-3 pr-8">
                    <Hash className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                    <p className="text-slate-600 leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DictionaryDisplay;