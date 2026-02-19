
import React, { useState, useMemo } from 'react';
import { Material } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import MaterialForm from './MaterialForm';
import { SearchIcon } from './icons/SearchIcon';
import { ViewGridIcon } from './icons/ViewGridIcon';
import { ViewListIcon } from './icons/ViewListIcon';
import { FilterIcon } from './icons/FilterIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';

interface MaterialDatabaseProps {
  materials: Material[];
  onAddMaterial: (material: Material) => void;
}

type ViewMode = 'grid' | 'table';
type SortKey = 'tradeName' | 'manufacturer' | 'category' | 'price' | 'country' | 'costLevel' | 'origin';
type SortOrder = 'asc' | 'desc';

const MaterialDatabase: React.FC<MaterialDatabaseProps> = ({ materials, onAddMaterial }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default to table for data management

  // Sort State
  const [sortKey, setSortKey] = useState<SortKey>('tradeName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(materials.map(m => m.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [materials]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      const matchesSearch =
        mat.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.inciName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.benefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || mat.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [materials, searchQuery, selectedCategory]);

  // Sort materials
  const sortedMaterials = useMemo(() => {
      return [...filteredMaterials].sort((a, b) => {
          let valA: any = a[sortKey] || '';
          let valB: any = b[sortKey] || '';

          // Special handling for price to sort numerically if possible
          if (sortKey === 'price') {
              // Remove non-numeric characters and parse
              const numA = parseInt(valA.replace(/[^0-9]/g, ''), 10) || 0;
              const numB = parseInt(valB.replace(/[^0-9]/g, ''), 10) || 0;
              // Only use numeric sort if both have numbers
              if (numA !== 0 || numB !== 0) {
                  return sortOrder === 'asc' ? numA - numB : numB - numA;
              }
              // Fallback to string sort if no numbers
          }

          // Special handling for costLevel (Low < Medium < High)
          if (sortKey === 'costLevel') {
              const rank: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3 };
              const rankA = rank[valA] || 0;
              const rankB = rank[valB] || 0;
              return sortOrder === 'asc' ? rankA - rankB : rankB - rankA;
          }

          // Default string comparison
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();

          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      });
  }, [filteredMaterials, sortKey, sortOrder]);

  const handleSave = (material: Material) => {
      onAddMaterial(material);
      setIsEditing(false);
  };

  const handleHeaderClick = (key: SortKey) => {
      if (sortKey === key) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
          setSortKey(key);
          setSortOrder('asc');
      }
  };

  const SortIconDisplay = ({ currentKey }: { currentKey: SortKey }) => {
      if (sortKey !== currentKey) return <span className="w-4 h-4 ml-1 inline-block opacity-20">&#8597;</span>;
      return sortOrder === 'asc'
        ? <span className="w-4 h-4 ml-1 inline-block text-brand-primary">&#8593;</span>
        : <span className="w-4 h-4 ml-1 inline-block text-brand-primary">&#8595;</span>;
  };

  if (isEditing) {
      return (
          <div className="max-w-4xl mx-auto animate-fade-in">
              <MaterialForm onSave={handleSave} onCancel={() => setIsEditing(false)} />
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-5">
        <div>
            <h1 className="text-3xl font-bold text-brand-secondary">自社原料データベース</h1>
            <p className="mt-3 text-brand-light">AI提案生成時に優先して使用される自社取り扱い原料の一覧です。</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規原料登録
        </Button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-brand-accent/60 mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
        <div className="relative w-full xl:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary hover:border-gray-400 sm:text-sm transition-colors"
                placeholder="商品名、INCI、メーカー、特徴で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto overflow-x-auto">
            {/* Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <FilterIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-brand-light whitespace-nowrap">カテゴリ:</span>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full sm:w-40 pl-3 pr-8 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary hover:border-gray-400 sm:text-sm rounded-xl transition-colors"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {sortOrder === 'asc' ? (
                    <SortAscIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                    <SortDescIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
                <span className="text-sm text-brand-light whitespace-nowrap">並び替え:</span>
                <div className="flex rounded-xl shadow-soft overflow-hidden">
                    <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="rounded-l-xl block w-full sm:w-32 pl-3 pr-8 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary sm:text-sm"
                    >
                        <option value="tradeName">商品名</option>
                        <option value="manufacturer">メーカー</option>
                        <option value="category">カテゴリ</option>
                        <option value="price">価格</option>
                        <option value="country">原産国</option>
                        <option value="origin">産地</option>
                        <option value="costLevel">コスト感</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="-ml-px relative inline-flex items-center px-3 py-2.5 rounded-r-xl border border-gray-300 bg-brand-bg text-sm font-medium text-brand-secondary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
                        title={sortOrder === 'asc' ? "昇順 (クリックで降順)" : "降順 (クリックで昇順)"}
                    >
                        {sortOrder === 'asc' ? '昇順' : '降順'}
                    </button>
                </div>
            </div>

            {/* View Mode */}
            <div className="flex bg-brand-muted rounded-xl p-1 border border-brand-accent/60 flex-shrink-0">
                <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-xl transition-all duration-200 ${viewMode === 'table' ? 'bg-white text-brand-primary shadow-soft' : 'text-gray-500 hover:text-brand-secondary'}`}
                    title="リスト表示"
                >
                    <ViewListIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-brand-primary shadow-soft' : 'text-gray-500 hover:text-brand-secondary'}`}
                    title="グリッド表示"
                >
                    <ViewGridIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      {/* Content Area */}
      {sortedMaterials.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-card">
              <svg className="w-14 h-14 mx-auto text-brand-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="text-brand-light text-lg mb-2">
                  {materials.length === 0 ? "登録されている原料はありません" : "条件に一致する原料が見つかりませんでした"}
              </p>
              {materials.length === 0 && (
                  <div className="mt-5">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>最初の原料を登録する</Button>
                  </div>
              )}
          </div>
      ) : viewMode === 'table' ? (
          // Table View
          <div className="bg-white shadow-card overflow-hidden rounded-2xl border border-brand-accent/60 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-brand-muted">
                      <tr>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none group transition-colors"
                            onClick={() => handleHeaderClick('tradeName')}
                          >
                              商品名 / INCI <SortIconDisplay currentKey="tradeName" />
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none group transition-colors"
                            onClick={() => handleHeaderClick('category')}
                          >
                              カテゴリ <SortIconDisplay currentKey="category" />
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none group transition-colors"
                            onClick={() => handleHeaderClick('manufacturer')}
                          >
                              メーカー / 産地 <SortIconDisplay currentKey="manufacturer" />
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none group transition-colors"
                            onClick={() => handleHeaderClick('price')}
                          >
                              価格 / コスト <SortIconDisplay currentKey="price" />
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              推奨濃度
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              特徴
                          </th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                      {sortedMaterials.map((mat) => (
                          <tr key={mat.id} className="hover:bg-brand-bg/50 transition-colors duration-150">
                              <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-brand-secondary">{mat.tradeName}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{mat.inciName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                                      {mat.category}
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{mat.manufacturer}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{mat.country} {mat.origin && `(${mat.origin})`}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{mat.price || '-'}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">Level: {mat.costLevel}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {mat.recommendedConcentration}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1.5">
                                      {mat.benefits.slice(0, 3).map((b, i) => (
                                          <span key={i} className="bg-brand-muted text-brand-light px-2 py-0.5 rounded-lg text-xs whitespace-nowrap">
                                              {b}
                                          </span>
                                      ))}
                                      {mat.benefits.length > 3 && (
                                          <span className="text-xs text-gray-400">+{mat.benefits.length - 3}</span>
                                      )}
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      ) : (
          // Grid View (Card Layout)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMaterials.map((mat) => (
                <Card key={mat.id} className="flex flex-col h-full hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                         <h3 className="text-xl font-bold text-brand-secondary">{mat.tradeName}</h3>
                         <span className="text-xs bg-brand-muted text-brand-light px-2.5 py-1 rounded-xl">{mat.category}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-5 font-mono">{mat.inciName}</p>

                    <div className="flex-grow">
                        <p className="text-brand-secondary text-sm mb-5 line-clamp-3">{mat.description}</p>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-start">
                                <span className="font-semibold text-brand-light w-24 flex-shrink-0">効果効能:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {mat.benefits.map((b, i) => (
                                        <span key={i} className="bg-brand-bg text-brand-primary px-2 py-0.5 rounded-lg text-xs">{b}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-brand-light w-24">メーカー:</span>
                                <span>{mat.manufacturer}</span>
                            </div>
                             <div className="flex">
                                <span className="font-semibold text-brand-light w-24">推奨濃度:</span>
                                <span>{mat.recommendedConcentration}</span>
                            </div>
                             <div className="flex">
                                <span className="font-semibold text-brand-light w-24">原産国/産地:</span>
                                <span>{mat.country} / {mat.origin}</span>
                            </div>
                             <div className="flex">
                                <span className="font-semibold text-brand-light w-24">価格:</span>
                                <span>{mat.price}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                         <span>Cost Level: {mat.costLevel}</span>
                         <span>{mat.sustainability}</span>
                    </div>
                </Card>
              ))}
          </div>
      )}
    </div>
  );
};

export default MaterialDatabase;
