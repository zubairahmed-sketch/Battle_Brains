// ============================================================
// Game Config Constants — shared across all scenes
// ============================================================

export const CONFIG = {
  // Server
  SERVER_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin,

  // Canvas
  WIDTH: 1280,
  HEIGHT: 720,

  // Colors  
  COLORS: {
    RED: 0xe74c3c,
    RED_LIGHT: 0xff6b6b,
    BLUE: 0x3498db,
    BLUE_LIGHT: 0x74b9ff,
    GOLD: 0xffd700,
    GREEN: 0x2ecc71,
    DARK: 0x0a0a2e,
    WHITE: 0xffffff,
    GRAY: 0x95a5a6,
    PURPLE: 0x9b59b6,
    ORANGE: 0xe67e22,
    MUD: 0x8B6914,
  },

  // Team keyboard bindings (single-device mode)
  KEYS: {
    RED: {
      ANSWER: ['Q', 'W', 'E', 'R'],        // options 1-4
      POWERUP: 'T'
    },
    BLUE: {
      ANSWER: ['U', 'I', 'O', 'P'],        // options 1-4
      POWERUP: 'Y'
    }
  },

  // Game
  ROUND_DURATION: 15,    // seconds per question
  POWER_UPS: ['double', 'freeze', 'shield'],

  // Fonts
  FONT: {
    TITLE: { fontSize: '48px', fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', color: '#ffd700' },
    HEADING: { fontSize: '32px', fontFamily: 'Arial, sans-serif', color: '#ffffff' },
    BODY: { fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#ffffff' },
    SMALL: { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#cccccc' },
    BUTTON: { fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#ffffff' },
    QUESTION: { fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#ffffff', wordWrap: { width: 600 } }
  }
};
