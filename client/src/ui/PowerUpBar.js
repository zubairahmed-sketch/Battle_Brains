// ============================================================
// PowerUpBar — Shows available power-ups for each team
// Touch-tap or keyboard to activate  ─  RESPONSIVE
// ============================================================

import { CONFIG } from "../config.js";
import { SocketManager } from "../network/SocketManager.js";

export class PowerUpBar {
  constructor(scene) {
    this.scene = scene;
    this.powerUps = ["double", "freeze", "shield"];
    this._build();
  }

  _build() {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const s = CONFIG.s(this.scene);
    const btnSize = Math.max(28, Math.round(46 * s));
    const gap = Math.max(4, Math.round(10 * s));
    const margin = Math.max(8, Math.round(20 * s));
    const showKeys = W > 600; // hide keyboard hints on small screens
    const icons = { double: "⚡ 2x", freeze: "❄️ Ice", shield: "🛡️ Def" };
    const colors = { double: 0xf39c12, freeze: 0x00cec9, shield: 0x6c5ce7 };
    const labelFs = CONFIG.fs(this.scene, 14);
    const keyFs = CONFIG.fs(this.scene, 11);

    // Red team power-ups (left side)
    this.redButtons = [];
    this.powerUps.forEach((type, i) => {
      const x = margin + i * (btnSize + gap) + btnSize / 2;
      const y = H / 2 - Math.round(40 * s);

      const shadow = this.scene.add
        .ellipse(x + Math.round(4 * s), y + Math.round(8 * s), btnSize, Math.round(btnSize * 0.46), 0x000000, 0.18)
        .setDepth(89);
      const bg = this.scene.add
        .ellipse(x, y, btnSize, btnSize, colors[type], 0.7)
        .setStrokeStyle(Math.max(2, Math.round(3 * s)), 0xff6b6b)
        .setDepth(90)
        .setInteractive({ useHandCursor: true });
      const glass = this.scene.add
        .ellipse(x, y, btnSize, btnSize, 0xffffff, 0.10)
        .setDepth(91);
      const label = this.scene.add
        .text(x, y, icons[type], {
          fontSize: labelFs,
          color: "#fff",
          align: "center",
          fontStyle: "bold",
          shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: Math.round(6 * s), fill: true },
        })
        .setOrigin(0.5)
        .setDepth(92);

      if (showKeys) {
        this.scene.add
          .text(x, y + btnSize / 2 + Math.round(8 * s), `[${CONFIG.KEYS.RED.POWERUP}]`, {
            fontSize: keyFs,
            color: "#ff6b6b",
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
          })
          .setOrigin(0.5)
          .setDepth(92);
      }

      bg.on("pointerdown", () => {
        SocketManager.usePowerUp(type);
        bg.setAlpha(0.3);
      });
      this.redButtons.push({ bg, label, type });
    });

    // Blue team power-ups (right side)
    this.blueButtons = [];
    this.powerUps.forEach((type, i) => {
      const x = W - margin - i * (btnSize + gap) - btnSize / 2;
      const y = H / 2 - Math.round(40 * s);

      const shadow = this.scene.add
        .ellipse(x + Math.round(4 * s), y + Math.round(8 * s), btnSize, Math.round(btnSize * 0.46), 0x000000, 0.18)
        .setDepth(89);
      const bg = this.scene.add
        .ellipse(x, y, btnSize, btnSize, colors[type], 0.7)
        .setStrokeStyle(Math.max(2, Math.round(3 * s)), 0x74b9ff)
        .setDepth(90)
        .setInteractive({ useHandCursor: true });
      const glass = this.scene.add
        .ellipse(x, y, btnSize, btnSize, 0xffffff, 0.10)
        .setDepth(91);
      const label = this.scene.add
        .text(x, y, icons[type], {
          fontSize: labelFs,
          color: "#fff",
          align: "center",
          fontStyle: "bold",
          shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: Math.round(6 * s), fill: true },
        })
        .setOrigin(0.5)
        .setDepth(92);

      if (showKeys) {
        this.scene.add
          .text(x, y + btnSize / 2 + Math.round(8 * s), `[${CONFIG.KEYS.BLUE.POWERUP}]`, {
            fontSize: keyFs,
            color: "#74b9ff",
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
          })
          .setOrigin(0.5)
          .setDepth(92);
      }

      bg.on("pointerdown", () => {
        SocketManager.usePowerUp(type);
        bg.setAlpha(0.3);
      });
      this.blueButtons.push({ bg, label, type });
    });
  }

  useNext(team) {
    const buttons = team === "red" ? this.redButtons : this.blueButtons;
    const available = buttons.find((b) => b.bg.alpha > 0.5);
    if (available) {
      SocketManager.usePowerUp(available.type);
      available.bg.setAlpha(0.3);
    }
  }
}
