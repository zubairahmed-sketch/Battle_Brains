// ============================================================
// QuestionOverlay — Shows quiz question + 4 answer options
// Supports both touch (tap buttons) and keyboard input
// Positioned at bottom-center of game scene
// ============================================================

import { CONFIG } from "../config.js";

export class QuestionOverlay {
  constructor(scene, onAnswer) {
    this.scene = scene;
    this.onAnswer = onAnswer;
    this.container = scene.add.container(
      scene.scale.width / 2,
      scene.scale.height - 180,
    );
    this.answeredTeams = { red: false, blue: false }; // per-team tracking (supports single-device mode)
    this.optionButtons = [];
    this._build();
  }

  _build() {
    // ── Background panel ──
    // Glassmorphism background with glowing border
    this.bg = this.scene.add
      .rectangle(0, 0, 700, 200, 0xffffff, 0.13)
      .setStrokeStyle(4, CONFIG.COLORS.GOLD)
      .setDepth(1);
    // Soft shadow effect (fake 3D)
    this.shadow = this.scene.add
      .rectangle(8, 12, 700, 200, 0x000000, 0.18)
      .setDepth(0);
    this.container.add([this.shadow, this.bg]);

    // ── Category badge ──
    this.categoryText = this.scene.add.text(-320, -85, "", {
      fontSize: "14px",
      color: "#ffd700",
      fontStyle: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
    });
    this.container.add(this.categoryText);

    // ── Question text ──
    this.questionText = this.scene.add
      .text(0, -55, "Waiting for question...", {
        ...CONFIG.FONT.QUESTION,
        align: "center",
        wordWrap: { width: 640 },
        fontSize: "28px",
        color: "#fff",
        fontStyle: "bold",
        shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: 8, fill: true },
      })
      .setOrigin(0.5);
    this.container.add(this.questionText);

    // ── Answer options (2x2 grid) ──
    const positions = [
      { x: -165, y: 20 }, // Top-left
      { x: 165, y: 20 }, // Top-right
      { x: -165, y: 70 }, // Bottom-left
      { x: 165, y: 70 }, // Bottom-right
    ];

    const redKeyLabels = CONFIG.KEYS.RED.ANSWER; // Q, W, E, R
    const blueKeyLabels = CONFIG.KEYS.BLUE.ANSWER; // U, I, O, P

    positions.forEach((pos, i) => {
      // Option background with glassy look and glow
      const optBg = this.scene.add
        .rectangle(pos.x, pos.y, 300, 42, 0xffffff, 0.18)
        .setStrokeStyle(2, 0x6c5ce7)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });

      // Option shadow for 3D effect
      const optShadow = this.scene.add
        .rectangle(pos.x + 4, pos.y + 6, 300, 42, 0x000000, 0.13)
        .setDepth(1);

      // Key hints on left and right
      const redKeyHint = this.scene.add
        .text(pos.x - 140, pos.y, redKeyLabels[i], {
          fontSize: "14px",
          color: "#ff6b6b",
          fontStyle: "bold",
          backgroundColor: "#2d1515",
          padding: { x: 4, y: 2 },
          shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
        })
        .setOrigin(0.5);

      const blueKeyHint = this.scene.add
        .text(pos.x + 140, pos.y, blueKeyLabels[i], {
          fontSize: "14px",
          color: "#74b9ff",
          fontStyle: "bold",
          backgroundColor: "#151530",
          padding: { x: 4, y: 2 },
          shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
        })
        .setOrigin(0.5);

      // Option text
      const optText = this.scene.add
        .text(pos.x, pos.y, "", {
          fontSize: "22px",
          color: "#fff",
          fontStyle: "bold",
          shadow: { offsetX: 0, offsetY: 2, color: '#ffd700', blur: 6, fill: true },
        })
        .setOrigin(0.5);

      // Touch handler — uses SocketManager.team to determine which team clicked
      optBg.on("pointerdown", () => {
        // Import dynamically to avoid circular dependency issues
        const team = globalThis.__socketManagerTeam || "red";
        if (!this.answeredTeams[team]) {
          this.answeredTeams[team] = true;
          this.onAnswer(i);
          this._highlightSelected(i);
        }
      });

      // Hover effect
      optBg.on("pointerover", () => {
        const team = globalThis.__socketManagerTeam || "red";
        if (!this.answeredTeams[team]) optBg.setFillStyle(0x6c5ce7, 0.22);
      });
      optBg.on("pointerout", () => {
        const team = globalThis.__socketManagerTeam || "red";
        if (!this.answeredTeams[team]) optBg.setFillStyle(0xffffff, 0.18);
      });

      this.optionButtons.push({
        bg: optBg,
        text: optText,
        redKey: redKeyHint,
        blueKey: blueKeyHint,
      });
      this.container.add([optShadow, optBg, redKeyHint, blueKeyHint, optText]);
    });

    // ── Feedback overlay ──
    this.feedbackText = this.scene.add
      .text(0, -20, "", {
        fontSize: "36px",
        fontStyle: "bold",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.container.add(this.feedbackText);

    this.container.setDepth(100);
  }

  showQuestion(question) {
    if (!question) return;
    this.answeredTeams = { red: false, blue: false };
    this.feedbackText.setAlpha(0);

    this.categoryText.setText(
      `📚 ${question.category?.toUpperCase() || "QUIZ"} | ${question.difficulty?.toUpperCase() || ""}`,
    );
    this.questionText.setText(question.question);

    question.options.forEach((opt, i) => {
      if (this.optionButtons[i]) {
        this.optionButtons[i].text.setText(opt);
        this.optionButtons[i].bg.setFillStyle(0x2d3436);
        this.optionButtons[i].bg.setStrokeStyle(1, 0x636e72);
      }
    });
  }

  showResult(correct, team) {
    const teamLabel = team ? (team === "red" ? "🔴" : "🔵") : "";
    if (correct) {
      this.feedbackText.setText(`${teamLabel} ✅ CORRECT!`).setColor("#2ecc71");
    } else {
      this.feedbackText.setText(`${teamLabel} ❌ WRONG!`).setColor("#e74c3c");
    }
    this.feedbackText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 1200,
      delay: 300,
    });
  }

  highlightOption(index, team) {
    if (index < 0 || index >= this.optionButtons.length) return;
    const color = team === "red" ? CONFIG.COLORS.RED : CONFIG.COLORS.BLUE;
    const btn = this.optionButtons[index];
    btn.bg.setStrokeStyle(3, color);

    // Mark team as answered (keyboard path)
    if (team) this.answeredTeams[team] = true;

    this.scene.time.delayedCall(300, () => {
      btn.bg.setStrokeStyle(1, 0x636e72);
    });
  }

  _highlightSelected(index) {
    this.optionButtons[index].bg.setFillStyle(0x444488);
  }
}
