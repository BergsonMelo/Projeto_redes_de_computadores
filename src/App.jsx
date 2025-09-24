import React, { useEffect, useRef, useState } from "react";

// === Função para gerar labirinto ===
function generateMaze(width, height) {
  const maze = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ top: true, right: true, bottom: true, left: true }))
  );

  const visited = Array.from({ length: height }, () => Array(width).fill(false));
  const dirs = [
    { dx: 0, dy: -1, wall: "top", opp: "bottom" },
    { dx: 1, dy: 0, wall: "right", opp: "left" },
    { dx: 0, dy: 1, wall: "bottom", opp: "top" },
    { dx: -1, dy: 0, wall: "left", opp: "right" },
  ];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function dfs(x, y) {
    visited[y][x] = true;
    const neighbors = shuffle(dirs.slice());
    for (const { dx, dy, wall, opp } of neighbors) {
      const nx = x + dx, ny = y + dy;
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
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const maze = useRef(generateMaze(15, 10));
  const cellSize = 40;

  // === Movimentação do jogador ===
  useEffect(() => {
    function handleKey(e) {
      setPlayer((prev) => {
        const cell = maze.current[prev.y][prev.x];
        let x = prev.x, y = prev.y;

        if ((e.key === "ArrowUp" || e.key === "w") && !cell.top) y--;
        if ((e.key === "ArrowDown" || e.key === "s") && !cell.bottom) y++;
        if ((e.key === "ArrowLeft" || e.key === "a") && !cell.left) x--;
        if ((e.key === "ArrowRight" || e.key === "d") && !cell.right) x++;

        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x >= 15) x = 14;
        if (y >= 10) y = 9;

        return { x, y };
      });
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // === Desenhar labirinto + jogador ===
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function draw() {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#fff";
      maze.current.forEach((row, y) => {
        row.forEach((cell, x) => {
          const x0 = x * cellSize, y0 = y * cellSize;
          if (cell.top) ctx.strokeRect(x0, y0, cellSize, 1);
          if (cell.right) ctx.strokeRect(x0 + cellSize - 1, y0, 1, cellSize);
          if (cell.bottom) ctx.strokeRect(x0, y0 + cellSize - 1, cellSize, 1);
          if (cell.left) ctx.strokeRect(x0, y0, 1, cellSize);
        });
      });

      // jogador
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, 10, 0, 2 * Math.PI);
      ctx.fill();
    }

    draw();
  }, [player]);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h1>Maze Local</h1>
      <canvas ref={canvasRef} width={15 * cellSize} height={10 * cellSize} style={{ border: "1px solid #000" }} />
      <p>Use as setas do teclado ou W A S D para se mover. Verde é você!</p>
    </div>
  );
}
