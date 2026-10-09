import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';

interface CalculatorModalProps {
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Optionally add number keys here
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleNum = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    const currentVal = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(currentVal);
    } else if (operator && !waitingForNewValue) {
      const result = calculate(prevVal, currentVal, operator);
      setDisplay(String(result));
      setPrevVal(result);
    }
    setOperator(op);
    setWaitingForNewValue(true);
    setEquation(`${prevVal !== null && !waitingForNewValue ? (operator ? calculate(prevVal, currentVal, operator) : currentVal) : currentVal} ${op}`);
  };

  const calculate = (a: number, b: number, op: string) => {
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? 0 : a / b;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (!operator || prevVal === null) return;
    const currentVal = parseFloat(display);
    const result = calculate(prevVal, currentVal, operator);
    setDisplay(String(result));
    setPrevVal(null);
    setOperator(null);
    setWaitingForNewValue(true);
    setEquation('');
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setPrevVal(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
      <div className="bg-theme-white rounded-2xl shadow-2xl max-w-xs w-full overflow-hidden border border-theme-gray-border animate-in zoom-in duration-200">
        <div className="bg-theme-navy text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Calculator className="w-5 h-5 text-theme-orange" /> Calculator
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-right shadow-inner mb-4">
            <div className="text-xs text-slate-400 h-4 font-mono">{equation}</div>
            <div className="text-3xl font-mono font-bold text-theme-navy truncate tracking-tight">{display}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={clear} className="col-span-2 py-3 bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold rounded-lg transition-colors shadow-xs">C</button>
            <button onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : '0')} className="py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors shadow-xs">DEL</button>
            <button onClick={() => handleOp('/')} className="py-3 bg-theme-blue/10 hover:bg-theme-blue/20 text-theme-blue font-bold rounded-lg transition-colors shadow-xs">÷</button>
            
            <button onClick={() => handleNum('7')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">7</button>
            <button onClick={() => handleNum('8')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">8</button>
            <button onClick={() => handleNum('9')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">9</button>
            <button onClick={() => handleOp('*')} className="py-3 bg-theme-blue/10 hover:bg-theme-blue/20 text-theme-blue font-bold rounded-lg transition-colors shadow-xs">×</button>
            
            <button onClick={() => handleNum('4')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">4</button>
            <button onClick={() => handleNum('5')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">5</button>
            <button onClick={() => handleNum('6')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">6</button>
            <button onClick={() => handleOp('-')} className="py-3 bg-theme-blue/10 hover:bg-theme-blue/20 text-theme-blue font-bold rounded-lg transition-colors shadow-xs">-</button>
            
            <button onClick={() => handleNum('1')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">1</button>
            <button onClick={() => handleNum('2')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">2</button>
            <button onClick={() => handleNum('3')} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">3</button>
            <button onClick={() => handleOp('+')} className="py-3 bg-theme-blue/10 hover:bg-theme-blue/20 text-theme-blue font-bold rounded-lg transition-colors shadow-xs">+</button>
            
            <button onClick={() => handleNum('0')} className="col-span-2 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">0</button>
            <button onClick={() => { if(!display.includes('.')) handleNum('.'); }} className="py-3 bg-white hover:bg-slate-100 border border-slate-200 text-theme-navy font-bold rounded-lg shadow-sm transition-colors">.</button>
            <button onClick={handleEqual} className="py-3 bg-theme-teal hover:bg-theme-teal/90 text-white font-bold rounded-lg shadow-md transition-colors">=</button>
          </div>
        </div>
      </div>
    </div>
  );
};
