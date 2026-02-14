// ============================================================
// PowerUpBar — Shows available power-ups for each team
// Touch-tap or keyboard to activate
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
    const icons = { double: "⚡ 2x", freeze: "❄️ Ice", shield: "🛡️ Def" };
    const colors = { double: 0xf39c12, freeze: 0x00cec9, shield: 0x6c5ce7 };

    // Red team power-ups (left side)
    this.redButtons = [];
    this.powerUps.forEach((type, i) => {
      const x = 30 + i * 60;
      const y = this.scene.scale.height / 2 - 50;

      // Glassy, glowing button with shadow
      const shadow = this.scene.add
        .ellipse(x + 4, y + 8, 52, 24, 0x000000, 0.18)
        .setDepth(89);
      const bg = this.scene.add
        .ellipse(x, y, 52, 52, colors[type], 0.7)
        .setStrokeStyle(3, 0xff6b6b)
        .setDepth(90)
        .setInteractive({ useHandCursor: true });
      const glass = this.scene.add
        .ellipse(x, y, 52, 52, 0xffffff, 0.10)
        .setDepth(91);
      const label = this.scene.add
        .text(x, y, icons[type], {
          fontSize: "15px",
          color: "#fff",
          align: "center",
          fontStyle: "bold",
          shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: 6, fill: true },
        })
        .setOrigin(0.5)
        .setDepth(92);
      const keyHint = this.scene.add
        .text(x, y + 32, `[${CONFIG.KEYS.RED.POWERUP}]`, {
          fontSize: "11px",
          color: "#ff6b6b",
          shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
        })
        .setOrigin(0.5)
        .setDepth(92);
      bg.on("pointerdown", () => {
        SocketManager.usePowerUp(type);
        bg.setAlpha(0.3);
      });
      this.redButtons.push({ bg, label, type });
      // Add all to scene
      this.scene.children.bringToTop(label);
    });

    // Blue team power-ups (right side)
    this.blueButtons = [];
    this.powerUps.forEach((type, i) => {
      const x = W - 30 - i * 60;
      const y = this.scene.scale.height / 2 - 50;

      // Glassy, glowing button with shadow
      const shadow = this.scene.add
        .ellipse(x + 4, y + 8, 52, 24, 0x000000, 0.18)
        .setDepth(89);
      const bg = this.scene.add
        .ellipse(x, y, 52, 52, colors[type], 0.7)
        .setStrokeStyle(3, 0x74b9ff)
        .setDepth(90)
        .setInteractive({ useHandCursor: true });
      const glass = this.scene.add
        .ellipse(x, y, 52, 52, 0xffffff, 0.10)
        .setDepth(91);
      const label = this.scene.add
        .text(x, y, icons[type], {
          fontSize: "15px",
          color: "#fff",
          align: "center",
          fontStyle: "bold",
          shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: 6, fill: true },
        })
        .setOrigin(0.5)
        .setDepth(92);
      const keyHint = this.scene.add
        .text(x, y + 32, `[${CONFIG.KEYS.BLUE.POWERUP}]`, {
          fontSize: "11px",
          color: "#74b9ff",
          shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
        })
        .setOrigin(0.5)
        .setDepth(92);
      bg.on("pointerdown", () => {
        SocketManager.usePowerUp(type);
        bg.setAlpha(0.3);
      });
      this.blueButtons.push({ bg, label, type });
      // Add all to scene
      this.scene.children.bringToTop(label);
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
