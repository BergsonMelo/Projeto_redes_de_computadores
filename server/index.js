const express = require("express");
const { Server } = require("peer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// PeerJS Server
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(app, {
  debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => res.send("PeerJS Server Running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
