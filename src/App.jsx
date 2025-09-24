import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function App() {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState('');
  const socketRef = useRef(null);

  // Conecta no servidor
  useEffect(() => {
    socketRef.current = io('https://SEU_SERVIDOR_AQUI'); // substitua pelo backend
    const socket = socketRef.current;

    socket.on('connect', () => setMyId(socket.id));

    socket.on('init', (initialPlayers) => setPlayers(initialPlayers));

    socket.on('update', ({ id, pos }) => {
      setPlayers(prev => ({ ...prev, [id]: pos }));
    });

    socket.on('remove', (id) => {
      setPlayers(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    return () => socket.disconnect();
  }, []);

  // Teclado para movimentar
  useEffect(() => {
    function handleKey(e) {
      const me = players[myId];
      if (!me) return;
      let { x, y } = me;

      if (e.key === 'ArrowUp') y--;
      if (e.key === 'ArrowDown') y++;
      if (e.key === 'ArrowLeft') x--;
      if (e.key === 'ArrowRight') x++;

      const newPos = { x, y };
      setPlayers(prev => ({ ...prev, [myId]: newPos }));
      socketRef.current.emit('move', newPos);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [players, myId]);

  // Renderiza jogadores
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.entries(players).forEach(([id, p]) => {
      ctx.fillStyle = id === myId ? 'green' : 'red';
      ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
    });
  }, [players]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Maze P2P via Socket.IO</h1>
      <canvas ref={canvasRef} width={15*40} height={10*40} style={{ border: '1px solid #000' }} />
      <p>ID: {myId}</p>
    </div>
  );
}
