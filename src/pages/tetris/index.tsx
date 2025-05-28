import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles.css';

// テトリスコンポーネントのPropsインターフェース
interface TetrisProps {
  onBackToHome?: () => void;
}

// ゲーム設定
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;

// 位置型定義
interface Position {
  x: number;
  y: number;
}

// ピース型定義
interface Piece {
  shape: number[][];
  color: string;
  position: Position;
}

// ボード型定義
type Board = (string | null)[][];

// テトロミノの形状定義
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00D4AA', // より鮮やかなティールブルー
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#FFD23F', // より鮮やかなゴールデンイエロー
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#7ED321', // より鮮やかなライムグリーン
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#50E3C2', // より鮮やかなアクアグリーン
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#F5A623', // より鮮やかなオレンジ
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#9013FE', // より鮮やかなパープル
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#BD10E0', // より鮮やかなマゼンタ
  },
};

type TetrominoType = keyof typeof TETROMINOS;

// 7種一巡システム（7-bag system）
class SevenBagGenerator {
  private bag: TetrominoType[] = [];
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  private refillBag(): void {
    const allTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    this.bag = this.shuffleArray(allTypes);
  }
  
  getNext(): TetrominoType {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    return this.bag.pop()!;
  }
  
  // プレビュー用：次の数個のピースを取得（バッグを消費しない）
  preview(count: number): TetrominoType[] {
    const preview: TetrominoType[] = [];
    const tempBag = [...this.bag];
    
    for (let i = 0; i < count; i++) {
      if (tempBag.length === 0) {
        const allTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        tempBag.push(...this.shuffleArray(allTypes));
      }
      preview.push(tempBag.pop()!);
    }
    
    return preview;
  }
}

// ユーティリティ関数
const createEmptyBoard = (): Board => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
};

const rotatePiece = (piece: number[][]): number[][] => {
  const rotated = piece[0].map((_, index) => piece.map(row => row[index]).reverse());
  return rotated;
};

const isValidMove = (board: Board, piece: Piece, newPosition: Position): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = newPosition.x + x;
        const newY = newPosition.y + y;
        
        if (
          newX < 0 || 
          newX >= BOARD_WIDTH || 
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

const placePiece = (board: Board, piece: Piece): Board => {
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }
  
  return newBoard;
};

const clearLines = (board: Board): { newBoard: Board; linesCleared: number; clearedLineIndices: number[] } => {
  const clearedLineIndices: number[] = [];
  const newBoard = board.filter((row, index) => {
    const shouldClear = row.some(cell => cell === null);
    if (!shouldClear) {
      clearedLineIndices.push(index);
    }
    return shouldClear;
  });
  
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  
  return { newBoard, linesCleared, clearedLineIndices };
};

const getGhostPosition = (board: Board, piece: Piece): Position => {
  let ghostY = piece.position.y;
  
  while (isValidMove(board, piece, { x: piece.position.x, y: ghostY + 1 })) {
    ghostY++;
  }
  
  return { x: piece.position.x, y: ghostY };
};

const Tetris: React.FC<TetrisProps> = ({ onBackToHome }) => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieces, setNextPieces] = useState<Piece[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dropTime, setDropTime] = useState(INITIAL_DROP_TIME);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [linesClearingEffect, setLinesClearingEffect] = useState<number[]>([]);
  const [tetrisEffect, setTetrisEffect] = useState(false);
  
  // Lock Delay関連の状態
  const [isLocked, setIsLocked] = useState(false);
  const lockDelayTime = 500; // 500ms の猶予時間
  
  const gameLoopRef = useRef<number | null>(null);
  const lockDelayRef = useRef<number | null>(null);
  const bagGeneratorRef = useRef<SevenBagGenerator>(new SevenBagGenerator());

  // Lock Delayタイマーをクリア
  const clearLockDelay = useCallback(() => {
    if (lockDelayRef.current) {
      clearTimeout(lockDelayRef.current);
      lockDelayRef.current = null;
    }
    setIsLocked(false);
  }, []);

  // ピースを強制的に固定する関数
  const forceLockPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    clearLockDelay();
    const newBoard = placePiece(board, currentPiece);
    const { newBoard: clearedBoard, linesCleared, clearedLineIndices } = clearLines(newBoard);
    
    // ラインクリアエフェクト
    if (linesCleared > 0) {
      setLinesClearingEffect(clearedLineIndices);
      if (linesCleared === 4) {
        setTetrisEffect(true);
      }
      
      // エフェクトを一定時間後にクリア
      setTimeout(() => {
        setLinesClearingEffect([]);
        setTetrisEffect(false);
      }, 800);
    }
    
    setBoard(clearedBoard);
    setLines(prev => prev + linesCleared);
    setScore(prev => prev + linesCleared * 100 * level);
    
    // レベルアップチェック
    const newLines = lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setDropTime(Math.max(50, INITIAL_DROP_TIME - (newLevel - 1) * 100));
    }

    // 新しいピース生成
    if (nextPieces.length > 0) {
      const newCurrentPiece = { 
        ...nextPieces[0], 
        position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPieces[0].shape[0].length / 2), y: 0 }
      };
      if (!isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position)) {
        setGameOver(true);
        return false;
      }
      setCurrentPiece(newCurrentPiece);
      
      // 次のピースリストを更新
      const tetrominoType = bagGeneratorRef.current.getNext();
      const tetromino = TETROMINOS[tetrominoType];
      const newPiece = {
        shape: tetromino.shape,
        color: tetromino.color,
        position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
      };
      const newNextPieces = [...nextPieces.slice(1), newPiece];
      setNextPieces(newNextPieces);
    }
  }, [currentPiece, board, gameOver, isPaused, level, lines, nextPieces, clearLockDelay]);

  // Lock Delayタイマーを開始
  const startLockDelay = useCallback(() => {
    clearLockDelay();
    setIsLocked(true);
    lockDelayRef.current = window.setTimeout(() => {
      forceLockPiece();
    }, lockDelayTime);
  }, [clearLockDelay, forceLockPiece]);

  // ピースが接地しているかチェック
  const isGrounded = useCallback((piece: Piece, board: Board): boolean => {
    return !isValidMove(board, piece, { x: piece.position.x, y: piece.position.y + 1 });
  }, []);

  const createNewPiece = useCallback((): Piece => {
    const tetrominoType = bagGeneratorRef.current.getNext();
    const tetromino = TETROMINOS[tetrominoType];
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
    };
  }, []);

  const createNextPieces = useCallback((): Piece[] => {
    const nextTypes = bagGeneratorRef.current.preview(4);
    return nextTypes.map(type => {
      const tetromino = TETROMINOS[type];
      return {
        shape: tetromino.shape,
        color: tetromino.color,
        position: { x: 0, y: 0 },
      };
    });
  }, []);

  const startGame = useCallback(() => {
    // 新しいバッグジェネレーターを作成
    bagGeneratorRef.current = new SevenBagGenerator();
    
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setDropTime(INITIAL_DROP_TIME);
    clearLockDelay();
    
    const newPiece = createNewPiece();
    const newNextPieces = createNextPieces();
    setCurrentPiece(newPiece);
    setNextPieces(newNextPieces);
  }, [createNewPiece, createNextPieces, clearLockDelay]);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || gameOver || isPaused) return false;

    const moves = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      down: { x: 0, y: 1 },
    };

    const newPosition = {
      x: currentPiece.position.x + moves[direction].x,
      y: currentPiece.position.y + moves[direction].y,
    };

    if (isValidMove(board, currentPiece, newPosition)) {
      const newPiece = { ...currentPiece, position: newPosition };
      setCurrentPiece(newPiece);
      
      // 移動後に接地している場合、Lock Delayを開始
      if (isGrounded(newPiece, board)) {
        startLockDelay();
      } else {
        // 接地していない場合、Lock Delayをクリア
        clearLockDelay();
      }
      
      return true;
    }

    if (direction === 'down') {
      // ピースを固定
      clearLockDelay(); // Lock Delayをクリア
      const newBoard = placePiece(board, currentPiece);
      const { newBoard: clearedBoard, linesCleared, clearedLineIndices } = clearLines(newBoard);
      
      // ラインクリアエフェクト
      if (linesCleared > 0) {
        setLinesClearingEffect(clearedLineIndices);
        if (linesCleared === 4) {
          setTetrisEffect(true);
        }
        
        // エフェクトを一定時間後にクリア
        setTimeout(() => {
          setLinesClearingEffect([]);
          setTetrisEffect(false);
        }, 800);
      }
      
      setBoard(clearedBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      
      // レベルアップチェック
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setDropTime(Math.max(50, INITIAL_DROP_TIME - (newLevel - 1) * 100));
      }

      // 新しいピース生成
      if (nextPieces.length > 0) {
        const newCurrentPiece = { 
          ...nextPieces[0], 
          position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPieces[0].shape[0].length / 2), y: 0 }
        };
        if (!isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position)) {
          setGameOver(true);
          return false;
        }
        setCurrentPiece(newCurrentPiece);
        
        // 次のピースリストを更新
        const tetrominoType = bagGeneratorRef.current.getNext();
        const tetromino = TETROMINOS[tetrominoType];
        const newPiece = {
          shape: tetromino.shape,
          color: tetromino.color,
          position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
        };
        const newNextPieces = [...nextPieces.slice(1), newPiece];
        setNextPieces(newNextPieces);
      }
    }

    return false;
  }, [currentPiece, board, gameOver, isPaused, level, lines, nextPieces, isGrounded, startLockDelay, clearLockDelay]);

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotatedShape = rotatePiece(currentPiece.shape);
    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    // 壁キック処理
    let newPosition = currentPiece.position;
    const kicks = [
      { x: 0, y: 0 },   // 元の位置
      { x: -1, y: 0 },  // 左に1マス
      { x: 1, y: 0 },   // 右に1マス
      { x: 0, y: -1 },  // 上に1マス
      { x: -2, y: 0 },  // 左に2マス
      { x: 2, y: 0 },   // 右に2マス
    ];

    for (const kick of kicks) {
      const testPosition = {
        x: currentPiece.position.x + kick.x,
        y: currentPiece.position.y + kick.y,
      };
      
      if (isValidMove(board, rotatedPiece, testPosition)) {
        newPosition = testPosition;
        break;
      }
    }

    if (isValidMove(board, rotatedPiece, newPosition)) {
      const newPiece = { ...rotatedPiece, position: newPosition };
      setCurrentPiece(newPiece);
      
      // 回転後に接地している場合、Lock Delayをリセット
      if (isGrounded(newPiece, board)) {
        startLockDelay();
      } else {
        clearLockDelay();
      }
    }
  }, [currentPiece, board, gameOver, isPaused, isGrounded, startLockDelay, clearLockDelay]);

  const hardDropHandler = useCallback(() => {
    if (gameOver || isPaused || !currentPiece) return;
    
    clearLockDelay(); // Lock Delayをクリア
    
    let newPiece = { ...currentPiece };
    while (isValidMove(board, newPiece, { x: newPiece.position.x, y: newPiece.position.y + 1 })) {
      newPiece.position.y += 1;
    }
    
    // ピースを固定
    const newBoard = placePiece(board, newPiece);
    const { newBoard: clearedBoard, linesCleared, clearedLineIndices } = clearLines(newBoard);
    
    // ラインクリアエフェクト
    if (linesCleared > 0) {
      setLinesClearingEffect(clearedLineIndices);
      if (linesCleared === 4) {
        setTetrisEffect(true);
      }
      
      // エフェクトを一定時間後にクリア
      setTimeout(() => {
        setLinesClearingEffect([]);
        setTetrisEffect(false);
      }, 800);
    }
    
    setBoard(clearedBoard);
    setLines(prev => prev + linesCleared);
    setScore(prev => prev + linesCleared * 100 * level);
    
    // レベルアップチェック
    const newLines = lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setDropTime(Math.max(50, INITIAL_DROP_TIME - (newLevel - 1) * 100));
    }

    // 新しいピース生成
    if (nextPieces.length > 0) {
      const newCurrentPiece = { 
        ...nextPieces[0], 
        position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPieces[0].shape[0].length / 2), y: 0 }
      };
      if (!isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position)) {
        setGameOver(true);
        return false;
      }
      setCurrentPiece(newCurrentPiece);
      
      // 次のピースリストを更新
      const tetrominoType = bagGeneratorRef.current.getNext();
      const tetromino = TETROMINOS[tetrominoType];
      const newPiece = {
        shape: tetromino.shape,
        color: tetromino.color,
        position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
      };
      const newNextPieces = [...nextPieces.slice(1), newPiece];
      setNextPieces(newNextPieces);
    }
  }, [board, currentPiece, gameOver, isPaused, level, lines, nextPieces, clearLockDelay]);

  // キーボードイベント
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameOver) return;

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          event.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
          event.preventDefault();
          rotatePieceHandler();
          break;
        case 'Enter':
          event.preventDefault();
          hardDropHandler();
          break;
        case 'Space':
          event.preventDefault();
          if (!gameOver) {
            setIsPaused(true);
            setShowPauseModal(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePieceHandler, hardDropHandler, gameOver]);

  // ゲームループ
  useEffect(() => {
    if (!gameOver && !isPaused && currentPiece) {
      gameLoopRef.current = window.setInterval(() => {
        movePiece('down');
      }, dropTime);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameOver, isPaused, currentPiece, dropTime, movePiece]);

  // 初期化
  useEffect(() => {
    startGame();
  }, [startGame]);

  // ボードの描画
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // 現在のピースを描画
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) =>
      row.map((cell, x) => {
        let className = 'cell';
        let style: React.CSSProperties = {};

        if (cell) {
          className += ' filled';
          style.backgroundColor = cell;
          style.boxShadow = `0 0 6px ${cell}60`;
        }

        // ゴーストピースの描画
        if (!cell && currentPiece) {
          const ghostPos = getGhostPosition(board, currentPiece);
          for (let gy = 0; gy < currentPiece.shape.length; gy++) {
            for (let gx = 0; gx < currentPiece.shape[gy].length; gx++) {
              if (currentPiece.shape[gy][gx]) {
                const ghostY = ghostPos.y + gy;
                const ghostX = ghostPos.x + gx;
                if (ghostY === y && ghostX === x && ghostPos.y !== currentPiece.position.y) {
                  className += ' ghost';
                  style.backgroundColor = currentPiece.color;
                  style.opacity = 0.3;
                }
              }
            }
          }
        }

        // クリアされるラインのハイライト
        if (linesClearingEffect.includes(y)) {
          className += ' line-clearing';
        }

        return (
          <div
            key={`${x}-${y}`}
            className={className}
            style={style}
          ></div>
        );
      })
    );
  };

  const renderNextPieces = () => {
    return nextPieces.map((piece, index) => {
      // ピースの実際のサイズを計算
      const maxSize = Math.max(piece.shape.length, piece.shape[0]?.length || 0);
      const gridSize = maxSize === 4 ? 4 : maxSize === 2 ? 2 : 3;
      
      return (
        <div key={index} className="next-piece">
          <div 
            className="next-piece-grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 16px)`,
              gridTemplateRows: `repeat(${gridSize}, 16px)`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, cellIndex) => {
              const x = cellIndex % gridSize;
              const y = Math.floor(cellIndex / gridSize);
              const cell = piece.shape[y]?.[x] || 0;
              
              return (
                <div
                  key={cellIndex}
                  className={`next-cell ${cell ? 'filled' : ''}`}
                  style={{
                    backgroundColor: cell ? piece.color : 'transparent',
                    boxShadow: cell ? `0 0 4px ${piece.color}60` : 'none',
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  // ポーズ処理
  const handlePause = useCallback(() => {
    if (gameOver) return;
    setIsPaused(true);
    setShowPauseModal(true);
  }, [gameOver]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    setShowPauseModal(false);
  }, []);

  const handleRestartFromPause = useCallback(() => {
    setShowPauseModal(false);
    startGame();
  }, [startGame]);

  return (
    <div className="tetris-game">
      <div className="game-header">
        <div className="header-left">
          {onBackToHome && (
            <button onClick={onBackToHome} className="header-button">
              HOME
            </button>
          )}
        </div>
        <div className="header-right">
          <button 
            onClick={() => setShowControlsModal(true)} 
            className="header-button"
          >
            CONTROLS
          </button>
        </div>
      </div>
      
      <div className="game-container">
        <div className="game-info-left">
          <div className="info-panel">
            <div className="next-pieces-container">
              {renderNextPieces()}
            </div>
          </div>
        </div>

        <div className="game-board">
          <div className="board-container">
            <div className="board-grid">
              {renderBoard()}
            </div>
            {tetrisEffect && <div className="tetris-effect">TETRIS!</div>}
          </div>
        </div>

        <div className="game-info-right">
          <div className="info-panel">
            <div className="stat">
              <div className="stat-label">SCORE</div>
              <div className="stat-value">{score.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-label">LEVEL</div>
              <div className="stat-value">{level}</div>
            </div>
            <div className="stat">
              <div className="stat-label">LINES</div>
              <div className="stat-value">{lines}</div>
            </div>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>GAME OVER</h2>
            <p>Score: {score.toLocaleString()}</p>
            <p>Level: {level}</p>
            <p>Lines: {lines}</p>
            <button onClick={startGame} className="control-button">
              NEW GAME
            </button>
          </div>
        </div>
      )}

      {/* ポーズモーダル */}
      {showPauseModal && (
        <div className="controls-overlay">
          <div className="pause-modal">
            <h2>PAUSED</h2>
            <div className="pause-buttons">
              <button onClick={handleResume} className="modal-button resume-button">
                RESUME
              </button>
              <button onClick={handleRestartFromPause} className="modal-button restart-button">
                RESTART
              </button>
            </div>
          </div>
        </div>
      )}

      {/* コントロールモーダル */}
      {showControlsModal && (
        <div className="controls-overlay">
          <div className="controls-modal">
            <h2>CONTROLS</h2>
            <div className="controls-list">
              <div className="control-item">
                <span>←→</span>
                <span>Move left/right</span>
              </div>
              <div className="control-item">
                <span>↓</span>
                <span>Soft drop</span>
              </div>
              <div className="control-item">
                <span>↑</span>
                <span>Rotate</span>
              </div>
              <div className="control-item">
                <span>Enter</span>
                <span>Hard drop</span>
              </div>
              <div className="control-item">
                <span>Space</span>
                <span>Pause/Resume</span>
              </div>
            </div>
            <button 
              onClick={() => setShowControlsModal(false)} 
              className="control-button"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tetris;