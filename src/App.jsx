import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function App() {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState('');
  const socketRef = useRef(null);

  // Conecta no backend Socket.IO
  useEffect(() => {
    // Use o URL HTTPS do Render (porta 443 é padrão)
    socketRef.current = io('https://projeto-redes-de-computadores.onrender.com'); 
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

  // Movimentação do jogador via teclado
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

  // Renderiza os jogadores no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cellSize = 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.entries(players).forEach(([id, p]) => {
      ctx.fillStyle = id === myId ? 'green' : 'red';
      ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
    });
  }, [players]);

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <h1>Maze P2P via Socket.IO</h1>
      <canvas 
        ref={canvasRef} 
        width={15*40} 
        height={10*40} 
        style={{ border: '1px solid #000' }} 
      />
      <p>Seu ID: {myId}</p>
      <p>Use as setas do teclado para se mover. Verde é você!</p>
    </div>
  );
}
