import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles.css';

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  velocity: number;
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  velocity: number;
  health: number;
  type: 'basic' | 'fast' | 'heavy';
}

interface Explosion {
  id: string;
  x: number;
  y: number;
  frame: number;
}

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface SpaceAdventureProps {
  onBackToHome?: () => void;
}

const SpaceAdventure: React.FC<SpaceAdventureProps> = ({ onBackToHome }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver' | 'menu'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [shipPosition, setShipPosition] = useState<Position>({ x: 400, y: 500 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [showControls, setShowControls] = useState(false);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const SHIP_SPEED = 5;
  const BULLET_SPEED = 8;
  const ENEMY_SPAWN_RATE = 0.02;

  // 星の初期化
  useEffect(() => {
    const initialStars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      initialStars.push({
        id: `star-${i}`,
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 1
      });
    }
    setStars(initialStars);
  }, []);

  // 弾丸発射
  const shootBullet = useCallback(() => {
    const newBullet: Bullet = {
      id: `bullet-${Date.now()}-${Math.random()}`,
      x: shipPosition.x + 20,
      y: shipPosition.y,
      velocity: BULLET_SPEED
    };
    setBullets(prev => [...prev, newBullet]);
  }, [shipPosition]);

  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        setKeysPressed(prev => new Set(prev).add(e.key.toLowerCase()));
        
        if (e.key === ' ') {
          e.preventDefault();
          shootBullet();
        } else if (e.key === 'Escape') {
          setGameState('paused');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, shootBullet]);

  // 敵の生成
  const spawnEnemy = useCallback(() => {
    if (Math.random() < ENEMY_SPAWN_RATE + (level * 0.01)) {
      const enemyTypes: Enemy['type'][] = ['basic', 'fast', 'heavy'];
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      
      let health, velocity;
      switch (type) {
        case 'basic':
          health = 1;
          velocity = 1 + level * 0.2;
          break;
        case 'fast':
          health = 1;
          velocity = 2 + level * 0.3;
          break;
        case 'heavy':
          health = 3;
          velocity = 0.5 + level * 0.1;
          break;
      }

      const newEnemy: Enemy = {
        id: `enemy-${Date.now()}-${Math.random()}`,
        x: Math.random() * (CANVAS_WIDTH - 40),
        y: -40,
        velocity,
        health,
        type
      };
      setEnemies(prev => [...prev, newEnemy]);
    }
  }, [level]);

  // 爆発エフェクト追加
  const addExplosion = useCallback((x: number, y: number) => {
    const explosion: Explosion = {
      id: `explosion-${Date.now()}-${Math.random()}`,
      x,
      y,
      frame: 0
    };
    setExplosions(prev => [...prev, explosion]);
  }, []);

  // ゲームループ
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      // 宇宙船移動
      setShipPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
          newX = Math.max(0, prev.x - SHIP_SPEED);
        }
        if (keysPressed.has('d') || keysPressed.has('arrowright')) {
          newX = Math.min(CANVAS_WIDTH - 40, prev.x + SHIP_SPEED);
        }
        if (keysPressed.has('w') || keysPressed.has('arrowup')) {
          newY = Math.max(0, prev.y - SHIP_SPEED);
        }
        if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
          newY = Math.min(CANVAS_HEIGHT - 40, prev.y + SHIP_SPEED);
        }

        return { x: newX, y: newY };
      });

      // 弾丸更新
      setBullets(prev => prev.map(bullet => ({
        ...bullet,
        y: bullet.y - bullet.velocity
      })).filter(bullet => bullet.y > -10));

      // 敵更新
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        y: enemy.y + enemy.velocity
      })).filter(enemy => enemy.y < CANVAS_HEIGHT + 40));

      // 星更新
      setStars(prev => prev.map(star => ({
        ...star,
        y: star.y + star.speed
      })).map(star => star.y > CANVAS_HEIGHT ? { ...star, y: -10, x: Math.random() * CANVAS_WIDTH } : star));

      // 爆発更新
      setExplosions(prev => prev.map(explosion => ({
        ...explosion,
        frame: explosion.frame + 1
      })).filter(explosion => explosion.frame < 10));

      // 衝突判定
      setBullets(prevBullets => {
        const bulletsToRemove: string[] = [];
        
        setEnemies(prevEnemies => {
          const enemiesToRemove: string[] = [];

          for (const bullet of prevBullets) {
            for (const enemy of prevEnemies) {
              if (bullet.x + 5 > enemy.x && bullet.x < enemy.x + 40 &&
                  bullet.y + 10 > enemy.y && bullet.y < enemy.y + 40) {
                bulletsToRemove.push(bullet.id);
                enemy.health--;
                if (enemy.health <= 0) {
                  enemiesToRemove.push(enemy.id);
                  addExplosion(enemy.x + 20, enemy.y + 20);
                  setScore(prev => prev + (enemy.type === 'heavy' ? 30 : enemy.type === 'fast' ? 20 : 10));
                }
                break;
              }
            }
          }

          return prevEnemies.filter(enemy => !enemiesToRemove.includes(enemy.id));
        });

        return prevBullets.filter(bullet => !bulletsToRemove.includes(bullet.id));
      });

      // 宇宙船と敵の衝突判定
      setEnemies(prevEnemies => {
        for (const enemy of prevEnemies) {
          if (shipPosition.x + 40 > enemy.x && shipPosition.x < enemy.x + 40 &&
              shipPosition.y + 40 > enemy.y && shipPosition.y < enemy.y + 40) {
            addExplosion(shipPosition.x + 20, shipPosition.y + 20);
            setLives(prev => {
              if (prev <= 1) {
                setGameState('gameOver');
                return 0;
              }
              return prev - 1;
            });
            setShipPosition({ x: 400, y: 500 });
            return prevEnemies.filter(e => e.id !== enemy.id);
          }
        }
        return prevEnemies;
      });

      spawnEnemy();

      // レベルアップ判定
      if (score > 0 && score % 500 === 0) {
        setLevel(prev => prev + 1);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, keysPressed, shipPosition, spawnEnemy, addExplosion, score]);

  // 描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // 背景クリア
      ctx.fillStyle = '#000014';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 星描画
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (gameState === 'playing' || gameState === 'paused') {
        // 宇宙船描画
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(shipPosition.x, shipPosition.y, 40, 40);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(shipPosition.x + 10, shipPosition.y + 35, 20, 5);

        // 弾丸描画
        ctx.fillStyle = '#ff0000';
        bullets.forEach(bullet => {
          ctx.fillRect(bullet.x, bullet.y, 5, 10);
        });

        // 敵描画
        enemies.forEach(enemy => {
          switch (enemy.type) {
            case 'basic':
              ctx.fillStyle = '#ff0080';
              break;
            case 'fast':
              ctx.fillStyle = '#ff8000';
              break;
            case 'heavy':
              ctx.fillStyle = '#8000ff';
              break;
          }
          ctx.fillRect(enemy.x, enemy.y, 40, 40);
        });

        // 爆発描画
        explosions.forEach(explosion => {
          const intensity = 1 - (explosion.frame / 10);
          ctx.fillStyle = `rgba(255, 255, 0, ${intensity})`;
          const size = 20 + explosion.frame * 2;
          ctx.fillRect(explosion.x - size/2, explosion.y - size/2, size, size);
        });
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [gameState, shipPosition, bullets, enemies, explosions, stars]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setShipPosition({ x: 400, y: 500 });
    setBullets([]);
    setEnemies([]);
    setExplosions([]);
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const restartGame = () => {
    startGame();
  };

  const goToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="space-adventure">
      <div className="game-header">
        <div className="header-left">
          {onBackToHome && (
            <button className="header-button" onClick={onBackToHome}>
              ← ホーム
            </button>
          )}
          <h1 className="cyber-title">SPACE ADVENTURE</h1>
        </div>
        <div className="header-right">
          <button className="header-button" onClick={() => setShowControls(true)}>
            操作方法
          </button>
        </div>
      </div>

      <div className="game-container">
        <div className="game-info-left">
          <div className="info-panel">
            <h3>ゲーム情報</h3>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">スコア</span>
                <span className="stat-value">{score.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">レベル</span>
                <span className="stat-value">{level}</span>
              </div>
              <div className="stat">
                <span className="stat-label">ライフ</span>
                <span className="stat-value">{lives}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="game-board">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
          />
        </div>

        <div className="game-info-right">
          <div className="info-panel">
            <h3>敵の種類</h3>
            <div className="enemy-types">
              <div className="enemy-type">
                <div className="enemy-preview basic"></div>
                <span>基本敵 (10pt)</span>
              </div>
              <div className="enemy-type">
                <div className="enemy-preview fast"></div>
                <span>高速敵 (20pt)</span>
              </div>
              <div className="enemy-type">
                <div className="enemy-preview heavy"></div>
                <span>重装敵 (30pt)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メニュー画面 */}
      {gameState === 'menu' && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>SPACE ADVENTURE</h2>
            <p>宇宙船を操縦して敵を倒そう！</p>
            <div className="pause-buttons">
              <button className="modal-button" onClick={startGame}>
                ゲーム開始
              </button>
              <button className="modal-button" onClick={() => setShowControls(true)}>
                操作方法
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ポーズ画面 */}
      {gameState === 'paused' && (
        <div className="game-over-overlay">
          <div className="pause-modal">
            <h2>ポーズ</h2>
            <div className="pause-buttons">
              <button className="modal-button resume-button" onClick={resumeGame}>
                再開
              </button>
              <button className="modal-button restart-button" onClick={restartGame}>
                リスタート
              </button>
              <button className="modal-button" onClick={goToMenu}>
                メニューに戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ゲームオーバー画面 */}
      {gameState === 'gameOver' && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>ゲームオーバー</h2>
            <p>最終スコア: {score.toLocaleString()}点</p>
            <p>到達レベル: {level}</p>
            <div className="pause-buttons">
              <button className="modal-button restart-button" onClick={restartGame}>
                もう一度プレイ
              </button>
              <button className="modal-button" onClick={goToMenu}>
                メニューに戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 操作方法モーダル */}
      {showControls && (
        <div className="controls-overlay">
          <div className="controls-modal">
            <h2>操作方法</h2>
            <div className="controls-list">
              <div className="control-item">
                <span>WASD / 矢印キー</span>
                <span>宇宙船移動</span>
              </div>
              <div className="control-item">
                <span>スペース</span>
                <span>弾丸発射</span>
              </div>
              <div className="control-item">
                <span>ESC</span>
                <span>ポーズ</span>
              </div>
            </div>
            <button className="modal-button" onClick={() => setShowControls(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceAdventure; 