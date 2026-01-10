import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import "./App.css";

// ==================== TYPES & INTERFACES ====================
const QuizStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// ==================== MOCK DATA ====================
const etudiants = [
  { id: 1, name: "mohamedbouzu", plan: "group", user: "alice123", password: "password123" },
  { id: 2, name: "soufianelasmar", plan: "individual", user: "bob456", password: "password456" },
  { id: 3, name: "Charlie", plan: "group", user: "charlie789", password: "password789" }
];

const lquizes = [
  {
    id: 1,
    titre: "Quiz Vocabulaire A1",
    cours: "Vocabulaire de base",
    date: "2024-01-15",
    img: "assets/img/quiz/vocab.jpg",
    description: "Quiz sur le vocabulaire allemand de niveau A1. Testez vos connaissances sur les mots de base.",
    plan: "group",
    duree: 10,
    questions: [
      { 
        id: 1, 
        question: "Comment dit-on 'bonjour' en allemand ?", 
        options: ["Hallo", "Guten Tag", "Auf Wiedersehen", "Danke"], 
        answer: "Hallo",
        explanation: "'Hallo' est la forme informelle de salutation en allemand."
      },
      { 
        id: 2, 
        question: "Que signifie 'Buch' ?", 
        options: ["Livre", "Stylo", "Table", "Chaise"], 
        answer: "Livre",
        explanation: "'Buch' signifie 'livre' en allemand."
      }
    ]
  },
  {
    id: 2,
    titre: "Quiz Grammaire B1",
    cours: "Grammaire avancée",
    date: "2024-01-20",
    img: "assets/img/quiz/grammar.jpg",
    description: "Quiz sur la grammaire allemande de niveau B1. Articles, conjugaisons et structures complexes.",
    plan: "individual",
    duree: 15,
    questions: [
      { 
        id: 1, 
        question: "Quel est l'article défini pour 'Haus' (neutre) ?", 
        options: ["der", "die", "das", "den"], 
        answer: "das",
        explanation: "'Haus' est un nom neutre, donc l'article défini est 'das'."
      },
      { 
        id: 2, 
        question: "Comment conjugue-t-on 'sein' (être) à la 3ème personne du singulier ?", 
        options: ["bin", "bist", "ist", "sind"], 
        answer: "ist",
        explanation: "'sein' se conjugue : ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie sind."
      }
    ]
  }
];

const lseance = [
  {
    id: 1,
    titre: "Introduction à l'allemand",
    cours: 'A1 Débutant',
    date: "2024-03-15 10:00",
    description: "Session d'introduction aux bases de l'allemand : alphabet, prononciation et salutations.",
    link: "https://zoom.us/j/123456789",
    plan: "group",
    call_link: {
      platform: "Zoom",
      meeting_id: "123 456 7890",
      password: "deutsch123",
      join_url: "https://zoom.us/j/123456789?pwd=deutsch123"
    }
  },
  {
    id: 2,
    titre: "Les articles définis",
    cours: 'A1 Débutant',
    date: "2024-03-17 10:00",
    description: "Apprentissage des articles définis en allemand : der, die, das et leurs usages.",
    link: "https://zoom.us/j/987654321",
    plan: "group",
    call_link: {
      platform: "Zoom",
      meeting_id: "987 654 3210",
      password: "deutsch456",
      join_url: "https://zoom.us/j/987654321?pwd=deutsch456"
    }
  }
];

// ==================== CONTEXTS ====================
const AuthContext = React.createContext();

// ==================== COMPONENTS ====================

// Quiz Results Component
const QuizResults = ({ quiz, results, onRetry, onClose }) => {
  return (
    <div className="quiz-results-screen">
      <div className="quiz-header">
        <h2>Résultats du Quiz</h2>
        <button className="close-quiz-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="results-summary">
        <div className="score-circle">
          <div className="score-value">{results.percentage}%</div>
          <div className="score-label">Score</div>
        </div>
        
        <div className="score-details">
          <h3>{quiz.titre}</h3>
          <div className="score-breakdown">
            <div className="breakdown-item correct">
              <span>Bonnes réponses</span>
              <span>{results.correct}/{results.total}</span>
            </div>
            <div className="breakdown-item wrong">
              <span>Mauvaises réponses</span>
              <span>{results.total - results.correct}/{results.total}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="results-details">
        <h4>Détail des réponses</h4>
        {quiz.questions.map((q, index) => {
          const userAnswer = results.answers[q.id];
          const isCorrect = userAnswer === q.answer;
          
          return (
            <div key={q.id} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="review-question">
                <span className="question-number">Q{index + 1}:</span>
                <span className="question-text">{q.question}</span>
              </div>
              <div className="review-answers">
                <div className="answer-section">
                  <span className="answer-label">Votre réponse:</span>
                  <span className={`user-answer ${isCorrect ? 'correct' : 'wrong'}`}>
                    {userAnswer || 'Non répondue'}
                  </span>
                </div>
                <div className="answer-section">
                  <span className="answer-label">Bonne réponse:</span>
                  <span className="correct-answer">{q.answer}</span>
                </div>
                {q.explanation && (
                  <div className="explanation">
                    <span className="explanation-label">Explication:</span>
                    <span className="explanation-text">{q.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="results-actions">
        <button className="retry-btn" onClick={onRetry}>
          <i className="lni lni-reload"></i> Recommencer
        </button>
        <button className="close-results-btn" onClick={onClose}>
          <i className="lni lni-checkmark-circle"></i> Terminer
        </button>
      </div>
    </div>
  );
};

// Quiz Component
const Quiz = ({ quiz, onClose, onComplete, initialStatus = QuizStatus.NOT_STARTED, initialResults = null }) => {
  const [status, setStatus] = useState(initialStatus);
  const [results, setResults] = useState(initialResults);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.duree * 60);
  const timerRef = useRef(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  useEffect(() => {
    if (status === QuizStatus.IN_PROGRESS && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && status === QuizStatus.IN_PROGRESS) {
      finishQuiz();
    }

    return () => clearInterval(timerRef.current);
  }, [status, timeLeft]);

  const startQuiz = () => {
    setStatus(QuizStatus.IN_PROGRESS);
    setTimeLeft(quiz.duree * 60);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSelect = (questionId, answer) => {
    if (status !== QuizStatus.IN_PROGRESS) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (status !== QuizStatus.IN_PROGRESS) return;
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (status !== QuizStatus.IN_PROGRESS) return;
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    clearInterval(timerRef.current);
    const score = calculateScore();
    setResults(score);
    setStatus(QuizStatus.COMPLETED);
    
    if (onComplete) {
      onComplete(score);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.answer) {
        correct++;
      }
    });
    
    return {
      quizId: quiz.id,
      titre: quiz.titre,
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
      answers: selectedAnswers
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Si on a des résultats existants, montrer les résultats
  if (results && status === QuizStatus.NOT_STARTED) {
    return (
      <QuizResults 
        quiz={quiz}
        results={results}
        onRetry={() => {
          setResults(null);
          startQuiz();
        }}
        onClose={onClose}
      />
    );
  }

  // Écran d'accueil du quiz
  if (status === QuizStatus.NOT_STARTED) {
    return (
      <div className="quiz-start-screen">
        <div className="quiz-header">
          <h2>{quiz.titre}</h2>
          <button className="close-quiz-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="quiz-info-card">
          <div className="quiz-info-section">
            <h3>Instructions</h3>
            <ul>
              <li>Ce quiz contient {totalQuestions} questions</li>
              <li>Durée : {quiz.duree} minutes</li>
              <li>Vous pouvez naviguer entre les questions</li>
              <li>Le timer commencera quand vous cliquerez sur "Commencer"</li>
              <li>Vous verrez vos résultats à la fin</li>
            </ul>
          </div>
          
          <div className="quiz-info-section">
            <h3>Conseils</h3>
            <ul>
              <li>Lisez attentivement chaque question</li>
              <li>Ne restez pas trop longtemps sur une question</li>
              <li>Revérifiez vos réponses si vous avez le temps</li>
            </ul>
          </div>
          
          <div className="quiz-stats">
            <div className="stat-item">
              <span className="stat-label">Questions</span>
              <span className="stat-value">{totalQuestions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Durée</span>
              <span className="stat-value">{quiz.duree} min</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Niveau</span>
              <span className="stat-value">{quiz.cours.split(' ')[0]}</span>
            </div>
          </div>
          
          <div className="quiz-actions">
            <button className="start-quiz-btn" onClick={startQuiz}>
              Commencer le Quiz
            </button>
            <button className="cancel-quiz-btn" onClick={onClose}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz en cours
  if (status === QuizStatus.IN_PROGRESS) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-title-section">
            <h3>{quiz.titre}</h3>
            <div className="quiz-progress">
              Question {currentQuestionIndex + 1} sur {totalQuestions}
            </div>
          </div>
          
          <div className="quiz-controls">
            <div className="timer">
              <i className="lni lni-timer"></i>
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button className="close-quiz-btn" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="quiz-progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
        
        <div className="question-container">
          <div className="question-header">
            <div className="question-number">Question {currentQuestionIndex + 1}</div>
            <div className="question-points">1 point</div>
          </div>
          
          <div className="question-text">
            {currentQuestion.question}
          </div>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              const letter = String.fromCharCode(65 + index);
              
              return (
                <div 
                  key={index}
                  className={`option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                >
                  <div className="option-letter">{letter}</div>
                  <div className="option-text">{option}</div>
                  {isSelected && (
                    <div className="option-check">
                      <i className="lni lni-checkmark-circle"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="quiz-navigation">
          <button 
            className="nav-btn prev-btn"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <i className="lni lni-chevron-left"></i> Précédent
          </button>
          
          <div className="question-dots">
            {quiz.questions.map((_, index) => (
              <div 
                key={index}
                className={`question-dot ${index === currentQuestionIndex ? 'active' : ''} ${
                  selectedAnswers[quiz.questions[index].id] ? 'answered' : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          <button 
            className="nav-btn next-btn"
            onClick={nextQuestion}
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Terminer' : 'Suivant'}
            {currentQuestionIndex < totalQuestions - 1 && <i className="lni lni-chevron-right"></i>}
          </button>
        </div>
      </div>
    );
  }

  // Résultats du quiz
  if (status === QuizStatus.COMPLETED && results) {
    return (
      <QuizResults 
        quiz={quiz}
        results={results}
        onRetry={() => {
          setResults(null);
          setStatus(QuizStatus.NOT_STARTED);
        }}
        onClose={onClose}
      />
    );
  }

  return null;
};

// Quiz Modal
const QuizModal = ({ quiz, onClose, onComplete, initialStatus = QuizStatus.NOT_STARTED, initialResults = null }) => {
  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <Quiz 
          quiz={quiz} 
          onClose={onClose} 
          onComplete={onComplete} 
          initialStatus={initialStatus}
          initialResults={initialResults}
        />
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const [credentials, setCredentials] = useState({ user: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const student = etudiants.find(etud => etud.user === credentials.user);
    
    if (!student) {
      setError("Utilisateur non trouvé");
      setLoading(false);
      return;
    }
    
    if (student.password !== credentials.password) {
      setError("Mot de passe incorrect");
      setLoading(false);
      return;
    }
    
    auth.login(student);
    setLoading(false);
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2><span style={{color: "#CC0000"}}>Deutsch</span>Mohammed</h2>
            <p>Espace étudiant</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <i className="lni lni-warning"></i> {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="user">
                <i className="lni lni-user"></i> Nom d'utilisateur
              </label>
              <input 
                type="text" 
                id="user"
                value={credentials.user}
                onChange={(e) => setCredentials({...credentials, user: e.target.value})}
                placeholder="Votre nom d'utilisateur"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <i className="lni lni-lock"></i> Mot de passe
              </label>
              <input 
                type="password" 
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <i className="lni lni-enter"></i>
                  Se connecter
                </>
              )}
            </button>
            
            <div className="login-footer">
              <p>Comptes de démo :</p>
              <div className="demo-accounts">
                <div className="demo-account">
                  <strong>alice123</strong> / password123
                  <span className="badge group">Groupe</span>
                </div>
                <div className="demo-account">
                  <strong>bob456</strong> / password456
                  <span className="badge individual">Individuel</span>
                </div>
              </div>
            </div>
          </form>
          
          <div className="login-features">
            <div className="feature">
              <i className="lni lni-calendar"></i>
              <span>Emploi du temps en ligne</span>
            </div>
            <div className="feature">
              <i className="lni lni-video"></i>
              <span>Sessions en direct</span>
            </div>
            <div className="feature">
              <i className="lni lni-pencil-alt"></i>
              <span>Quiz interactifs</span>
            </div>
          </div>
        </div>
        
        <div className="login-side-image">
          <div className="image-placeholder">
            <i className="lni lni-graduation"></i>
            <h3>Apprenez l'allemand efficacement</h3>
            <p>Rejoignez notre communauté d'apprenants</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = React.useContext(AuthContext);
  
  if (!auth.user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Student Dashboard Component
const StudentDashboard = () => {
  const auth = React.useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('emploi');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [quizStatus, setQuizStatus] = useState(QuizStatus.NOT_STARTED);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    fetchSessions();
    const savedQuizzes = localStorage.getItem(`completed_quizzes_${auth.user.id}`);
    if (savedQuizzes) {
      setCompletedQuizzes(JSON.parse(savedQuizzes));
    }
  }, [auth.user.id]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const studentPlan = auth.user.plan;
      const filteredSessions = lseance.filter(session => 
        session.plan === studentPlan || session.plan === 'group'
      );
      
      setSessions(filteredSessions);
      setError(null);
    } catch (err) {
      console.error("Erreur de chargement des sessions:", err);
      setError("Utilisation des données locales");
      
      const studentPlan = auth.user.plan;
      const filteredSessions = lseance.filter(session => 
        session.plan === studentPlan || session.plan === 'group'
      );
      setSessions(filteredSessions);
    } finally {
      setLoading(false);
    }
  };

  const joinCall = (session) => {
    if (session.call_link && session.call_link.join_url) {
      setSelectedCall(session.call_link.join_url);
      setIsCallActive(true);
    } else if (session.link) {
      setSelectedCall(session.link);
      setIsCallActive(true);
    } else {
      alert("Aucun lien d'appel disponible pour cette session");
    }
  };

  const closeCall = () => {
    setIsCallActive(false);
    setSelectedCall(null);
  };

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    const completed = completedQuizzes.find(q => q.quizId === quiz.id);
    
    if (completed) {
      setQuizResults(completed);
      setQuizStatus(QuizStatus.COMPLETED);
    } else {
      setQuizStatus(QuizStatus.NOT_STARTED);
      setQuizResults(null);
    }
  };

  const handleQuizComplete = (score) => {
    const quizResult = {
      quizId: selectedQuiz.id,
      titre: selectedQuiz.titre,
      date: new Date().toISOString(),
      score: score.percentage,
      correct: score.correct,
      total: score.total,
      details: score
    };
    
    const updatedQuizzes = [...completedQuizzes, quizResult];
    setCompletedQuizzes(updatedQuizzes);
    
    localStorage.setItem(
      `completed_quizzes_${auth.user.id}`,
      JSON.stringify(updatedQuizzes)
    );
    
    setSelectedQuiz(null);
    setQuizStatus(QuizStatus.NOT_STARTED);
    setQuizResults(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const studentQuizzes = lquizes.filter(quiz =>
    quiz.plan === auth.user.plan || quiz.plan === 'group'
  );

  const totalQuizzes = studentQuizzes.length;
  const completedCount = completedQuizzes.length;
  const progressPercentage = totalQuizzes > 0 
    ? Math.round((completedCount / totalQuizzes) * 100) 
    : 0;

  return (
    <section className="dashboard-section">
      {isCallActive && selectedCall && (
        <div className="call-modal-overlay">
          <div className="call-modal">
            <div className="call-modal-header">
              <h4>Appel en cours - DeutschMohammed</h4>
              <button onClick={closeCall}>×</button>
            </div>
            <div className="call-modal-body">
              <iframe
                src={selectedCall}
                title="Appel en ligne DeutschMohammed"
                allow="camera; microphone; display-capture; autoplay"
                allowFullScreen
              />
              <div className="call-instructions">
                <p><strong>Instructions :</strong></p>
                <ul>
                  <li>Autorisez l'accès à votre caméra et microphone</li>
                  <li>Utilisez des écouteurs pour une meilleure qualité</li>
                  <li>Éteignez votre micro quand vous n'êtes pas en train de parler</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedQuiz && (
        <QuizModal 
          quiz={selectedQuiz} 
          onClose={() => {
            setSelectedQuiz(null);
            setQuizStatus(QuizStatus.NOT_STARTED);
            setQuizResults(null);
          }}
          onComplete={handleQuizComplete}
          initialStatus={quizStatus}
          initialResults={quizResults}
        />
      )}

      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <div className="user-avatar">
                {auth.user.name.charAt(0)}
              </div>
              <div>
                <h2>Bonjour, {auth.user.name}!</h2>
                <p className="user-plan">
                  <span className={`plan-badge ${auth.user.plan}`}>
                    {auth.user.plan === 'group' ? 'Cours Collectifs' : 'Cours Personnalisés'}
                  </span>
                </p>
              </div>
            </div>
            <button onClick={auth.logout} className="logout-btn">
              <i className="lni lni-exit"></i> Déconnexion
            </button>
          </div>
          
          {error && (
            <div className="dashboard-alert">
              <i className="lni lni-warning"></i> {error}
            </div>
          )}
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{background: "#FFE6E6"}}>
              <i className="lni lni-calendar" style={{color: "#CC0000"}}></i>
            </div>
            <div className="stat-info">
              <h3>{sessions.length}</h3>
              <p>Sessions programmées</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: "#E6F3FF"}}>
              <i className="lni lni-pencil-alt" style={{color: "#0066CC"}}></i>
            </div>
            <div className="stat-info">
              <h3>{completedCount}/{totalQuizzes}</h3>
              <p>Quiz complétés</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: "#E6FFE6"}}>
              <i className="lni lni-timer" style={{color: "#00CC66"}}></i>
            </div>
            <div className="stat-info">
              <h3>{progressPercentage}%</h3>
              <p>Progression globale</p>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'emploi' ? 'active' : ''}`}
            onClick={() => setActiveTab('emploi')}
          >
            <i className="lni lni-calendar"></i> Emploi du temps
          </button>
          <button 
            className={`tab-btn ${activeTab === 'exercices' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercices')}
          >
            <i className="lni lni-pencil-alt"></i> Quiz & Exercices
          </button>
          <button 
            className={`tab-btn ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => setActiveTab('profil')}
          >
            <i className="lni lni-user"></i> Mon Profil
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'emploi' && (
            <div className="sessions-container">
              <div className="section-header">
                <h3><i className="lni lni-calendar"></i> Vos Sessions Programmes</h3>
                <button 
                  onClick={fetchSessions}
                  className="refresh-btn"
                  disabled={loading}
                >
                  <i className="lni lni-reload"></i> Actualiser
                </button>
              </div>
              
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Chargement de vos sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="empty-state">
                  <i className="lni lni-calendar"></i>
                  <h4>Aucune session programmée</h4>
                  <p>Votre prochaine session apparaîtra ici</p>
                </div>
              ) : (
                <div className="sessions-grid">
                  {sessions.map(session => (
                    <div className="session-card" key={session.id}>
                      <div className="session-header">
                        <div className="session-type">
                          <span className={`type-badge ${session.plan}`}>
                            {session.plan === 'group' ? 'Groupe' : 'Individuel'}
                          </span>
                          <span className="session-platform">
                            <i className="lni lni-video"></i> {session.call_link?.platform || 'Zoom'}
                          </span>
                        </div>
                        <h4>{session.titre}</h4>
                        <p className="session-course">{session.cours}</p>
                      </div>
                      
                      <div className="session-body">
                        <div className="session-info">
                          <div className="info-item">
                            <i className="lni lni-alarm-clock"></i>
                            <span>{formatDate(session.date)}</span>
                          </div>
                          <div className="info-item">
                            <i className="lni lni-book"></i>
                            <span>{session.description}</span>
                          </div>
                          {session.call_link && (
                            <div className="call-info">
                              <div className="meeting-id">
                                <i className="lni lni-key"></i>
                                <span>ID: {session.call_link.meeting_id}</span>
                              </div>
                              {session.call_link.password && (
                                <div className="meeting-password">
                                  <i className="lni lni-lock"></i>
                                  <span>Code: {session.call_link.password}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="session-actions">
                          {(session.call_link || session.link) ? (
                            <button 
                              className="join-btn"
                              onClick={() => joinCall(session)}
                            >
                              <i className="lni lni-video"></i> Rejoindre l'appel
                            </button>
                          ) : (
                            <button className="join-btn disabled" disabled>
                              <i className="lni lni-ban"></i> Lien non disponible
                            </button>
                          )}
                          
                          {session.call_link?.join_url && (
                            <button 
                              className="copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(session.call_link.join_url);
                                alert('Lien copié dans le presse-papier !');
                              }}
                            >
                              <i className="lni lni-files"></i> Copier
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="call-instructions-card">
                <h5><i className="lni lni-bulb"></i> Préparation à la session :</h5>
                <ul>
                  <li>Connectez-vous 5 minutes avant l'heure prévue</li>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Préparez votre matériel (cahier, stylo)</li>
                  <li>Installez-vous dans un endroit calme</li>
                  <li>Testez votre caméra et microphone</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'exercices' && (
            <div className="quizzes-container">
              <div className="section-header">
                <h3><i className="lni lni-pencil-alt"></i> Vos Quiz et Exercices</h3>
                <div className="progress-summary">
                  <span>Progression : {completedCount}/{totalQuizzes}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {studentQuizzes.length === 0 ? (
                <div className="empty-state">
                  <i className="lni lni-pencil-alt"></i>
                  <h4>Aucun quiz disponible</h4>
                  <p>De nouveaux quiz seront bientôt ajoutés</p>
                </div>
              ) : (
                <>
                  <div className="quizzes-grid">
                    {studentQuizzes.map(quiz => {
                      const completed = completedQuizzes.find(q => q.quizId === quiz.id);
                      
                      return (
                        <div className="quiz-card" key={quiz.id}>
                          <div className="quiz-header">
                            <div className="quiz-status">
                              {completed ? (
                                <span className="status-badge completed">
                                  <i className="lni lni-checkmark-circle"></i> Terminé
                                </span>
                              ) : (
                                <span className="status-badge pending">
                                  <i className="lni lni-timer"></i> En attente
                                </span>
                              )}
                              <span className={`plan-badge ${quiz.plan}`}>
                                {quiz.plan === 'group' ? 'Groupe' : 'Individuel'}
                              </span>
                            </div>
                            <h4>{quiz.titre}</h4>
                            <p className="quiz-course">{quiz.cours}</p>
                          </div>
                          
                          <div className="quiz-body">
                            <p className="quiz-description">{quiz.description}</p>
                            
                            <div className="quiz-meta">
                              <div className="meta-item">
                                <i className="lni lni-question-circle"></i>
                                <span>{quiz.questions.length} questions</span>
                              </div>
                              <div className="meta-item">
                                <i className="lni lni-timer"></i>
                                <span>{quiz.duree} minutes</span>
                              </div>
                              <div className="meta-item">
                                <i className="lni lni-calendar"></i>
                                <span>{new Date(quiz.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            
                            {completed && (
                              <div className="quiz-score">
                                <div className="score-circle small">
                                  <span>{completed.score}%</span>
                                </div>
                                <div className="score-details">
                                  <p>{completed.correct}/{completed.total} bonnes réponses</p>
                                  <p className="score-date">
                                    Complété le {new Date(completed.date).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="quiz-actions">
                            <button 
                              className="start-quiz-btn"
                              onClick={() => startQuiz(quiz)}
                            >
                              {completed ? (
                                <>
                                  <i className="lni lni-eye"></i> Voir résultats
                                </>
                              ) : (
                                <>
                                  <i className="lni lni-play"></i> Commencer
                                </>
                              )}
                            </button>
                            
                            {completed && (
                              <button 
                                className="retry-btn"
                                onClick={() => startQuiz(quiz)}
                              >
                                <i className="lni lni-reload"></i> Recommencer
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'profil' && (
            <div className="profile-container">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {auth.user.name.charAt(0)}
                </div>
                <div className="profile-info">
                  <h2>{auth.user.name}</h2>
                  <p className="profile-email">{auth.user.user}@deutschmohammed.com</p>
                  <div className="profile-plan">
                    <span className={`plan-tag ${auth.user.plan}`}>
                      {auth.user.plan === 'group' ? 'Plan Collectif' : 'Plan Individuel'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="profile-details">
                <div className="details-card">
                  <h5><i className="lni lni-user"></i> Informations personnelles</h5>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Nom d'utilisateur</span>
                      <span className="detail-value">{auth.user.user}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type de compte</span>
                      <span className="detail-value">Étudiant</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Plan d'études</span>
                      <span className="detail-value">
                        {auth.user.plan === 'group' ? 'Cours Collectifs' : 'Cours Personnalisés'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Statut</span>
                      <span className="detail-value status-active">Actif</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Dernière connexion</span>
                      <span className="detail-value">
                        {new Date().toLocaleDateString('fr-FR', { 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="details-card">
                  <h5><i className="lni lni-graph"></i> Progression d'apprentissage</h5>
                  <div className="progress-chart">
                    <div className="progress-item">
                      <span className="progress-label">Quiz complétés</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="progress-value">{progressPercentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="details-card">
                  <h5><i className="lni lni-award"></i> Réussites récentes</h5>
                  {completedQuizzes.length > 0 ? (
                    <div className="achievements">
                      {completedQuizzes.slice(0, 3).map((quiz, index) => (
                        <div className="achievement" key={index}>
                          <div className="achievement-icon">
                            {quiz.score >= 80 ? '🏆' : quiz.score >= 60 ? '⭐' : '📝'}
                          </div>
                          <div className="achievement-info">
                            <h6>{quiz.titre}</h6>
                            <p>{quiz.score}% - {quiz.correct}/{quiz.total} bonnes réponses</p>
                          </div>
                          <span className="achievement-date">
                            {new Date(quiz.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-achievements">Commencez vos quiz pour débloquer des réussites !</p>
                  )}
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="action-btn">
                  <i className="lni lni-download"></i> Télécharger le programme
                </button>
                <button className="action-btn secondary">
                  <i className="lni lni-cog"></i> Paramètres du compte
                </button>
                <button className="action-btn danger" onClick={auth.logout}>
                  <i className="lni lni-exit"></i> Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Home Component (simplifié pour l'exemple)
const Home = () => (
  <section className="home-section">
    <div className="container">
      <h1>Bienvenue sur DeutschMohammed</h1>
      <p>Apprenez l'allemand facilement depuis chez vous</p>
      <Link to="/login" className="button">Se connecter</Link>
    </div>
  </section>
);

// Courses Component (simplifié)
const Courses = () => (
  <section className="courses-section">
    <div className="container">
      <h2>Nos Plans</h2>
      <div className="pricing-grid">
        <div className="single-pricing">
          <h4>Groupe</h4>
          <h3>300 DH</h3>
          <ul>
            <li>4 sessions/mois</li>
            <li>Groupes de 4-6</li>
          </ul>
          <Link to="/contact" className="button">Choisir</Link>
        </div>
        <div className="single-pricing active">
          <h4>Individuel</h4>
          <h3>1500 DH</h3>
          <ul>
            <li>8 sessions/mois</li>
            <li>Cours personnalisés</li>
          </ul>
          <Link to="/contact" className="button">Choisir</Link>
        </div>
      </div>
    </div>
  </section>
);

// About Component (simplifié)
const About = () => (
  <section className="about-section">
    <div className="container">
      <h2>À propos</h2>
      <p>Mohammed, votre enseignant d'allemand certifié</p>
    </div>
  </section>
);

// Contact Component (simplifié)
const Contact = () => (
  <section className="contact-section">
    <div className="container">
      <h2>Contact</h2>
      <p>Contactez-nous pour plus d'informations</p>
    </div>
  </section>
);

// Navbar Component
const Navbar = () => {
  const location = useLocation();
  const auth = React.useContext(AuthContext);
  
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <span className="logo-text">DeutschMohammed</span>
          </Link>
          
          <div className="navbar-nav">
            <Link className={`nav-link ${isActive("/")}`} to="/">Accueil</Link>
            <Link className={`nav-link ${isActive("/courses")}`} to="/courses">Plans</Link>
            <Link className={`nav-link ${isActive("/about")}`} to="/about">À propos</Link>
            <Link className={`nav-link ${isActive("/contact")}`} to="/contact">Contact</Link>
            
            {auth.user ? (
              <>
                <Link className={`nav-link ${isActive("/dashboard")}`} to="/dashboard">
                  Tableau de Bord
                </Link>
                <button onClick={auth.logout} className="logout-btn">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link className={`nav-link ${isActive("/login")}`} to="/login">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

// Footer Component
const Footer = () => (
  <footer className="footer">
    <div className="container">
      <p>&copy; 2024 DeutschMohammed. Tous droits réservés.</p>
    </div>
  </footer>
);

// Layout Component
const Layout = ({ children }) => (
  <div className="app">
    <Navbar />
    <main>{children}</main>
    <Footer />
  </div>
);

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('deutsch_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('deutsch_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('deutsch_user');
  };

  const authValue = {
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/login" element={
            <Layout>
              <Login />
            </Layout>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/courses" element={
            <Layout>
              <Courses />
            </Layout>
          } />
          <Route path="/about" element={
            <Layout>
              <About />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <Contact />
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
