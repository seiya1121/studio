import React, { useState } from 'react';
import './styles.css';

// Quizコンポーネントのプロパティ
interface QuizProps {
  onBackToHome?: () => void;
}

// クイズの質問データ型
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// ジャンル型
type Genre = 'movie' | 'onepiece' | 'starwars' | 'frontend' | 'uidesign';

// クイズデータ
const quizData: Record<Genre, Question[]> = {
  movie: [
    {
      id: 1,
      question: "映画「タイタニック」の監督は誰ですか？",
      options: ["スティーブン・スピルバーグ", "ジェームズ・キャメロン", "クリストファー・ノーラン", "リドリー・スコット"],
      correctAnswer: 1,
      explanation: "ジェームズ・キャメロンが監督し、1997年に公開された名作映画です。"
    },
    {
      id: 2,
      question: "アニメ映画「君の名は。」の監督は誰ですか？",
      options: ["宮崎駿", "新海誠", "細田守", "庵野秀明"],
      correctAnswer: 1,
      explanation: "新海誠が監督し、2016年に公開された大ヒット作品です。"
    },
    {
      id: 3,
      question: "映画「インセプション」で、夢の中に入る技術を使う職業は何と呼ばれていますか？",
      options: ["ドリーマー", "アーキテクト", "エクストラクター", "プロジェクター"],
      correctAnswer: 2,
      explanation: "エクストラクターは他人の潜在意識に侵入して秘密を盗む専門家です。"
    },
    {
      id: 4,
      question: "スタジオジブリ作品「千と千尋の神隠し」で、千尋の両親が食べ物を食べて変身したのは何ですか？",
      options: ["ブタ", "カエル", "ネズミ", "鳥"],
      correctAnswer: 0,
      explanation: "両親は神々の食べ物を食べてブタに変身してしまいました。"
    },
    {
      id: 5,
      question: "映画「アベンジャーズ」シリーズで、ソーのハンマーの名前は何ですか？",
      options: ["ストームブレイカー", "ムジョルニア", "グングニル", "レヴァンテイン"],
      correctAnswer: 1,
      explanation: "ムジョルニアはソーの代表的な武器で、「雷神の鎚」として知られています。"
    }
  ],
  onepiece: [
    {
      id: 1,
      question: "ルフィの悪魔の実の能力は何ですか？",
      options: ["ゴムゴムの実", "メラメラの実", "ヒトヒトの実", "バラバラの実"],
      correctAnswer: 0,
      explanation: "ゴムゴムの実により、ルフィの体はゴムのように伸縮自在になります。"
    },
    {
      id: 2,
      question: "麦わらの一味の考古学者は誰ですか？",
      options: ["ナミ", "ロビン", "ビビ", "ペローナ"],
      correctAnswer: 1,
      explanation: "ニコ・ロビンは考古学者で、古代文字ポーネグリフを読むことができます。"
    },
    {
      id: 3,
      question: "サンジの夢は何ですか？",
      options: ["海賊王になる", "オールブルーを見つける", "世界一の剣豪になる", "世界地図を作る"],
      correctAnswer: 1,
      explanation: "オールブルーは全ての海の魚が泳ぐ伝説の海で、サンジの夢です。"
    },
    {
      id: 4,
      question: "ゾロが使う三刀流の技「三千世界」はどの刀を使いますか？",
      options: ["三代鬼徹、雪走、和道一文字", "秋水、雪走、和道一文字", "閻魔、三代鬼徹、和道一文字", "全ての刀"],
      correctAnswer: 3,
      explanation: "三千世界は三本の刀全てを使用する奥義です。"
    },
    {
      id: 5,
      question: "白ひげ海賊団の船の名前は何ですか？",
      options: ["モビー・ディック号", "オロ・ジャクソン号", "サウザンド・サニー号", "ゴーイング・メリー号"],
      correctAnswer: 0,
      explanation: "モビー・ディック号は白ひげ海賊団の船で、鯨の形をしています。"
    }
  ],
  starwars: [
    {
      id: 1,
      question: "ルーク・スカイウォーカーの父親は誰ですか？",
      options: ["オビ=ワン・ケノービ", "アナキン・スカイウォーカー", "ハン・ソロ", "ランド・カルリジアン"],
      correctAnswer: 1,
      explanation: "アナキン・スカイウォーカーがダークサイドに落ちてダース・ベイダーになりました。"
    },
    {
      id: 2,
      question: "ヨーダの種族名は何ですか？",
      options: ["ヨーダ族", "フォース族", "不明", "ジェダイ族"],
      correctAnswer: 2,
      explanation: "ヨーダの種族名は公式には明かされておらず、謎に包まれています。"
    },
    {
      id: 3,
      question: "ミレニアム・ファルコンの船長は誰ですか？",
      options: ["ルーク・スカイウォーカー", "ハン・ソロ", "チューバッカ", "ランド・カルリジアン"],
      correctAnswer: 1,
      explanation: "ハン・ソロがミレニアム・ファルコンの船長です。"
    },
    {
      id: 4,
      question: "フォースのダークサイドを象徴する色は何ですか？",
      options: ["青", "緑", "赤", "紫"],
      correctAnswer: 2,
      explanation: "シスのライトセーバーは赤色で、ダークサイドを象徴しています。"
    },
    {
      id: 5,
      question: "「これは、あなたが探しているドロイドではない」と言ったのは誰ですか？",
      options: ["ダース・ベイダー", "オビ=ワン・ケノービ", "ルーク・スカイウォーカー", "C-3PO"],
      correctAnswer: 1,
      explanation: "オビ=ワン・ケノービがストームトルーパーに向かって言った有名なセリフです。"
    }
  ],
  frontend: [
    {
      id: 1,
      question: "ReactでコンポーネントのライフサイクルメソッドのuseEffectはいつ実行されますか？",
      options: ["レンダリング前", "レンダリング後", "状態更新前", "マウント前"],
      correctAnswer: 1,
      explanation: "useEffectはコンポーネントのレンダリング後に実行されます。"
    },
    {
      id: 2,
      question: "CSS Flexboxでアイテムを中央に配置するために使用するプロパティは何ですか？",
      options: ["text-align: center", "justify-content: center", "margin: auto", "position: absolute"],
      correctAnswer: 1,
      explanation: "justify-content: centerでFlexアイテムを主軸方向の中央に配置できます。"
    },
    {
      id: 3,
      question: "JavaScriptのletとconstの違いは何ですか？",
      options: ["スコープが違う", "再代入可能性が違う", "ホイスティングが違う", "全て違う"],
      correctAnswer: 1,
      explanation: "letは再代入可能、constは再代入不可能です。どちらもブロックスコープです。"
    },
    {
      id: 4,
      question: "TypeScriptでオプショナルなプロパティを定義する記号は何ですか？",
      options: ["*", "?", "!", "&"],
      correctAnswer: 1,
      explanation: "?記号を使ってオプショナルなプロパティを定義します（例：name?: string）。"
    },
    {
      id: 5,
      question: "Webpackの主な目的は何ですか？",
      options: ["コード最適化", "モジュールバンドル", "テスト実行", "デプロイメント"],
      correctAnswer: 1,
      explanation: "Webpackは複数のモジュールを一つまたは複数のバンドルにまとめるツールです。"
    }
  ],
  uidesign: [
    {
      id: 1,
      question: "ユーザビリティの「ヒックの法則」とは何ですか？",
      options: ["選択肢が多いほど決定に時間がかかる", "色が多いほど見やすい", "文字が大きいほど読みやすい", "画像が多いほど理解しやすい"],
      correctAnswer: 0,
      explanation: "ヒックの法則は、選択肢の数が多いほど決定に必要な時間が長くなることを示しています。"
    },
    {
      id: 2,
      question: "デザインの基本原則「CRAP」の「C」は何を表しますか？",
      options: ["Color（色）", "Contrast（対比）", "Center（中央）", "Clean（清潔）"],
      correctAnswer: 1,
      explanation: "CRAPはContrast（対比）、Repetition（反復）、Alignment（整列）、Proximity（近接）の頭文字です。"
    },
    {
      id: 3,
      question: "ゴールデンレシオ（黄金比）の値は約何ですか？",
      options: ["1.414", "1.618", "1.732", "2.718"],
      correctAnswer: 1,
      explanation: "黄金比は約1.618で、美しいとされる比率として古くから使われています。"
    },
    {
      id: 4,
      question: "カラーホイールで補色関係にある色は何度の角度にありますか？",
      options: ["90度", "120度", "180度", "270度"],
      correctAnswer: 2,
      explanation: "補色は色相環で180度向かい合う位置にある色同士です。"
    },
    {
      id: 5,
      question: "UXデザインの「ペルソナ」とは何ですか？",
      options: ["デザインパターン", "ユーザーの典型例", "カラーパレット", "フォントの種類"],
      correctAnswer: 1,
      explanation: "ペルソナは実際のユーザー調査に基づいて作成される架空の典型的ユーザーです。"
    }
  ]
};

// ジャンル情報
const genreInfo: Record<Genre, { name: string; icon: string; description: string }> = {
  movie: {
    name: "映画",
    icon: "🎬",
    description: "映画に関する知識をテストしよう"
  },
  onepiece: {
    name: "ワンピース",
    icon: "🏴‍☠️",
    description: "海賊王を目指す冒険の知識をテスト"
  },
  starwars: {
    name: "スターウォーズ",
    icon: "⭐",
    description: "遠い昔、はるか彼方の銀河系の知識"
  },
  frontend: {
    name: "フロントエンド",
    icon: "💻",
    description: "Web開発の技術的知識をテスト"
  },
  uidesign: {
    name: "UIデザイン",
    icon: "🎨",
    description: "ユーザーインターフェースデザインの知識"
  }
};

const Quiz: React.FC<QuizProps> = ({ onBackToHome }) => {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const currentGenreQuestions = selectedGenre ? quizData[selectedGenre] : [];
  const currentQuestion = currentGenreQuestions[currentQuestionIndex];

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setGameStarted(false);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);

    // 次の質問に自動的に進む
    setTimeout(() => {
      if (currentQuestionIndex < currentGenreQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === currentGenreQuestions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const resetQuiz = () => {
    setSelectedGenre(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setGameStarted(false);
  };

  const restartCurrentGenre = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setGameStarted(false);
  };

  // ジャンル選択画面
  if (!selectedGenre) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="back-button" onClick={onBackToHome}>
            ← ホームに戻る
          </button>
          <h1 className="quiz-title">クイズゲーム</h1>
        </div>
        
        <div className="genre-selection">
          <h2 className="section-title">ジャンルを選択してください</h2>
          <div className="genre-grid">
            {(Object.keys(genreInfo) as Genre[]).map((genre) => (
              <div
                key={genre}
                className="genre-card"
                onClick={() => handleGenreSelect(genre)}
              >
                <div className="genre-icon">{genreInfo[genre].icon}</div>
                <h3 className="genre-name">{genreInfo[genre].name}</h3>
                <p className="genre-description">{genreInfo[genre].description}</p>
                <button className="genre-button">挑戦する</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ゲーム開始前の画面
  if (!gameStarted) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="back-button" onClick={resetQuiz}>
            ← ジャンル選択に戻る
          </button>
          <h1 className="quiz-title">
            {genreInfo[selectedGenre].icon} {genreInfo[selectedGenre].name}クイズ
          </h1>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>ゲーム説明</h2>
            <ul className="game-rules">
              <li>全{currentGenreQuestions.length}問の4択クイズです</li>
              <li>回答を選択すると自動的に次の問題に進みます</li>
              <li>すべての問題に答えると結果が表示されます</li>
              <li>頑張って全問正解を目指しましょう！</li>
            </ul>
            <button className="start-button" onClick={startGame}>
              ゲーム開始
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 結果画面
  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / currentGenreQuestions.length) * 100);
    
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="back-button" onClick={resetQuiz}>
            ← ジャンル選択に戻る
          </button>
          <h1 className="quiz-title">クイズ結果</h1>
        </div>
        
        <div className="result-screen">
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {currentGenreQuestions.length}</span>
            </div>
            <h2 className="score-percentage">{percentage}%</h2>
            <p className="score-message">
              {percentage === 100 ? "完璧です！🎉" :
               percentage >= 80 ? "素晴らしい！⭐" :
               percentage >= 60 ? "良い結果です！👍" :
               "もう一度挑戦してみましょう！💪"}
            </p>
          </div>
          
          <div className="answer-review">
            <h3>回答結果</h3>
            {currentGenreQuestions.map((question, index) => (
              <div key={question.id} className="answer-item">
                <div className="question-summary">
                  <span className="question-number">Q{index + 1}</span>
                  <span className={`answer-status ${selectedAnswers[index] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                    {selectedAnswers[index] === question.correctAnswer ? '✓' : '✗'}
                  </span>
                </div>
                <p className="question-text">{question.question}</p>
                <p className="correct-answer">
                  正解: {question.options[question.correctAnswer]}
                </p>
                <p className="explanation">{question.explanation}</p>
              </div>
            ))}
          </div>
          
          <div className="result-actions">
            <button className="retry-button" onClick={restartCurrentGenre}>
              もう一度挑戦
            </button>
            <button className="change-genre-button" onClick={resetQuiz}>
              ジャンル変更
            </button>
          </div>
        </div>
      </div>
    );
  }

  // クイズ画面
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="back-button" onClick={resetQuiz}>
          ← ジャンル選択に戻る
        </button>
        <div className="progress-info">
          <h1 className="quiz-title">
            {genreInfo[selectedGenre].icon} {genreInfo[selectedGenre].name}クイズ
          </h1>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / currentGenreQuestions.length) * 100}%` }}
            ></div>
          </div>
          <span className="question-counter">
            {currentQuestionIndex + 1} / {currentGenreQuestions.length}
          </span>
        </div>
      </div>
      
      <div className="question-section">
        <h2 className="question-text">{currentQuestion.question}</h2>
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedAnswers[currentQuestionIndex] === index ? 
                (index === currentQuestion.correctAnswer ? 'correct' : 'incorrect') : ''}`}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswers[currentQuestionIndex] !== undefined}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
        
        {selectedAnswers[currentQuestionIndex] !== undefined && (
          <div className="answer-feedback">
            <p className={`feedback-text ${selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
              {selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? '正解！' : '不正解...'}
            </p>
            <p className="explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz; 