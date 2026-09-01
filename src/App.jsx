import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InkParchmentBackground from './components/InkParchmentBackground';
import HomeScene from './components/HomeScene';
import DossierScene from './components/DossierScene';
import ArsenalScene from './components/ArsenalScene';
import TalentTreeScene from './components/TalentTreeScene';
import NeuralLabScene from './components/NeuralLabScene';
import RelayScene from './components/RelayScene';
import CharacterSwirlText from './components/CharacterSwirlText';
import VortexUpload from './components/VortexUpload';
import InkCharacterEngine from './components/InkCharacterEngine';
import ParchmentQuillCursor from './components/ParchmentQuillCursor';
import CommandPalette from './components/CommandPalette';
import { ArrowRight, ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react';

const questions = [
  { id: 'concept', text: "Tell me a bit about the digital health product or research project you have in mind." },
  { id: 'audience', text: "Who are the people or patient cohorts this is being built for?" },
  { id: 'differentiator', text: "What makes this approach unique, helpful, or clinically promising?" },
  { id: 'outcome', text: "What would a meaningful, successful outcome look like for you?" },
  { id: 'timeline', text: "What does your ideal timeline or development schedule look like?" },
  { id: 'budget', text: "What is your anticipated budget or resource allocation?" },
  { id: 'reference', text: "Are there any existing studies, apps, or design systems that inspire this idea?" },
];

const TOTAL_QUESTIONS = questions.length;

function App() {
  // Navigation State: 'home' | 'dossier' | 'arsenal' | 'skills' | 'lab' | 1..7 | 'upload' | 'done' | 'relay'
  const [step, setStep] = useState('home');
  const [currentInput, setCurrentInput] = useState('');
  const [answers, setAnswers] = useState({});
  const [extraCreatures, setExtraCreatures] = useState(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const inputRef = useRef(null);

  const isQuestionStep = typeof step === 'number' && step >= 1 && step <= TOTAL_QUESTIONS;

  useEffect(() => {
    if (isQuestionStep && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isQuestionStep, step]);

  const saveCurrentAnswer = useCallback(() => {
    if (isQuestionStep) {
      const qId = questions[step - 1].id;
      setAnswers((prev) => ({ ...prev, [qId]: currentInput }));
    }
  }, [isQuestionStep, step, currentInput]);

  // Global Keyboard shortcuts: ESC to Overview, Cmd+K / Ctrl+K for Directory Index
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else if (step !== 'home') {
          saveCurrentAnswer();
          setStep('home');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isCommandPaletteOpen, saveCurrentAnswer]);

  const goToQuestion = useCallback(
    (targetStep) => {
      saveCurrentAnswer();
      const targetQId = questions[targetStep - 1].id;
      setCurrentInput(answers[targetQId] || '');
      setStep(targetStep);
    },
    [saveCurrentAnswer, answers]
  );

  const goToMenu = useCallback(() => {
    saveCurrentAnswer();
    setCurrentInput('');
    setStep('home');
  }, [saveCurrentAnswer]);

  const handleNextQuestion = () => {
    if (isQuestionStep) {
      const qIndex = step - 1;
      const updatedAnswers = { ...answers, [questions[qIndex].id]: currentInput };
      setAnswers(updatedAnswers);

      if (step === TOTAL_QUESTIONS) {
        setCurrentInput('');
        setStep('upload');
      } else {
        const nextQId = questions[step].id;
        setCurrentInput(updatedAnswers[nextQId] || '');
        setStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (typeof step === 'number' && step >= 2 && step <= TOTAL_QUESTIONS) {
      const qIndex = step - 1;
      const updatedAnswers = { ...answers, [questions[qIndex].id]: currentInput };
      setAnswers(updatedAnswers);
      const prevQId = questions[step - 2].id;
      setCurrentInput(updatedAnswers[prevQId] || '');
      setStep((prev) => prev - 1);
    }
  };

  const handleCompleteUpload = (files) => {
    const finalData = { answers, files: files.map((f) => f.name) };
    console.log("Brief Submission:", finalData);
    setStep('done');
  };

  const handleMenuAction = (actionId, payload) => {
    switch (actionId) {
      case 'dossier':
      case 'arsenal':
      case 'skills':
      case 'lab':
      case 'relay':
        setStep(actionId);
        break;
      case 'selectQuestion': {
        const qNum = payload || 1;
        const targetQId = questions[qNum - 1].id;
        setCurrentInput(answers[targetQId] || '');
        setStep(qNum);
        break;
      }
      default:
        break;
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentInput('');
    setStep('home');
  };

  const handleSpawnCritter = () => {
    setExtraCreatures((prev) => Math.min(prev + 1, 6));
  };

  // Actions passed to Directory Index
  const navigationActions = {
    goToSection: (sec) => {
      saveCurrentAnswer();
      if (sec === 'quest') {
        const firstQId = questions[0].id;
        setCurrentInput(answers[firstQId] || '');
        setStep(1);
      } else {
        setStep(sec);
      }
    },
    selectProject: (projectName) => {
      saveCurrentAnswer();
      setCurrentInput(`I'd love to collaborate on a project inspired by ${projectName}...`);
      setStep(1);
    },
    selectSkill: (skillName) => {
      saveCurrentAnswer();
      setCurrentInput(`I'd like to explore working together on ${skillName}...`);
      setStep(1);
    },
  };

  return (
    <div className="app-root">
      {/* Antique Calligraphy Quill & Footprints Trail Cursor */}
      <ParchmentQuillCursor />

      {/* Living 2D Grounded Wanderer Character Engine */}
      <InkCharacterEngine extraCreaturesCount={extraCreatures} />

      {/* Antique Parchment Background Canvas */}
      <InkParchmentBackground />

      {/* Directory Index / Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        navigationActions={navigationActions}
      />

      {/* Main Viewport Container */}
      <main className="scene-container">
        <div className="question-area">
          <AnimatePresence mode="wait">
            {step === 'home' && (
              <HomeScene
                key="home"
                onAction={handleMenuAction}
              />
            )}

            {step === 'dossier' && (
              <DossierScene
                key="dossier"
                onBack={goToMenu}
                onStartQuest={() => {
                  const firstQId = questions[0].id;
                  setCurrentInput(answers[firstQId] || '');
                  setStep(1);
                }}
                onInspectArsenal={() => setStep('arsenal')}
              />
            )}

            {step === 'arsenal' && (
              <ArsenalScene
                key="arsenal"
                onBack={goToMenu}
                onStartBriefWithProject={(projectName) => {
                  setCurrentInput(`I'd love to collaborate on a project inspired by ${projectName}...`);
                  setStep(1);
                }}
              />
            )}

            {step === 'skills' && (
              <TalentTreeScene
                key="skills"
                onBack={goToMenu}
                onStartBriefWithTalents={(talentName) => {
                  setCurrentInput(`I'd like to explore working together on ${talentName}...`);
                  setStep(1);
                }}
              />
            )}

            {step === 'lab' && (
              <NeuralLabScene
                key="lab"
                onBack={goToMenu}
                onSpawnCritter={handleSpawnCritter}
                creatureCount={extraCreatures}
              />
            )}

            {step === 'relay' && (
              <RelayScene
                key="relay"
                onBack={goToMenu}
                onStartBrief={() => {
                  const firstQId = questions[0].id;
                  setCurrentInput(answers[firstQId] || '');
                  setStep(1);
                }}
              />
            )}

            {isQuestionStep && (
              <CharacterSwirlText key={`q-${step}`} text={questions[step - 1].text} />
            )}

            {step === 'upload' && (
              <motion.div
                key="upload"
                className="upload-panel"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(8px)' }}
                transition={{ duration: 0.45 }}
                style={{ width: '100%' }}
              >
                <VortexUpload
                  onComplete={handleCompleteUpload}
                  onBackToMindmap={goToMenu}
                />
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                className="done-panel"
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <CheckCircle size={44} color="#8b1e1e" />
                <h2>Collaboration Brief Received</h2>
                <p>
                  Thank you for taking the time to share your ideas. James Taylor will read through your notes and reply personally.
                </p>
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="clean-secondary-btn" onClick={() => setStep('relay')}>
                    Send a Direct Note
                  </button>
                  <button className="clean-primary-btn" onClick={handleRestart}>
                    <RotateCcw size={14} /> Return to Overview
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls row for guided question steps */}
        <div className="controls-area">
          <AnimatePresence mode="wait">
            {isQuestionStep && (
              <motion.div
                key={`input-${step}`}
                className="input-row-wrapper"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, delay: 0.15 }}
              >
                <div className="ink-input-row">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Write your thoughts here..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentInput.trim()) handleNextQuestion();
                      if (e.key === 'Escape') goToMenu();
                    }}
                    aria-label={questions[step - 1].text}
                  />
                  <AnimatePresence>
                    {currentInput.trim() && (
                      <motion.button
                        className="ink-submit-btn"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleNextQuestion}
                        aria-label={step === TOTAL_QUESTIONS ? "Finish questions" : "Next question"}
                      >
                        <ArrowRight size={16} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation controls below input */}
                <div className="question-nav-row">
                  <button
                    className="question-nav-btn"
                    onClick={handlePrevQuestion}
                    disabled={step === 1}
                    aria-label="Previous question"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>

                  <div className="question-dots">
                    {questions.map((q, idx) => {
                      const qNum = idx + 1;
                      const isActive = qNum === step;
                      const isAnswered = !!answers[q.id]?.trim() || (isActive && currentInput.trim());
                      return (
                        <button
                          key={q.id}
                          className={`question-dot ${isActive ? 'question-dot--active' : ''} ${isAnswered ? 'question-dot--answered' : ''}`}
                          onClick={() => goToQuestion(qNum)}
                          aria-label={`Question ${qNum}`}
                          title={q.text}
                        />
                      );
                    })}
                  </div>

                  <button
                    className="question-nav-btn"
                    onClick={handleNextQuestion}
                    disabled={!currentInput.trim()}
                    aria-label="Next question"
                  >
                    {step === TOTAL_QUESTIONS ? 'Finish' : 'Next'} <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
