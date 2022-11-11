import express from 'express';
import bodyParser from 'body-parser';
import { createRoom, rooms } from '../socket/server/server';

const app = express();

app.use(bodyParser.json());
export const http = app;

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

http.post('/createRoom', (req, res) => {
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

http.get('/rooms', (req, res) => {
  res.send(rooms);
});

http.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((room) => room.id === roomId);
  if (room) {
    res.send(room);
  } else {
    res.send('Room not found');
  }
});
