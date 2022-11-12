import { socketServer, createRoom, rooms } from './socket/server/server';
import { socketClient, socketClient2 } from './socket/client/client';
import { http } from './http/http';

http.listen(3333, () => console.log('Server is running on port 3333'));

socketServer.emit('hello', 'world');

const roomId = 123456;
const roomCfg =
  '{"game":"valorant","matchTurnInterval":20000,"matchesCount":3,"matchId":123456,"teamA":{"name":"TeamA","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"teamB":{"name":"TeamB","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"maps":{"ascent":{"name":"Ascent","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"bind":{"name":"Bind","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"breeze":{"name":"Breeze","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"haven":{"name":"Haven","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"icebox":{"name":"Icebox","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"split":{"name":"Split","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"fracture":{"name":"Fracture","picture":"https://i.imgur.com/1Q9Q1Zm.png"},"pearl":{"name":"Pearl","picture":"https://i.imgur.com/1Q9Q1Zm.png"}},"picture":"https://i.imgur.com/1Q9Q1Zm.png"}';

const room = createRoom(JSON.parse(roomCfg));

setTimeout(() => {
  socketClient.emit('joinRoom', roomId);
  socketClient2.emit('joinRoom', roomId);

  socketClient.emit('banMap', roomId, 'ascent');
  socketClient2.emit('banMap', roomId, 'bind');
}, 10000);

setInterval(() => {
  const gameRoom = rooms.find((room) => room.id === roomId);
  console.log({
    runningSetInterval: true,
    gameRoom: gameRoom,
    roomId: roomId,
    rooms: rooms,
  });

  if (gameRoom) {
    const actionTime = gameRoom.getAutoActionTime();
    const currentTime = new Date().getTime();
    console.clear();
    console.log({
      phase: gameRoom.currentPhase,
      turn: gameRoom.currentTurn,
      avaliableMaps: gameRoom.avaliableMaps,
      bannedMaps: gameRoom.getBannedMaps(),
      pickedMaps: gameRoom.getPickedMaps(),
      nextActionTime: actionTime.toLocaleString('pt-BR'),
      currentTime: new Date(currentTime).toLocaleString('pt-BR'),
      timeLeftObj: gameRoom.timeLeft,
      logs: gameRoom.logs,
    });

    if (gameRoom.currentPhase == 'finished') {
      console.log({
        finished: true,
        maps: gameRoom.getResultPickedMaps(),
      });
    }
  }
}, 1000);
