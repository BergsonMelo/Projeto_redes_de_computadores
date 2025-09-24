import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

export default function App() {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState('');
  const peerRef = useRef(null);
  const connRef = useRef({}); // conexões com outros peers

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

    const newPos = { x: me.x + dx, y: me.y + dy };
    setPlayers(prev => ({ ...prev, [myId]: newPos }));

    Object.values(connRef.current).forEach(conn => conn.send(newPos));
  };

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
    <div style={{ textAlign: 'center' }}>
      <h1>Maze P2P via PeerJS</h1>
      <canvas ref={canvasRef} width={15*40} height={10*40} style={{ border: '1px solid #000' }} />
      <p>Seu ID: {myId}</p>
    </div>
  );
}
