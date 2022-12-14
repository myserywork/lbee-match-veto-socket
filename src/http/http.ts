import * as express from 'express';
import bodyParser from 'body-parser';
import { createRoom, rooms } from '../socket/server/server';
import cors from 'cors';

const app = express.default();

app.use(bodyParser.json());
app.use(cors());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const httpServer = app;

httpServer.post('/createRoom', (req, res) => {
  const checkIfRoomExists = rooms.find((room) => room.id === req.body.matchId);
  if (checkIfRoomExists) {
    rooms.slice(rooms.indexOf(checkIfRoomExists), 1);
  }
  const matchConfig = req.body;

  const teamAToken = 'teamA';
  const teamBToken = 'teamB';
  const teamA = {
    ...matchConfig.teamA,
    picked: [],
    banned: [],
    side: '',
    token: teamAToken,
  };
  const teamB = {
    ...matchConfig.teamB,
    picked: [],
    banned: [],
    side: '',
    token: teamBToken,
  };

  matchConfig.teamA = teamA;
  matchConfig.teamB = teamB;

  Object.keys(matchConfig.maps).forEach(function (key, index) {
    matchConfig.maps[key] = {
      name: matchConfig.maps[key].name,
      picture: matchConfig.maps[key].picture,
      picked: false,
      pickedBy: null,
      side: null,
      banned: false,
      bannedBy: null,
      actionAt: null,
    };
  });

  createRoom(matchConfig);
  res.send({ matchData: matchConfig });
});

httpServer.get('/rooms', (req, res) => {
  res.send(rooms);
});

httpServer.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((room) => room.id === roomId);
  if (room) {
    res.send(room);
  } else {
    res.send('Room not found');
  }
});
