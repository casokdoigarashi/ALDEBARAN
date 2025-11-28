
import React, { useState, useCallback } from 'react';
import { AppState, InquiryData, ScoredProposal, FullProposal, Material } from './types';
import Header from './components/common/Header';
import Dashboard from './components/Dashboard';
import StructuredForm from './components/StructuredForm';
import MatchingResults from './components/MatchingResults';
import ProposalDetailView from './components/ProposalDetailView';
import MaterialDatabase from './components/MaterialDatabase';
import Loader from './components/common/Loader';


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('DASHBOARD');
  // Navigation View State (Concierge vs DB)
  const [currentView, setCurrentView] = useState<'CONCIERGE' | 'DATABASE'>('CONCIERGE');
  
  const [inquiryData, setInquiryData] = useState<InquiryData | null>(null);
  const [scoredProposals, setScoredProposals] = useState<ScoredProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<FullProposal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Mock initial materials
  const [materials, setMaterials] = useState<Material[]>([
      {
          id: 'mat-001',
          tradeName: 'Aldebaran Rose Extract',
          inciName: 'Rosa Damascena Flower Extract',
          manufacturer: 'Aldebaran Org',
          description: '自社農園で栽培されたダマスクローズから抽出したエキス。強力な抗酸化作用と芳醇な香りが特徴。',
          benefits: ['抗酸化', '保湿', '香り'],
          category: '有効成分',
          recommendedConcentration: '0.1% - 1.0%',
          costLevel: 'High',
          price: '25,000円/kg',
          origin: '長野県蓼科',
          country: '日本',
          sustainability: 'Organic Certified'
      }
  ]);
  
  const handleNavigate = (view: 'CONCIERGE' | 'DATABASE') => {
      setCurrentView(view);
      if (view === 'DATABASE') {
          setAppState('MATERIAL_DB');
      } else {
          setAppState('DASHBOARD');
      }
  };

  const resetState = useCallback(() => {
    setAppState('DASHBOARD');
    setInquiryData(null);
    setScoredProposals([]);
    setSelectedProposal(null);
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  const handleStartNewProposal = () => setAppState('FORM_INPUT');

  const handleFormSubmit = async (data: InquiryData) => {
    setIsLoading(true);
    setLoadingMessage('自社原料DBと照合し、ご要件を分析中...');
    setInquiryData(data);
    
    try {
        const { ingestFormData, getMatchingProposals } = await import('./services/apiService');
        await ingestFormData(data); // Simulate API call
        // Pass materials to the AI logic
        const matches = await getMatchingProposals(data, materials);
        setScoredProposals(matches);
        setAppState('MATCHING_RESULTS');
    } catch (error) {
        console.error("Form submit error:", error);
        alert("提案の検索中にエラーが発生しました。入力を確認してもう一度お試しください。");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSelectProposal = async (proposal: ScoredProposal) => {
    setIsLoading(true);
    setLoadingMessage('詳細な提案書を作成中...（30秒ほどかかります）');
    
    try {
        const { generateFullProposal } = await import('./services/apiService');
        // Pass materials to the AI logic
        const fullProposal = await generateFullProposal(proposal.id, materials);
        setSelectedProposal(fullProposal);
        setAppState('PROPOSAL_VIEW');
    } catch (error) {
        console.error("Proposal generation error:", error);
        alert("詳細提案書の生成に失敗しました。しばらく待ってから再度お試しください。");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddMaterial = (newMaterial: Material) => {
      setMaterials(prev => [...prev, newMaterial]);
      alert(`原料「${newMaterial.tradeName}」をデータベースに登録しました。`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader message={loadingMessage} />;
    }

    // Direct routing for DB view
    if (appState === 'MATERIAL_DB') {
        return <MaterialDatabase materials={materials} onAddMaterial={handleAddMaterial} />;
    }

    switch (appState) {
      case 'DASHBOARD':
        return <Dashboard onStartNewProposal={handleStartNewProposal} />;
      case 'FORM_INPUT':
        // Pass inquiryData as initialData so that when going back, the form is populated
        return <StructuredForm onSubmit={handleFormSubmit} onBack={resetState} initialData={inquiryData || undefined} />;
      case 'MATCHING_RESULTS':
        return <MatchingResults proposals={scoredProposals} onSelect={handleSelectProposal} onBack={() => setAppState('FORM_INPUT')} />;
      case 'PROPOSAL_VIEW':
        return selectedProposal && <ProposalDetailView proposal={selectedProposal} onBack={() => setAppState('MATCHING_RESULTS')} />;
      default:
        return <Dashboard onStartNewProposal={handleStartNewProposal} />;
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen text-gray-800 font-sans">
      <Header onLogoClick={resetState} onNavigate={handleNavigate} currentView={currentView} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
