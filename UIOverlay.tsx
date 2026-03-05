import { useState } from 'react';
import { useGameStore } from './store';
import { nameConstellation, generateEpilogue } from './gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

export const UIOverlay = () => {
  const { gameState, selectedNodes, clearSelection, setGameState, addConstellation, constellations, setEpilogue, epilogue } = useGameStore();
  const [isNaming, setIsNaming] = useState(false);
  const [namingResult, setNamingResult] = useState<{name: string, description: string} | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const handleForge = async () => {
    if (selectedNodes.length < 2) return;
    setIsNaming(true);
    setGameState('naming');
    try {
      const words = selectedNodes.map(n => n.word);
      const result = await nameConstellation(words);
      setNamingResult(result);
    } catch (error) {
      console.error(error);
      setNamingResult({ name: "未知星系", description: "宇宙的深处传来了无法解析的信号。" });
    } finally {
      setIsNaming(false);
    }
  };

  const handleConfirmConstellation = () => {
    if (namingResult) {
      addConstellation(namingResult.name, namingResult.description);
      setNamingResult(null);
    }
  };

  const handleEndJourney = async () => {
    setIsEnding(true);
    setGameState('ending');
    try {
      const consts = constellations.map(c => ({ name: c.name, words: c.nodes.map(n => n.word) }));
      const result = await generateEpilogue(consts);
      setEpilogue(result || "旅程结束，星辰归位。你在宇宙中留下的印记将永远闪耀。");
    } catch (error) {
      console.error(error);
      setEpilogue("旅程结束，星辰归位。你在宇宙中留下的印记将永远闪耀。");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-[200]">
      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-auto cursor-pointer bg-black/40 backdrop-blur-[2px]"
            onClick={() => useGameStore.getState().viewSphere()}
          >
            <h1 className="text-6xl font-serif tracking-[0.2em] mb-4 font-light">信号彼端</h1>
            <p className="text-xl tracking-[0.5em] uppercase opacity-50 font-mono">Beyond Signals</p>
            <motion.p 
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
              className="mt-24 text-sm tracking-widest opacity-70"
            >
              点击任意处进入
            </motion.p>
          </motion.div>
        )}

        {gameState === 'viewing' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-white pointer-events-none"
          >
            <motion.p 
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
              className="text-sm tracking-widest opacity-70"
            >
              点击任意处打散星辰
            </motion.p>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="text-white/50 text-sm tracking-widest">
                已发现星座: {constellations.length}
              </div>
              <button 
                onClick={handleEndJourney}
                className="pointer-events-auto px-6 py-2 border border-white/20 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm tracking-widest backdrop-blur-sm"
              >
                结束旅程
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              {selectedNodes.length > 0 && (
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10">
                  <div className="flex gap-3">
                    {selectedNodes.map((n, i) => (
                      <div key={n.id} className="flex items-center">
                        <span className="text-white text-lg tracking-widest">{n.word}</span>
                        {i < selectedNodes.length - 1 && <span className="text-white/30 mx-3">-</span>}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={clearSelection}
                    className="pointer-events-auto ml-4 p-1 rounded-full hover:bg-white/20 text-white/50 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {selectedNodes.length >= 2 && (
                <button 
                  onClick={handleForge}
                  className="pointer-events-auto flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full hover:scale-105 transition-all font-medium tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Sparkles size={18} />
                  铸造星座
                </button>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'naming' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            {isNaming ? (
              <div className="flex flex-col items-center text-white">
                <motion.div 
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-12 h-12 border-t-2 border-white rounded-full mb-6"
                />
                <p className="tracking-widest text-lg opacity-80">宇宙正在聆听你的信号...</p>
              </div>
            ) : namingResult ? (
              <div className="max-w-md w-full bg-black/80 border border-white/20 p-10 rounded-3xl text-center text-white shadow-2xl">
                <h2 className="text-3xl font-serif mb-2">{namingResult.name}</h2>
                <div className="w-12 h-[1px] bg-white/30 mx-auto mb-6" />
                <p className="text-white/70 leading-relaxed mb-8 text-sm tracking-wide">{namingResult.description}</p>
                <button 
                  onClick={handleConfirmConstellation}
                  className="px-8 py-3 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all tracking-widest text-sm"
                >
                  将其铭记于星空
                </button>
              </div>
            ) : null}
          </motion.div>
        )}

        {gameState === 'ending' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center text-white pointer-events-auto bg-black/50 backdrop-blur-[2px]"
          >
            <div className="flex flex-col items-center">
              <p className="tracking-[0.5em] text-xl opacity-80 mb-4">星辰归位</p>
              <p className="tracking-widest text-sm opacity-50">正在生成你的宇宙结语...</p>
            </div>
          </motion.div>
        )}

        {gameState === 'epilogue' && epilogue && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-auto"
          >
            <div className="max-w-2xl w-full p-12 text-center text-white">
              <h2 className="text-2xl font-serif tracking-[0.3em] mb-8 opacity-90">旅程终点</h2>
              <div className="w-px h-16 bg-gradient-to-b from-white/50 to-transparent mx-auto mb-8" />
              <p className="text-lg leading-loose tracking-wide opacity-80 font-serif whitespace-pre-line">
                {epilogue}
              </p>
              <div className="w-px h-16 bg-gradient-to-t from-white/50 to-transparent mx-auto mt-8 mb-12" />
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all tracking-widest text-sm"
              >
                再次仰望星空
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
