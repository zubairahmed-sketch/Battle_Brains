// ============================================================
// BattleBrains Server — Express + Socket.IO
// Handles: room creation, team joining, game-state sync,
//          quiz question delivery, power-ups, and win conditions
// ============================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { GameRoom } = require('./game/GameRoom');
const { generateRoomCode } = require('./utils/roomCodes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static client build in production
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ─── Active Game Rooms ───────────────────────────────────────
const rooms = new Map(); // roomCode → GameRoom instance

// ─── REST endpoints ──────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', rooms: rooms.size }));

app.get('/api/rooms', (_req, res) => {
  const list = [];
  rooms.forEach((room, code) => {
    list.push({
      code,
      mode: room.mode,
      players: room.getPlayerCount(),
      status: room.status
    });
  });
  res.json(list);
});

// ─── Socket.IO connection ────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Player connected: ${socket.id}`);

  // ── Create Room ──
  socket.on('create-room', ({ playerName, mode }, callback) => {
    const code = generateRoomCode();
    const room = new GameRoom(code, mode, io);
    rooms.set(code, room);

    const player = room.addPlayer(socket.id, playerName, 'red');
    socket.join(code);
    socket.roomCode = code;

    console.log(`🏠 Room ${code} created by ${playerName} | Mode: ${mode}`);
    callback({ success: true, roomCode: code, player, team: 'red' });
  });

  // ── Join Room ──
  socket.on('join-room', ({ roomCode, playerName }, callback) => {
    const room = rooms.get(roomCode);
    if (!room) {
      return callback({ success: false, error: 'Room not found!' });
    }
    if (room.status === 'playing') {
      return callback({ success: false, error: 'Game already in progress!' });
    }

    // Auto-assign team (balance teams)
    const team = room.getSmallestTeam();
    const player = room.addPlayer(socket.id, playerName, team);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    console.log(`🎮 ${playerName} joined room ${roomCode} on team ${team}`);
    callback({ success: true, roomCode, player, team });

    // Notify others
    io.to(roomCode).emit('player-joined', {
      player,
      teamRed: room.getTeamPlayers('red'),
      teamBlue: room.getTeamPlayers('blue')
    });
  });

  // ── Switch Team ──
  socket.on('switch-team', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const newTeam = room.switchPlayerTeam(socket.id);
    io.to(roomCode).emit('teams-updated', {
      teamRed: room.getTeamPlayers('red'),
      teamBlue: room.getTeamPlayers('blue'),
      switchedPlayer: { id: socket.id, team: newTeam }
    });
  });

  // ── Start Game ──
  socket.on('start-game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.startGame();
    io.to(roomCode).emit('game-started', {
      mode: room.mode,
      state: room.getState(),
      question: room.getCurrentQuestion()
    });

    // Start the round timer
    room.startRoundTimer((timeLeft) => {
      io.to(roomCode).emit('timer-tick', { timeLeft });
    }, () => {
      // Round over
      io.to(roomCode).emit('round-over', { state: room.getState() });
      room.nextQuestion();
      const q = room.getCurrentQuestion();
      if (q && !room.checkWinCondition()) {
        io.to(roomCode).emit('new-question', { question: q, state: room.getState() });
        room.startRoundTimer((timeLeft) => {
          io.to(roomCode).emit('timer-tick', { timeLeft });
        }, () => {
          io.to(roomCode).emit('round-over', { state: room.getState() });
        });
      } else {
        const winner = room.getWinner();
        io.to(roomCode).emit('game-over', { winner, state: room.getState() });
      }
    });
  });

  // ── Submit Answer ──
  socket.on('submit-answer', ({ roomCode, answerIndex }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const result = room.submitAnswer(socket.id, answerIndex);
    
    // Notify the player of their result
    socket.emit('answer-result', {
      correct: result.correct,
      correctAnswer: result.correctAnswer,
      pointsEarned: result.pointsEarned
    });

    // Broadcast game-state update to all in room
    io.to(roomCode).emit('state-update', {
      state: room.getState(),
      lastAction: result.action,
      team: result.team,
      playerName: result.playerName
    });

    // Check win condition
    if (room.checkWinCondition()) {
      room.stopTimer();
      const winner = room.getWinner();
      io.to(roomCode).emit('game-over', { winner, state: room.getState() });
    }
  });

  // ── Use Power-Up ──
  socket.on('use-powerup', ({ roomCode, powerUpType }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const result = room.usePowerUp(socket.id, powerUpType);
    if (result.success) {
      io.to(roomCode).emit('powerup-activated', {
        type: powerUpType,
        team: result.team,
        state: room.getState(),
        effect: result.effect
      });
    } else {
      socket.emit('powerup-failed', { reason: result.reason });
    }
  });

  // ── Request Next Question (manual advance) ──
  socket.on('next-question', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.nextQuestion();
    const q = room.getCurrentQuestion();
    if (q) {
      io.to(roomCode).emit('new-question', { question: q, state: room.getState() });
    }
  });

  // ── Rematch ──
  socket.on('rematch', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.reset();
    io.to(roomCode).emit('rematch-started', {
      state: room.getState(),
      question: room.getCurrentQuestion()
    });
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    console.log(`💔 Player disconnected: ${socket.id}`);
    const code = socket.roomCode;
    if (code && rooms.has(code)) {
      const room = rooms.get(code);
      room.removePlayer(socket.id);
      io.to(code).emit('player-left', {
        playerId: socket.id,
        teamRed: room.getTeamPlayers('red'),
        teamBlue: room.getTeamPlayers('blue')
      });
      // Clean up empty rooms
      if (room.getPlayerCount() === 0) {
        room.stopTimer();
        rooms.delete(code);
        console.log(`🗑️  Room ${code} deleted (empty)`);
      }
    }
  });
});

// ─── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🧠 BattleBrains server running on http://localhost:${PORT}\n`);
});
