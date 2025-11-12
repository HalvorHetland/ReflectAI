import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Lightbulb, 
  MessageCircle, 
  Calendar, 
  Sparkles,
  TrendingUp,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  Brain,
  Target,
  BarChart3,
  Info,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Reflection {
  id: string;
  date: string;
  text: string;
  depth: number;
  questions: string[];
  answers?: string[];
  category?: string;
  initialDepth?: number;
  depthBreakdown?: {
    baseDepth: number;
    questionMarks: number;
    connections: number;
    answerBonus?: number;
    answerDetails?: {
      answeredCount: number;
      lengthBonus: number;
      connectionsBonus: number;
      questionsBonus: number;
    };
  };
}

// Hjelpefunksjoner for localStorage
const saveReflectionsToStorage = (reflections: Reflection[]) => {
  try {
    localStorage.setItem('reflectai-reflections', JSON.stringify(reflections));
  } catch (error) {
    console.error('Kunne ikke lagre refleksjoner:', error);
  }
};

const loadReflectionsFromStorage = (): Reflection[] => {
  try {
    const stored = localStorage.getItem('reflectai-reflections');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Kunne ikke laste refleksjoner:', error);
  }
  
  // Returner standard refleksjoner hvis ingen er lagret
  return [
    {
      id: "1",
      date: "2025-11-10",
      text: "Jeg lærte om fotosyntese i dag. Det var interessant hvordan planter omdanner sollys til energi. Jeg prøvde å forstå sammenhengen mellom klorofyll og lysabsorpsjon.",
      depth: 65,
      category: "Biologi",
      questions: [
        "Hvilke alternative forklaringer finnes for energioverføring i planter?",
        "Hvordan kan du koble denne kunnskapen til andre tema du har lært?",
        "Hva er de underliggende prinsippene som gjør fotosyntese mulig?",
      ],
      answers: [
        "Jeg tenker at det kan være flere prosesser involvert, som cellerespirarsjon. Fotosyntese er bare én del av energisyklusen.",
        "Dette minner meg om energiomsetning i kjemi - hvordan energi aldri går tapt, bare transformeres.",
      ]
    },
    {
      id: "2",
      date: "2025-11-09",
      text: "Studerte matematiske bevis i dag. Abstrakte konsepter er krevende, men jeg begynner å se mønstre.",
      depth: 72,
      category: "Matematikk",
      questions: [
        "Kan du forklare dette konseptet til noen uten fagbakgrunn?",
        "Hvilke antakelser ligger til grunn for dette beviset?",
        "Hvordan ville du teste om du virkelig forstår dette?",
      ],
    },
  ];
};

export default function ReflectAI() {
  const [reflection, setReflection] = useState("");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<string[]>([]);
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null);
  const [answerMode, setAnswerMode] = useState(false);
  const [depthIncrease, setDepthIncrease] = useState<number | null>(null);

  // Last inn refleksjoner fra localStorage når komponenten lastes
  useEffect(() => {
    const loadedReflections = loadReflectionsFromStorage();
    setReflections(loadedReflections);
  }, []);

  // Eksporter refleksjoner til JSON-fil
  const exportReflections = () => {
    const dataStr = JSON.stringify(reflections, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reflectai-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Importer refleksjoner fra JSON-fil
  const importReflections = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (Array.isArray(imported)) {
            setReflections(imported);
            saveReflectionsToStorage(imported);
            alert(`Importerte ${imported.length} refleksjoner!`);
          } else {
            alert('Ugyldig filformat. Filen må inneholde en array med refleksjoner.');
          }
        } catch (error) {
          alert('Kunne ikke lese filen. Kontroller at det er en gyldig JSON-fil.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    event.target.value = '';
  };

  // Slett en refleksjon
  const deleteReflection = (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne refleksjonen? Dette kan ikke angres.')) {
      const updatedReflections = reflections.filter(r => r.id !== id);
      setReflections(updatedReflections);
      saveReflectionsToStorage(updatedReflections);
      
      // Lukk expandert visning hvis den slettede refleksjonen var åpen
      if (expandedReflection === id) {
        setExpandedReflection(null);
      }
    }
  };

  // Slett alle refleksjoner
  const deleteAllReflections = () => {
    if (confirm('Er du sikker på at du vil slette ALLE refleksjoner? Dette kan ikke angres.\n\nTip: Eksporter først en backup hvis du ønsker å beholde dataene.')) {
      setReflections([]);
      saveReflectionsToStorage([]);
      setExpandedReflection(null);
    }
  };

  const questionBank = [
    "Hvordan vet du at dette stemmer?",
    "Hvilke kilder kunne utfordret dette synet?",
    "Kan du gi et konkret eksempel på dette?",
    "Hvilke alternative forklaringer finnes?",
    "Hvordan henger dette sammen med det du lærte tidligere?",
    "Hvilke underliggende antakelser har du gjort?",
    "Kan du forklare dette til noen uten fagbakgrunn?",
    "Hva overrasket deg mest, og hvorfor?",
    "Hvilke spørsmål sitter du igjen med?",
    "Hvordan ville du teste om du virkelig forstår dette?",
    "Hvilke praktiske anvendelser kan denne kunnskapen ha?",
    "Hva er de underliggende prinsippene her?",
  ];

  const analyzeReflection = () => {
    if (!reflection.trim()) return;

    // Simple depth calculation based on length and complexity
    const baseDepth = Math.min(reflection.length / 3, 40);
    const questionMarks = (reflection.match(/\?/g) || []).length * 5;
    const connections = (reflection.match(/\b(fordi|derfor|sammenheng|kobling|relatert)\b/gi) || []).length * 3;
    const depth = Math.min(Math.round(baseDepth + questionMarks + connections), 95);

    const selectedQuestions = [...questionBank]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const newReflection: Reflection = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      text: reflection,
      depth,
      questions: selectedQuestions,
      initialDepth: depth,
      depthBreakdown: {
        baseDepth: Math.round(baseDepth),
        questionMarks: Math.round(questionMarks),
        connections: Math.round(connections),
      },
    };

    const updatedReflections = [newReflection, ...reflections];
    setReflections(updatedReflections);
    saveReflectionsToStorage(updatedReflections);
    setAiQuestions(selectedQuestions);
    setCurrentAnswers(["", "", ""]);
    setShowQuestions(true);
    setAnswerMode(true);
    setReflection("");
  };

  const saveAnswers = () => {
    if (reflections.length > 0) {
      const filledAnswers = currentAnswers.filter(a => a.trim() !== "");
      
      // Calculate depth bonus based on answers
      let depthBonus = 0;
      filledAnswers.forEach(answer => {
        // Base bonus for answering (5 points per question)
        depthBonus += 5;
        
        // Bonus for longer, more thoughtful answers
        const answerLength = answer.length;
        if (answerLength > 100) depthBonus += 5;
        if (answerLength > 200) depthBonus += 5;
        
        // Bonus for connecting words (critical thinking indicators)
        const connections = (answer.match(/\b(fordi|derfor|sammenheng|kobling|relatert|men|imidlertid|likevel|derimot)\b/gi) || []).length;
        depthBonus += Math.min(connections * 2, 10);
        
        // Bonus for questions (shows deeper inquiry)
        const questions = (answer.match(/\?/g) || []).length;
        depthBonus += Math.min(questions * 3, 9);
      });
      
      const updatedReflections = [...reflections];
      const currentReflection = updatedReflections[0];
      const initialDepth = (currentReflection as any).initialDepth || currentReflection.depth;
      const newDepth = Math.min(initialDepth + depthBonus, 99);
      
      updatedReflections[0] = {
        ...currentReflection,
        answers: filledAnswers,
        depth: newDepth,
        depthBreakdown: {
          baseDepth: currentReflection.depthBreakdown?.baseDepth || 0,
          questionMarks: currentReflection.depthBreakdown?.questionMarks || 0,
          connections: currentReflection.depthBreakdown?.connections || 0,
          answerBonus: depthBonus,
          answerDetails: {
            answeredCount: filledAnswers.length,
            lengthBonus: filledAnswers.reduce((acc, a) => acc + (a.length > 100 ? 5 : 0) + (a.length > 200 ? 5 : 0), 0),
            connectionsBonus: filledAnswers.reduce((acc, a) => acc + Math.min((a.match(/\b(fordi|derfor|sammenheng|kobling|relatert|men|imidlertid|likevel|derimot)\b/gi) || []).length * 2, 10), 0),
            questionsBonus: filledAnswers.reduce((acc, a) => acc + Math.min((a.match(/\?/g) || []).length * 3, 9), 0),
          }
        }
      };
      
      setReflections(updatedReflections);
      saveReflectionsToStorage(updatedReflections);
      setAnswerMode(false);
      setShowQuestions(false);
      setDepthIncrease(depthBonus);
    }
  };

  const avgDepth = reflections.length
    ? Math.round(reflections.reduce((acc, r) => acc + r.depth, 0) / reflections.length)
    : 0;

  const streakDays = 12; // Mock streak
  const totalQuestions = reflections.reduce((acc, r) => acc + r.questions.length, 0);

  const getDepthLabel = (depth: number) => {
    if (depth >= 80) return { label: "Dyp refleksjon", color: "text-[#6b5d4f]" };
    if (depth >= 60) return { label: "God refleksjon", color: "text-[#8b7d6b]" };
    if (depth >= 40) return { label: "Moderat refleksjon", color: "text-[#a39887]" };
    return { label: "Overfladisk", color: "text-[#b5a99a]" };
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#f5f3f0] via-[#faf9f7] to-[#f0ece8] border-b border-[#e8e5e1]">
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/80 border border-[#e8e5e1] shadow-sm">
              <Lightbulb className="w-4 h-4 text-[#8b7d6b]" />
              <span className="text-[#6b5d4f] text-sm">Metakognisjon & Dybdelæring</span>
            </div>
            
            <h1 className="text-[#2d2721] mb-4 text-4xl md:text-5xl">ReflectAI</h1>
            <p className="text-[#6b5d4f] text-lg md:text-xl max-w-2xl">
              Tren din evne til kritisk tenkning og metakognisjon. 
              La AI-en guide deg til dypere forståelse av din egen læring.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-6 border border-[#e8e5e1] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#f5f3f0] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[#8b7d6b]" />
                </div>
                <div className="text-[#2d2721] text-3xl">{reflections.length}</div>
              </div>
              <p className="text-[#8b7d6b] text-sm">Refleksjoner</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e8e5e1] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#f5f3f0] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#8b7d6b]" />
                </div>
                <div className="text-[#2d2721] text-3xl">{avgDepth}%</div>
              </div>
              <p className="text-[#8b7d6b] text-sm">Snitt dybde</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e8e5e1] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#f5f3f0] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#d4a574]" />
                </div>
                <div className="text-[#2d2721] text-3xl">{streakDays}</div>
              </div>
              <p className="text-[#8b7d6b] text-sm">Dagers streak</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e8e5e1] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#f5f3f0] flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#8b7d6b]" />
                </div>
                <div className="text-[#2d2721] text-3xl">{totalQuestions}</div>
              </div>
              <p className="text-[#8b7d6b] text-sm">Spørsmål utforsket</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-12">
        {/* New Reflection Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#e8e5e1] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-[#8b7d6b]" />
              <h2 className="text-[#2d2721]">Ny refleksjon</h2>
            </div>
            <p className="text-[#8b7d6b] text-sm mb-8">
              Skriv ned hva du lærte i dag. Jo mer detaljert og selvstendig du reflekterer, 
              desto bedre spørsmål vil AI-en kunne stille.
            </p>

            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Beskriv hva du lærte i dag. Prøv å utforske hvorfor det var interessant, hvilke spørsmål du sitter igjen med, og hvordan det henger sammen med tidligere kunnskap..."
              className="min-h-[200px] bg-[#faf9f7] border-[#e8e5e1] text-[#2d2721] placeholder:text-[#b5a99a] focus:bg-white focus:border-[#c4b5a0] transition-all resize-none mb-6 rounded-2xl"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-[#8b7d6b]">
                {reflection.length > 0 && (
                  <span>{reflection.length} tegn</span>
                )}
              </div>
              <Button
                onClick={analyzeReflection}
                className="bg-[#2d2721] hover:bg-[#3d3731] text-white rounded-xl px-8 transition-all"
                disabled={!reflection.trim()}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Analyser refleksjon
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Backup and Data Management */}
        {reflections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-[#f8f6f3] to-[#faf9f7] rounded-2xl p-6 border border-[#e8e5e1]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#2d2721] mb-1">Data og backup</h3>
                  <p className="text-[#8b7d6b] text-sm">
                    Dine refleksjoner lagres lokalt i nettleseren. Ta backup for sikkerhet.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={exportReflections}
                    variant="outline"
                    className="border-[#e8e5e1] text-[#6b5d4f] hover:bg-[#f5f3f0] hover:border-[#c4b5a0] rounded-xl"
                  >
                    Eksporter
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importReflections}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="import-reflections"
                    />
                    <Button
                      variant="outline"
                      className="border-[#e8e5e1] text-[#6b5d4f] hover:bg-[#f5f3f0] hover:border-[#c4b5a0] rounded-xl"
                    >
                      Importer
                    </Button>
                  </div>
                  <Button
                    onClick={deleteAllReflections}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Slett alle
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Questions Section */}
        <AnimatePresence>
          {showQuestions && aiQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-br from-[#f5f3f0] to-[#faf9f7] rounded-3xl p-8 md:p-10 border border-[#e8e5e1]">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="w-6 h-6 text-[#8b7d6b]" />
                  <h2 className="text-[#2d2721]">Refleksjonsspørsmål fra AI</h2>
                </div>
                <p className="text-[#6b5d4f] text-sm mb-8">
                  Disse spørsmålene er designet for å utfordre deg til dypere tenkning. 
                  Ta deg tid til å svare grundig.
                </p>

                {/* Depth increase notification */}
                <AnimatePresence>
                  {depthIncrease !== null && depthIncrease > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mb-6"
                    >
                      <div className="bg-white rounded-2xl p-5 border border-[#e8e5e1] shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b7d6b] to-[#6b5d4f] flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#2d2721] mb-1">Flott jobbet!</p>
                            <p className="text-[#8b7d6b] text-sm">
                              Dine svar økte refleksjonsdybden med <span className="text-[#6b5d4f]">+{depthIncrease}%</span>
                            </p>
                          </div>
                          <button
                            onClick={() => setDepthIncrease(null)}
                            className="text-[#b5a99a] hover:text-[#8b7d6b] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-6">
                  {aiQuestions.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-white rounded-2xl p-6 border border-[#e8e5e1] shadow-sm"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#2d2721] text-white flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-[#2d2721] pt-1">{q}</p>
                      </div>

                      {answerMode && (
                        <Textarea
                          value={currentAnswers[i] || ""}
                          onChange={(e) => {
                            const newAnswers = [...currentAnswers];
                            newAnswers[i] = e.target.value;
                            setCurrentAnswers(newAnswers);
                          }}
                          placeholder="Skriv ditt svar her..."
                          className="min-h-[100px] bg-[#faf9f7] border-[#e8e5e1] text-[#2d2721] placeholder:text-[#b5a99a] focus:bg-white focus:border-[#c4b5a0] transition-all resize-none rounded-xl"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {answerMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex justify-end gap-4"
                  >
                    <Button
                      onClick={() => {
                        setAnswerMode(false);
                        setShowQuestions(false);
                      }}
                      className="bg-white hover:bg-[#f5f3f0] text-[#2d2721] border border-[#e8e5e1] rounded-xl px-6"
                    >
                      Hopp over
                    </Button>
                    <Button
                      onClick={saveAnswers}
                      className="bg-[#2d2721] hover:bg-[#3d3731] text-white rounded-xl px-8"
                      disabled={currentAnswers.every(a => !a.trim())}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Lagre svar
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous Reflections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[#2d2721]">Tidligere refleksjoner</h2>
            <div className="text-sm text-[#8b7d6b]">
              {reflections.length} {reflections.length === 1 ? 'refleksjon' : 'refleksjoner'}
            </div>
          </div>

          <div className="space-y-6">
            {reflections.map((r, index) => {
              const isExpanded = expandedReflection === r.id;
              const depthInfo = getDepthLabel(r.depth);

              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-3xl border border-[#e8e5e1] hover:border-[#d4cfc8] transition-all shadow-sm hover:shadow-md"
                >
                  {/* Header */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3 text-[#8b7d6b] text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(r.date).toLocaleDateString('nb-NO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {r.category && (
                            <span className="px-3 py-1 rounded-full bg-[#f5f3f0] text-[#6b5d4f] text-sm">
                              {r.category}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full bg-[#f5f3f0] text-sm ${depthInfo.color}`}>
                            {r.depth}% • {depthInfo.label}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteReflection(r.id);
                          }}
                          className="p-2 text-[#b5a99a] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Slett refleksjon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[#2d2721] leading-relaxed mb-6">{r.text}</p>

                    {/* Depth Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="text-[#8b7d6b]">Refleksjonsdybde</span>
                        <span className={depthInfo.color}>{r.depth}%</span>
                      </div>
                      <div className="h-2 bg-[#f5f3f0] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${r.depth}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-[#b5a99a] via-[#8b7d6b] to-[#6b5d4f] rounded-full"
                        />
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <Button
                      onClick={() => setExpandedReflection(isExpanded ? null : r.id)}
                      className="w-full bg-[#f5f3f0] hover:bg-[#ebe9e5] text-[#2d2721] rounded-xl transition-all border border-[#e8e5e1]"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Skjul detaljer
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Vis spørsmål og svar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 pt-0 space-y-6">
                          {/* Depth Breakdown */}
                          {r.depthBreakdown && (
                            <div className="bg-[#faf9f7] rounded-2xl p-6 border border-[#e8e5e1]">
                              <div className="flex items-center gap-2 mb-6">
                                <BarChart3 className="w-5 h-5 text-[#8b7d6b]" />
                                <h3 className="text-[#2d2721]">Dybdeanalyse</h3>
                              </div>

                              <div className="space-y-4">
                                {/* Initial Analysis */}
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-[#6b5d4f] text-sm">Innledende analyse</span>
                                    <span className="text-[#2d2721]">{r.initialDepth || r.depth}%</span>
                                  </div>
                                  
                                  <div className="space-y-2 ml-4">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#8b7d6b]">Tekstlengde & detaljer</span>
                                      <span className="text-[#6b5d4f]">{r.depthBreakdown.baseDepth}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#8b7d6b]">Spørsmål i teksten</span>
                                      <span className="text-[#6b5d4f]">+{r.depthBreakdown.questionMarks}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#8b7d6b]">Koblingsord (fordi, derfor, etc.)</span>
                                      <span className="text-[#6b5d4f]">+{r.depthBreakdown.connections}%</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Answer Bonus */}
                                {r.depthBreakdown.answerBonus !== undefined && r.depthBreakdown.answerBonus > 0 && (
                                  <div className="pt-4 border-t border-[#e8e5e1]">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[#6b5d4f] text-sm">Bonus fra refleksjonssvar</span>
                                      <span className="text-[#2d2721]">+{r.depthBreakdown.answerBonus}%</span>
                                    </div>
                                    
                                    {r.depthBreakdown.answerDetails && (
                                      <div className="space-y-2 ml-4">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-[#8b7d6b]">Antall svar ({r.depthBreakdown.answerDetails.answeredCount} × 5%)</span>
                                          <span className="text-[#6b5d4f]">+{r.depthBreakdown.answerDetails.answeredCount * 5}%</span>
                                        </div>
                                        {r.depthBreakdown.answerDetails.lengthBonus > 0 && (
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#8b7d6b]">Grundige svar (100+ / 200+ tegn)</span>
                                            <span className="text-[#6b5d4f]">+{r.depthBreakdown.answerDetails.lengthBonus}%</span>
                                          </div>
                                        )}
                                        {r.depthBreakdown.answerDetails.connectionsBonus > 0 && (
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#8b7d6b]">Kritisk tenkning (koblingsord)</span>
                                            <span className="text-[#6b5d4f]">+{r.depthBreakdown.answerDetails.connectionsBonus}%</span>
                                          </div>
                                        )}
                                        {r.depthBreakdown.answerDetails.questionsBonus > 0 && (
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#8b7d6b]">Videre utforskning (spørsmål)</span>
                                            <span className="text-[#6b5d4f]">+{r.depthBreakdown.answerDetails.questionsBonus}%</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Total */}
                                <div className="pt-4 border-t-2 border-[#d4cfc8]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#2d2721]">Total refleksjonsdybde</span>
                                    <span className="text-[#2d2721] text-xl">{r.depth}%</span>
                                  </div>
                                </div>

                                {/* Info box */}
                                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#e8e5e1]">
                                  <Info className="w-5 h-5 text-[#8b7d6b] flex-shrink-0 mt-0.5" />
                                  <div className="text-sm text-[#6b5d4f] leading-relaxed">
                                    <p className="mb-2">
                                      <span className="text-[#2d2721]">Hvordan beregnes dybden?</span>
                                    </p>
                                    <p className="mb-1">• Lengre, mer detaljerte refleksjoner gir høyere grunnpoeng</p>
                                    <p className="mb-1">• Spørsmål i refleksjonen viser nysgjerrighet (+5% per spørsmål)</p>
                                    <p className="mb-1">• Koblingsord viser sammenhengtenkning (+3% per ord)</p>
                                    <p>• Grundige svar på AI-spørsmål kan doble dybden!</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Questions */}
                          <div className="bg-[#faf9f7] rounded-2xl p-6 border border-[#e8e5e1]">
                            <div className="flex items-center gap-2 mb-6">
                              <Lightbulb className="w-5 h-5 text-[#8b7d6b]" />
                              <h3 className="text-[#2d2721]">Refleksjonsspørsmål</h3>
                            </div>

                            <div className="space-y-6">
                              {r.questions.map((q: string, qi: number) => (
                                <div key={qi} className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#2d2721] text-white flex items-center justify-center flex-shrink-0 text-sm mt-1">
                                      {qi + 1}
                                    </div>
                                    <p className="text-[#2d2721] leading-relaxed pt-1">{q}</p>
                                  </div>

                                  {r.answers && r.answers[qi] && (
                                    <div className="ml-9 pl-6 border-l-2 border-[#e8e5e1]">
                                      <p className="text-[#6b5d4f] text-sm leading-relaxed italic">
                                        {r.answers[qi]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {(!r.answers || r.answers.length === 0) && (
                                <div className="text-center py-6">
                                  <p className="text-[#b5a99a] text-sm italic">
                                    Ingen svar lagt til ennå
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Empty State */}
        {reflections.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-[#f5f3f0] flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-10 h-10 text-[#b5a99a]" />
            </div>
            <h3 className="text-[#2d2721] mb-2">Ingen refleksjoner ennå</h3>
            <p className="text-[#8b7d6b] max-w-md mx-auto">
              Start din læringsreise ved å skrive din første refleksjon ovenfor
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}