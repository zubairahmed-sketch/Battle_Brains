// ============================================================
// BattleBrains — Main Entry Point (Phaser 3 Game Config)
// ============================================================

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { TugOfWarScene } from './scenes/TugOfWarScene.js';
import { RocketRushScene } from './scenes/RocketRushScene.js';
import { CatapultClashScene } from './scenes/CatapultClashScene.js';
import { WinScene } from './scenes/WinScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#0a0a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, LobbyScene, TugOfWarScene, RocketRushScene, CatapultClashScene, WinScene],
  input: {
    activePointers: 4, // support multi-touch
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};

const game = new Phaser.Game(config);

// Hide loading screen once Phaser is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    const el = document.getElementById('loading');
    if (el) el.classList.add('hidden');
  }, 800);
});

export default game;
