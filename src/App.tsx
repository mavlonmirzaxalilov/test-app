/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';
import { Navbar } from './components/Navbar';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizzesList } from './components/QuizzesList';
import { QuizSession } from './components/QuizSession';
import { ResultsList } from './components/ResultsList';
import { AdminUsers } from './components/AdminUsers';
import { AdminQuizzes } from './components/AdminQuizzes';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('quizzes');
  const [currentQuiz, setCurrentQuiz] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen technical-grid flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    if (currentQuiz) {
      return (
        <QuizSession 
          quizId={currentQuiz} 
          onComplete={() => {
            setCurrentQuiz(null);
            setActiveTab('results');
          }} 
        />
      );
    }

    switch (activeTab) {
      case 'quizzes': return <QuizzesList onSelectQuiz={setCurrentQuiz} />;
      case 'results': return <ResultsList />;
      case 'admin-users': return <AdminUsers />;
      case 'admin-quizzes': return <AdminQuizzes />;
      default: return <QuizzesList onSelectQuiz={setCurrentQuiz} />;
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuiz || activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

