/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  Trophy, 
  TrendingUp, 
  ChevronRight, 
  Camera, 
  Trash2, 
  Coins,
  CheckCircle2,
  X,
  Download,
  Upload,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl?: string;
  createdAt: number;
}

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const savedGoals = localStorage.getItem('conquista_goals');
      return savedGoals ? JSON.parse(savedGoals) : [];
    } catch (e) {
      console.error('Erro ao carregar do localStorage:', e);
      return [];
    }
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // New Goal Form
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalImage, setNewGoalImage] = useState('');

  // Edit Goal Form
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalTarget, setEditGoalTarget] = useState('');
  const [editGoalImage, setEditGoalImage] = useState('');

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('');

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('conquista_goals', JSON.stringify(goals));
  }, [goals]);

  const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget) return;

    const newGoal: Goal = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      title: newGoalTitle,
      targetAmount: parseFloat(newGoalTarget),
      currentAmount: 0,
      imageUrl: newGoalImage || `https://picsum.photos/seed/${encodeURIComponent(newGoalTitle)}/400/200`,
      createdAt: Date.now(),
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalImage('');
    setIsAddModalOpen(false);
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setEditGoalTitle(goal.title);
    setEditGoalTarget(goal.targetAmount.toString());
    setEditGoalImage(goal.imageUrl || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editGoalTitle || !editGoalTarget) return;

    setGoals(goals.map(g => {
      if (g.id === editingGoal.id) {
        return {
          ...g,
          title: editGoalTitle,
          targetAmount: parseFloat(editGoalTarget),
          imageUrl: editGoalImage || `https://picsum.photos/seed/${encodeURIComponent(editGoalTitle)}/400/200`,
        };
      }
      return g;
    }));

    setIsEditModalOpen(false);
    setEditingGoal(null);
  };

  const exportData = () => {
    const data = JSON.stringify(goals);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minhas-conquistas-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedGoals = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedGoals)) {
            if (confirm('Isso irá substituir suas conquistas atuais. Deseja continuar?')) {
              setGoals(importedGoals);
            }
          }
        } catch (err) {
          alert('Arquivo de backup inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGoalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !depositAmount) return;

    setGoals(goals.map(goal => {
      if (goal.id === selectedGoalId) {
        return {
          ...goal,
          currentAmount: Math.min(goal.currentAmount + parseFloat(depositAmount), goal.targetAmount)
        };
      }
      return goal;
    }));

    setDepositAmount('');
    setIsDepositModalOpen(false);
    setSelectedGoalId(null);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conquista?')) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header - Very Compact */}
      <header className="bg-[#151619] text-white pt-6 pb-10 px-6 rounded-b-[24px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full -mr-16 -mt-16" />
        
        <div className="max-w-md mx-auto relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">Patrimônio</h1>
            <motion.p 
              key={totalSaved}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-black tracking-tighter"
            >
              {formatCurrency(totalSaved)}
            </motion.p>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-[#151619] py-2 px-4 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-3 h-3" />
            Novo
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 -mt-4 pb-24">
        <div className="space-y-2">
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-1.5 px-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            Conquistas
          </h2>

          {goals.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold">Nenhuma conquista ainda.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 gap-3 no-scrollbar">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                const remaining = goal.targetAmount - goal.currentAmount;

                return (
                  <motion.div 
                    layout
                    key={goal.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-w-[82%] sm:min-w-[320px] snap-center bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group flex flex-col"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img 
                        src={goal.imageUrl} 
                        alt={goal.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                        <h3 className="text-white font-black text-lg leading-tight line-clamp-1">{goal.title}</h3>
                        {isCompleted && (
                          <div className="bg-green-500 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between text-[10px] mb-2">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Progresso</span>
                        <span className="font-black text-[#151619]">{progress.toFixed(0)}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-100 h-2.5 rounded-full mb-5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-[#151619]'}`}
                        />
                      </div>

                      <div className="flex justify-between items-center mb-5">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Guardado</p>
                          <p className="font-black text-lg text-[#151619] leading-none">{formatCurrency(goal.currentAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Meta</p>
                          <p className="font-black text-lg text-gray-300 leading-none">{formatCurrency(goal.targetAmount)}</p>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {!isCompleted ? (
                          <div className="bg-blue-50/50 p-3 rounded-[20px] mb-5 flex items-center gap-3 border border-blue-100/50">
                            <div className="bg-blue-500 p-1.5 rounded-lg">
                              <Coins className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-xs text-blue-700 leading-tight">
                              Faltam <span className="font-black block text-sm">{formatCurrency(remaining)}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="bg-green-50 p-3 rounded-[20px] mb-5 flex items-center gap-3 border border-green-100">
                            <div className="bg-green-500 p-1.5 rounded-lg">
                              <Trophy className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-xs text-green-700 font-black leading-tight">
                              Concluída! <span className="block text-[10px] font-medium opacity-70 italic">Parabéns pelo foco.</span>
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {!isCompleted && (
                            <button 
                              onClick={() => {
                                setSelectedGoalId(goal.id);
                                setIsDepositModalOpen(true);
                              }}
                              className="flex-1 bg-[#151619] text-white py-3.5 rounded-[20px] font-black text-xs uppercase tracking-wider shadow-lg shadow-black/10 active:scale-95 transition-transform"
                            >
                              Depositar
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditClick(goal)}
                            className="p-3.5 bg-gray-50 text-gray-300 rounded-[20px] hover:bg-blue-50 hover:text-blue-500 transition-all active:scale-90"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-3.5 bg-gray-50 text-gray-300 rounded-[20px] hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Nova Conquista</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">O que você quer conquistar?</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Viagem, Carro, Notebook..."
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#151619]"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quanto você precisa poupar?</label>
                  <input 
                    type="number" 
                    required
                    placeholder="R$ 0,00"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#151619]"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Foto da Conquista (Opcional)</label>
                  <div className="space-y-3">
                    {newGoalImage ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
                        <img 
                          src={newGoalImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                        <button 
                          type="button"
                          onClick={() => setNewGoalImage('')}
                          className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 cursor-pointer hover:bg-gray-100 transition-colors group">
                          <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#151619] transition-colors" />
                          <span className="text-xs font-bold text-gray-500 uppercase">Escolher Foto</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                          />
                        </label>
                        <div className="flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6">
                          <Plus className="w-8 h-8 text-gray-300" />
                          <span className="text-xs font-bold text-gray-300 uppercase italic">Ou use link abaixo</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <input 
                        type="url" 
                        placeholder="Cole o link da imagem aqui..."
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-[#151619] text-sm"
                        value={newGoalImage.startsWith('data:') ? '' : newGoalImage}
                        onChange={(e) => setNewGoalImage(e.target.value)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Plus className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#151619] text-white py-4 rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-black/20 active:scale-95 transition-transform"
                >
                  Criar Conquista
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Editar Conquista</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Conquista</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#151619]"
                    value={editGoalTitle}
                    onChange={(e) => setEditGoalTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Valor Total (R$)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#151619]"
                    value={editGoalTarget}
                    onChange={(e) => setEditGoalTarget(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Link da Imagem (Opcional)</label>
                  <input 
                    type="url" 
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#151619] text-sm"
                    value={editGoalImage}
                    onChange={(e) => setEditGoalImage(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#151619] text-white py-4 rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-black/20 active:scale-95 transition-transform"
                >
                  Salvar Alterações
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDepositModalOpen(false);
                setSelectedGoalId(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Depositar</h2>
                <button onClick={() => setIsDepositModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quanto você quer guardar hoje?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">R$</span>
                    <input 
                      type="number" 
                      required
                      autoFocus
                      placeholder="0,00"
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-[#151619] text-xl font-bold"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val.toString())}
                      className="bg-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      + R$ {val}
                    </button>
                  ))}
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#151619] text-white py-4 rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-black/20 active:scale-95 transition-transform"
                >
                  Confirmar Depósito
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#151619] text-white py-2.5 px-8 flex justify-around items-center z-40 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.3)] max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <button 
            onClick={exportData}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          <span className="text-[7px] font-black uppercase tracking-tighter text-gray-500">Backup</span>
        </div>

        {showInstallBtn && (
          <div className="flex flex-col items-center">
            <button 
              onClick={handleInstallClick}
              className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <span className="text-[7px] font-black uppercase tracking-tighter text-blue-500">Instalar</span>
          </div>
        )}
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-white text-[#151619] p-3 rounded-full -mt-8 shadow-xl active:scale-90 transition-transform border-4 border-gray-50"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <label className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <input type="file" accept=".json" className="hidden" onChange={importData} />
          </label>
          <span className="text-[7px] font-black uppercase tracking-tighter text-gray-500">Restaurar</span>
        </div>
      </nav>
    </div>
  );
}
