import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { fetchProducts } from './store/slices/productsSlice';
import { setActiveNavTab } from './store/slices/complaintsSlice';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { IntakePage } from './pages/IntakePage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { ComplaintListPage } from './pages/ComplaintListPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';

export const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeNavTab = useSelector((state: RootState) => state.complaints.activeNavTab);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const renderActivePage = () => {
    switch (activeNavTab) {
      case 'dashboard':
        return <DashboardPage onGoToIntake={() => dispatch(setActiveNavTab('log'))} />;
      case 'log':
        return <IntakePage onSavedSuccess={() => dispatch(setActiveNavTab('list'))} />;
      case 'analysis':
        return <AIAnalysisPage />;
      case 'list':
        return <ComplaintListPage />;
      case 'detail':
        return <ComplaintDetailsPage />;
      default:
        return <IntakePage onSavedSuccess={() => dispatch(setActiveNavTab('list'))} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto min-w-0">
          {renderActivePage()}
        </main>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-3 px-6 text-center text-xs border-t border-slate-800">
        <p>Pharma Customer Complaint Management System • React + Redux Toolkit + LangGraph + Groq API + PostgreSQL</p>
      </footer>
    </div>
  );
};

export default App;
