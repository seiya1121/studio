import React, { useState, useEffect } from 'react';
import './style.css';

interface Character {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  type: 'player' | 'enemy';
  avatar: string;
}

interface BattleArenaProps {
  onBackToHome: () => void;
}

const BattleArena: React.FC<BattleArenaProps> = ({ onBackToHome }) => {
  const [gameState, setGameState] = useState<'menu' | 'battle' | 'gameOver' | 'victory'>('menu');
  const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy'>('player');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [player, setPlayer] = useState<Character>({
    id: 'player',
    name: 'ヒーロー',
    hp: 100,
    maxHp: 100,
    attack: 25,
    defense: 10,
    speed: 15,
    type: 'player',
    avatar: '🛡️'
  });
  const [enemy, setEnemy] = useState<Character>({
    id: 'enemy',
    name: 'ドラゴン',
    hp: 80,
    maxHp: 80,
    attack: 20,
    defense: 8,
    speed: 12,
    type: 'enemy',
    avatar: '🐲'
  });

  const enemies = [
    { name: 'ゴブリン', hp: 60, attack: 15, defense: 5, speed: 20, avatar: '👹' },
    { name: 'ドラゴン', hp: 80, attack: 20, defense: 8, speed: 12, avatar: '🐲' },
    { name: 'デーモン', hp: 90, attack: 22, defense: 12, speed: 8, avatar: '👹' },
    { name: 'スケルトン', hp: 50, attack: 18, defense: 3, speed: 25, avatar: '💀' }
  ];

  const startBattle = () => {
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    setEnemy({
      id: 'enemy',
      name: randomEnemy.name,
      hp: randomEnemy.hp,
      maxHp: randomEnemy.hp,
      attack: randomEnemy.attack,
      defense: randomEnemy.defense,
      speed: randomEnemy.speed,
      type: 'enemy',
      avatar: randomEnemy.avatar
    });
    
    setPlayer(prev => ({ ...prev, hp: prev.maxHp }));
    setBattleLog([`${randomEnemy.name}が現れた！`]);
    setGameState('battle');
    setCurrentTurn(player.speed >= randomEnemy.speed ? 'player' : 'enemy');
  };

  const performAction = (action: string) => {
    if (currentTurn !== 'player') return;
    
    let damage = 0;
    let logMessage = '';
    
    switch (action) {
      case 'attack':
        damage = Math.max(1, player.attack - enemy.defense + Math.floor(Math.random() * 10) - 5);
        logMessage = `${player.name}の攻撃！ ${enemy.name}に${damage}のダメージ！`;
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
        break;
      case 'defend':
        logMessage = `${player.name}は防御を固めた！`;
        setPlayer(prev => ({ ...prev, defense: prev.defense + 5 }));
        break;
      case 'heal':
        const healAmount = 20;
        logMessage = `${player.name}は回復した！ HP+${healAmount}`;
        setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) }));
        break;
    }
    
    setBattleLog(prev => [...prev, logMessage]);
    setSelectedAction(null);
    setCurrentTurn('enemy');
  };

  const enemyTurn = () => {
    if (currentTurn !== 'enemy' || enemy.hp <= 0) return;
    
    setTimeout(() => {
      const actions = ['attack', 'defend'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      let damage = 0;
      let logMessage = '';
      
      switch (action) {
        case 'attack':
          damage = Math.max(1, enemy.attack - player.defense + Math.floor(Math.random() * 8) - 4);
          logMessage = `${enemy.name}の攻撃！ ${player.name}に${damage}のダメージ！`;
          setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
          break;
        case 'defend':
          logMessage = `${enemy.name}は身構えた！`;
          setEnemy(prev => ({ ...prev, defense: prev.defense + 3 }));
          break;
      }
      
      setBattleLog(prev => [...prev, logMessage]);
      setCurrentTurn('player');
    }, 1500);
  };

  useEffect(() => {
    if (currentTurn === 'enemy' && gameState === 'battle') {
      enemyTurn();
    }
  }, [currentTurn, gameState]);

  useEffect(() => {
    if (player.hp <= 0) {
      setBattleLog(prev => [...prev, `${player.name}は倒れた...`]);
      setGameState('gameOver');
    } else if (enemy.hp <= 0) {
      setBattleLog(prev => [...prev, `${enemy.name}を倒した！勝利！`]);
      setGameState('victory');
    }
  }, [player.hp, enemy.hp]);

  const resetGame = () => {
    setPlayer(prev => ({ ...prev, hp: prev.maxHp, defense: 10 }));
    setEnemy(prev => ({ ...prev, defense: 8 }));
    setBattleLog([]);
    setCurrentTurn('player');
    setSelectedAction(null);
    setGameState('menu');
  };

  const renderMenu = () => (
    <div className="battle-menu">
      <div className="menu-content">
        <h1 className="game-title">⚔️ Battle Arena ⚔️</h1>
        <p className="game-subtitle">ターンベース戦略バトル</p>
        
        <div className="hero-stats">
          <h3>ヒーローステータス</h3>
          <div className="stats-grid">
            <div className="stat">HP: {player.maxHp}</div>
            <div className="stat">攻撃力: {player.attack}</div>
            <div className="stat">防御力: {player.defense}</div>
            <div className="stat">素早さ: {player.speed}</div>
          </div>
        </div>
        
        <button className="start-battle-btn" onClick={startBattle}>
          バトル開始
        </button>
        
        <button className="back-btn" onClick={onBackToHome}>
          ホームに戻る
        </button>
      </div>
    </div>
  );

  const renderBattle = () => (
    <div className="battle-screen">
      <div className="battle-header">
        <h2>⚔️ バトル中 ⚔️</h2>
        <div className="turn-indicator">
          {currentTurn === 'player' ? 'あなたのターン' : '敵のターン'}
        </div>
      </div>
      
      <div className="battle-field">
        <div className="character player-character">
          <div className="character-avatar">{player.avatar}</div>
          <div className="character-info">
            <h3>{player.name}</h3>
            <div className="hp-bar">
              <div 
                className="hp-fill" 
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              ></div>
            </div>
            <div className="hp-text">{player.hp}/{player.maxHp}</div>
          </div>
        </div>
        
        <div className="vs-indicator">VS</div>
        
        <div className="character enemy-character">
          <div className="character-avatar">{enemy.avatar}</div>
          <div className="character-info">
            <h3>{enemy.name}</h3>
            <div className="hp-bar">
              <div 
                className="hp-fill enemy-hp" 
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              ></div>
            </div>
            <div className="hp-text">{enemy.hp}/{enemy.maxHp}</div>
          </div>
        </div>
      </div>
      
      {currentTurn === 'player' && (
        <div className="action-panel">
          <h3>行動を選択してください</h3>
          <div className="action-buttons">
            <button 
              className="action-btn attack-btn" 
              onClick={() => performAction('attack')}
            >
              ⚔️ 攻撃
            </button>
            <button 
              className="action-btn defend-btn" 
              onClick={() => performAction('defend')}
            >
              🛡️ 防御
            </button>
            <button 
              className="action-btn heal-btn" 
              onClick={() => performAction('heal')}
            >
              💚 回復
            </button>
          </div>
        </div>
      )}
      
      <div className="battle-log">
        <h4>バトルログ</h4>
        <div className="log-content">
          {battleLog.map((log, index) => (
            <div key={index} className="log-entry">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="game-over">
      <h1 className="result-title defeat">💀 敗北 💀</h1>
      <p>あなたは倒れてしまいました...</p>
      <div className="result-actions">
        <button className="retry-btn" onClick={resetGame}>
          リトライ
        </button>
        <button className="back-btn" onClick={onBackToHome}>
          ホームに戻る
        </button>
      </div>
    </div>
  );

  const renderVictory = () => (
    <div className="victory">
      <h1 className="result-title victory">🏆 勝利 🏆</h1>
      <p>見事に敵を倒しました！</p>
      <div className="result-actions">
        <button className="retry-btn" onClick={resetGame}>
          次のバトル
        </button>
        <button className="back-btn" onClick={onBackToHome}>
          ホームに戻る
        </button>
      </div>
    </div>
  );

  return (
    <div className="battle-arena">
      {gameState === 'menu' && renderMenu()}
      {gameState === 'battle' && renderBattle()}
      {gameState === 'gameOver' && renderGameOver()}
      {gameState === 'victory' && renderVictory()}
    </div>
  );
};

export default BattleArena; 