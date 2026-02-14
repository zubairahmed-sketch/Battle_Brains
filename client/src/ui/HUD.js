// ============================================================
// HUD — Heads-Up Display (floating text, notifications)
// Shared across all game modes  ─  RESPONSIVE
// ============================================================

import Phaser from "phaser";
import { CONFIG } from "../config.js";

export class HUD {
  constructor(scene) {
    this.scene = scene;
    const s = CONFIG.s(scene);
    const W = scene.scale.width;
    this.notifContainer = scene.add
      .container(W / 2, Math.round(100 * s))
      .setDepth(200);
  }

  // Show floating score text (e.g., "+10")
  showFloatingText(text, color = CONFIG.COLORS.GREEN) {
    const s = CONFIG.s(this.scene);
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const hex = "#" + color.toString(16).padStart(6, "0");
    const spread = Math.round(100 * s);
    const floater = this.scene.add
      .text(
        W / 2 + Phaser.Math.Between(-spread, spread),
        H / 2,
        text,
        {
          fontSize: CONFIG.fs(this.scene, 36),
          color: hex,
          fontStyle: "bold",
          stroke: "#ffd700",
          strokeThickness: Math.max(2, Math.round(4 * s)),
          shadow: { offsetX: 0, offsetY: Math.round(4 * s), color: '#ffd700', blur: Math.round(12 * s), fill: true },
        },
      )
      .setOrigin(0.5)
      .setDepth(200);

    this.scene.tweens.add({
      targets: floater,
      y: floater.y - Math.round(80 * s),
      alpha: 0,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => floater.destroy(),
    });
  }

  // Show power-up notification banner
  showPowerUpNotification(type, team, description) {
    const s = CONFIG.s(this.scene);
    const W = this.scene.scale.width;
    const bannerW = Math.min(Math.round(500 * s), W - 20);
    const bannerH = Math.max(36, Math.round(50 * s));
    const icons = { double: "⚡", freeze: "❄️", shield: "🛡️" };
    const icon = icons[type] || "✨";
    const color = team === "red" ? "#ff6b6b" : "#74b9ff";

    // Reposition container for current screen size
    this.notifContainer.setPosition(W / 2, Math.round(100 * s));

    // Glassy notification background with glow
    const bg = this.scene.add
      .rectangle(0, 0, bannerW, bannerH, 0xffffff, 0.13)
      .setStrokeStyle(
        Math.max(2, Math.round(3 * s)),
        team === "red" ? CONFIG.COLORS.RED : CONFIG.COLORS.BLUE,
      )
      .setDepth(1);
    const shadow = this.scene.add
      .rectangle(Math.round(6 * s), Math.round(8 * s), bannerW, bannerH, 0x000000, 0.13)
      .setDepth(0);
    const txt = this.scene.add
      .text(0, 0, `${icon} ${description}`, {
        fontSize: CONFIG.fs(this.scene, 22),
        color: color,
        fontStyle: "bold",
        shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: Math.round(8 * s), fill: true },
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
        shadow.destroy();
        txt.destroy();
      },
    });
  }
}
