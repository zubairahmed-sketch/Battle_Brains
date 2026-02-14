// ============================================================
// HUD — Heads-Up Display (floating text, notifications)
// Shared across all game modes
// ============================================================

import Phaser from "phaser";
import { CONFIG } from "../config.js";

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.notifContainer = scene.add
      .container(scene.scale.width / 2, 120)
      .setDepth(200);
  }

  // Show floating score text (e.g., "+10")
  showFloatingText(text, color = CONFIG.COLORS.GREEN) {
    const hex = "#" + color.toString(16).padStart(6, "0");
    const floater = this.scene.add
      .text(
        this.scene.scale.width / 2 + Phaser.Math.Between(-100, 100),
        this.scene.scale.height / 2,
        text,
        {
          fontSize: "36px",
          color: hex,
          fontStyle: "bold",
          stroke: "#ffd700",
          strokeThickness: 4,
          shadow: { offsetX: 0, offsetY: 4, color: '#ffd700', blur: 12, fill: true },
        },
      )
      .setOrigin(0.5)
      .setDepth(200);

    this.scene.tweens.add({
      targets: floater,
      y: floater.y - 80,
      alpha: 0,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => floater.destroy(),
    });
  }

  // Show power-up notification banner
  showPowerUpNotification(type, team, description) {
    const icons = { double: "⚡", freeze: "❄️", shield: "🛡️" };
    const icon = icons[type] || "✨";
    const color = team === "red" ? "#ff6b6b" : "#74b9ff";

    // Glassy notification background with glow
    const bg = this.scene.add
      .rectangle(0, 0, 500, 54, 0xffffff, 0.13)
      .setStrokeStyle(
        3,
        team === "red" ? CONFIG.COLORS.RED : CONFIG.COLORS.BLUE,
      )
      .setDepth(1);
    const shadow = this.scene.add
      .rectangle(6, 8, 500, 54, 0x000000, 0.13)
      .setDepth(0);
    const txt = this.scene.add
      .text(0, 0, `${icon} ${description}`, {
        fontSize: "24px",
        color: color,
        fontStyle: "bold",
        shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: 8, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.notifContainer.add([shadow, bg, txt]);
    this.notifContainer.setAlpha(1);

    this.scene.tweens.add({
      targets: this.notifContainer,
      alpha: 0,
      duration: 3000,
      delay: 1000,
      onComplete: () => {
        bg.destroy();
        txt.destroy();
      },
    });
  }
}
