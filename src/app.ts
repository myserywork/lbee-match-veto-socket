import { socketServer, rooms } from './socket/server/server';

socketServer.emit('hello', 'world');

const roomId = '123456';

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
}, 500000);
