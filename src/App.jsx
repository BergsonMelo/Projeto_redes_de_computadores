import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

// === Função para gerar labirinto ===
function generateMaze(width, height) {
  const maze = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
    }))
  );

  const visited = Array.from({ length: height }, () => Array(width).fill(false));

  const dirs = [
    { dx: 0, dy: -1, wall: "top", opp: "bottom" },
    { dx: 1, dy: 0, wall: "right", opp: "left" },
    { dx: 0, dy: 1, wall: "bottom", opp: "top" },
    { dx: -1, dy: 0, wall: "left", opp: "right" },
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function dfs(x, y) {
    visited[y][x] = true;
    const neighbors = shuffle(dirs.slice());
    for (const { dx, dy, wall, opp } of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx]) {
        maze[y][x][wall] = false;
        maze[ny][nx][opp] = false;
        dfs(nx, ny);
      }
    }
  }

  dfs(0, 0);
  return maze;
}

export default function App() {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState('');
  const peerRef = useRef(null);
  const connRef = useRef({}); // conexões com outros peers
  const maze = useRef(generateMaze(15, 10));

  // === Inicializa PeerJS ===
  useEffect(() => {
    const peer = new Peer(undefined, {
      host: 'projeto-redes-de-computadores.onrender.com',
      port: 443,
      path: '/peerjs',
      secure: true
    });

    peerRef.current = peer;

    peer.on('open', (id) => {
      setMyId(id);
      setPlayers((prev) => ({ ...prev, [id]: { x: 0, y: 0 } }));
    });

    peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        setPlayers((prev) => ({ ...prev, [conn.peer]: data }));
      });
      connRef.current[conn.peer] = conn;
    });

    return () => peer.destroy();
  }, []);

  const move = (dx, dy) => {
    const me = players[myId];
    if (!me) return;

    const cell = maze.current[me.y][me.x];
    let nx = me.x + dx;
    let ny = me.y + dy;

    // Verifica paredes
    if ((dx === -1 && cell.left) || (dx === 1 && cell.right)) nx = me.x;
    if ((dy === -1 && cell.top) || (dy === 1 && cell.bottom)) ny = me.y;

    if (nx < 0 || nx >= 15) nx = me.x;
    if (ny < 0 || ny >= 10) ny = me.y;

    const newPos = { x: nx, y: ny };
    setPlayers(prev => ({ ...prev, [myId]: newPos }));

    Object.values(connRef.current).forEach(conn => conn.send(newPos));
  };

  // === Controles do teclado ===
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [players, myId]);

  // === Renderiza labirinto e jogadores ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cellSize = 40;

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#fff";
    maze.current.forEach((row, y) => {
      row.forEach((cell, x) => {
        const x0 = x * cellSize;
        const y0 = y * cellSize;
        if (cell.top) ctx.strokeRect(x0, y0, cellSize, 1);
        if (cell.right) ctx.strokeRect(x0 + cellSize - 1, y0, 1, cellSize);
        if (cell.bottom) ctx.strokeRect(x0, y0 + cellSize - 1, cellSize, 1);
        if (cell.left) ctx.strokeRect(x0, y0, 1, cellSize);
      });
    });

    Object.entries(players).forEach(([id, p]) => {
      ctx.fillStyle = id === myId ? 'green' : 'red';
      ctx.beginPath();
      ctx.arc(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2, 10, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [players]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Maze P2P via PeerJS</h1>
      <canvas ref={canvasRef} width={15 * 40} height={10 * 40} style={{ border: '1px solid #000' }} />
      <p>Seu ID: {myId}</p>
    </div>
  );
}
