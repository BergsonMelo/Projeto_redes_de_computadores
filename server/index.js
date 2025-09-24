const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// PeerJS Server
const peerServer = ExpressPeerServer(app, {
  path: '/peerjs',
  debug: true,
});

app.use('/peerjs', peerServer);

app.get('/', (req, res) => res.send('PeerJS Server Running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
