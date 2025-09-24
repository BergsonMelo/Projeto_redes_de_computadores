import React, { useEffect, useRef, useState } from "react";

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
  const [maze, setMaze] = useState(null);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const cellSize = 40;

  const width = 15;
  const height = 10;
  const endPos = maze ? { x: width - 1, y: height - 1 } : null;

  // Gera labirinto ao montar o componente
  useEffect(() => {
    const newMaze = generateMaze(width, height);
    setMaze(newMaze);
    setPlayer({ x: 0, y: 0 }); // reset player
  }, []);

  // Movimentação do player
  useEffect(() => {
    function handleKey(e) {
      if (!maze) return;

      let { x, y } = player;
      const cell = maze[y][x];

      if ((e.key === "ArrowUp" || e.key === "w") && !cell.top) y--;
      if ((e.key === "ArrowDown" || e.key === "s") && !cell.bottom) y++;
      if ((e.key === "ArrowLeft" || e.key === "a") && !cell.left) x--;
      if ((e.key === "ArrowRight" || e.key === "d") && !cell.right) x++;

      // Verifica limites
      if (x >= 0 && x < width && y >= 0 && y < height) {
        setPlayer({ x, y });

        // Verifica se chegou ao final
        if (endPos && x === endPos.x && y === endPos.y) {
          setTimeout(() => alert("Parabéns! Você chegou ao final do labirinto!"), 50);
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [player, maze]);

  // Renderiza labirinto e player
  useEffect(() => {
    if (!maze) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Labirinto
    ctx.strokeStyle = "#fff";
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const x0 = x * cellSize;
        const y0 = y * cellSize;
        if (cell.top) ctx.strokeRect(x0, y0, cellSize, 1);
        if (cell.right) ctx.strokeRect(x0 + cellSize - 1, y0, 1, cellSize);
        if (cell.bottom) ctx.strokeRect(x0, y0 + cellSize - 1, cellSize, 1);
        if (cell.left) ctx.strokeRect(x0, y0, 1, cellSize);
      });
    });

    // Célula final
    if (endPos) {
      ctx.fillStyle = "gold";
      ctx.fillRect(endPos.x * cellSize, endPos.y * cellSize, cellSize, cellSize);
    }

    // Player
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(
      player.x * cellSize + cellSize / 2,
      player.y * cellSize + cellSize / 2,
      cellSize / 4,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [maze, player]);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h1>Labirinto Dinâmico</h1>
      <canvas ref={canvasRef} width={width * cellSize} height={height * cellSize} style={{ border: "1px solid #000" }} />
      <p>Use as setas do teclado ou W/A/S/D para se mover. Verde é você, dourado é o final!</p>
    </div>
  );
}
