// ============================================================
// QuestionOverlay — Shows quiz question + 4 answer options
// Supports both touch (tap buttons) and keyboard input
// Positioned at bottom-center of game scene — FULLY RESPONSIVE
// ============================================================

import { CONFIG } from "../config.js";

export class QuestionOverlay {
  constructor(scene, onAnswer) {
    this.scene = scene;
    this.onAnswer = onAnswer;
    this.answeredTeams = { red: false, blue: false };
    this.optionButtons = [];

    const W = scene.scale.width;
    const H = scene.scale.height;
    const s = CONFIG.s(scene);

    // Panel dimensions — responsive: never wider than screen - 20px
    this.panelW = Math.min(700 * s, W - 20);
    this.panelH = Math.min(200 * s, H * 0.32);

    this.container = scene.add.container(W / 2, H - this.panelH / 2 - 10 * s);
    this._build();
  }

  _build() {
    const s = CONFIG.s(this.scene);
    const W = this.scene.scale.width;
    const pw = this.panelW;
    const ph = this.panelH;

    // ── Background panel ──
    this.bg = this.scene.add
      .rectangle(0, 0, pw, ph, 0xffffff, 0.13)
      .setStrokeStyle(Math.max(2, 4 * s), CONFIG.COLORS.GOLD)
      .setDepth(1);
    this.shadow = this.scene.add
      .rectangle(4 * s, 6 * s, pw, ph, 0x000000, 0.18)
      .setDepth(0);
    this.container.add([this.shadow, this.bg]);

    // ── Category badge ──
    this.categoryText = this.scene.add.text(-pw / 2 + 10 * s, -ph / 2 + 5 * s, "", {
      fontSize: CONFIG.fs(this.scene, 14),
      color: "#ffd700",
      fontStyle: "bold",
    });
    this.container.add(this.categoryText);

    // ── Question text ──
    this.questionText = this.scene.add
      .text(0, -ph / 2 + 25 * s, "Waiting for question...", {
        fontSize: CONFIG.fs(this.scene, 24),
        fontFamily: "Arial, sans-serif",
        color: "#fff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: pw - 30 * s },
      })
      .setOrigin(0.5, 0);
    this.container.add(this.questionText);

    // ── Answer options (2x2 grid) — responsive ──
    const optW = Math.min(300 * s, (pw - 30 * s) / 2);
    const optH = Math.min(42 * s, ph * 0.2);
    const gapX = optW + 10 * s;
    const baseY = 5 * s;
    const rowGap = optH + 8 * s;

    const positions = [
      { x: -gapX / 2, y: baseY },
      { x: gapX / 2, y: baseY },
      { x: -gapX / 2, y: baseY + rowGap },
      { x: gapX / 2, y: baseY + rowGap },
    ];

    const redKeyLabels = CONFIG.KEYS.RED.ANSWER;
    const blueKeyLabels = CONFIG.KEYS.BLUE.ANSWER;
    const showKeyHints = W > 600; // hide key hints on narrow screens

    positions.forEach((pos, i) => {
      const optBg = this.scene.add
        .rectangle(pos.x, pos.y, optW, optH, 0xffffff, 0.18)
        .setStrokeStyle(Math.max(1, 2 * s), 0x6c5ce7)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });

      const optShadow = this.scene.add
        .rectangle(pos.x + 2 * s, pos.y + 3 * s, optW, optH, 0x000000, 0.13)
        .setDepth(1);

      let redKeyHint = null;
      let blueKeyHint = null;
      if (showKeyHints) {
        redKeyHint = this.scene.add
          .text(pos.x - optW / 2 + 4 * s, pos.y, redKeyLabels[i], {
            fontSize: CONFIG.fs(this.scene, 12),
            color: "#ff6b6b",
            fontStyle: "bold",
            backgroundColor: "#2d1515",
            padding: { x: 2, y: 1 },
          })
          .setOrigin(0, 0.5)
          .setDepth(3);

        blueKeyHint = this.scene.add
          .text(pos.x + optW / 2 - 4 * s, pos.y, blueKeyLabels[i], {
            fontSize: CONFIG.fs(this.scene, 12),
            color: "#74b9ff",
            fontStyle: "bold",
            backgroundColor: "#151530",
            padding: { x: 2, y: 1 },
          })
          .setOrigin(1, 0.5)
          .setDepth(3);
      }

      const optText = this.scene.add
        .text(pos.x, pos.y, "", {
          fontSize: CONFIG.fs(this.scene, 18),
          color: "#fff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(3);

      optBg.on("pointerdown", () => {
        const team = globalThis.__socketManagerTeam || "red";
        if (!this.answeredTeams[team]) {
          this.answeredTeams[team] = true;
          this.onAnswer(i);
          this._highlightSelected(i);
        }
      });

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

      const children = [optShadow, optBg, optText];
      if (redKeyHint) children.push(redKeyHint, blueKeyHint);
      this.container.add(children);
    });

    // ── Feedback overlay ──
    this.feedbackText = this.scene.add
      .text(0, -10 * s, "", {
        fontSize: CONFIG.fs(this.scene, 32),
        fontStyle: "bold",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10);
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
    if (team) this.answeredTeams[team] = true;
    this.scene.time.delayedCall(300, () => {
      btn.bg.setStrokeStyle(1, 0x636e72);
    });
  }

  _highlightSelected(index) {
    this.optionButtons[index].bg.setFillStyle(0x444488);
  }
}
