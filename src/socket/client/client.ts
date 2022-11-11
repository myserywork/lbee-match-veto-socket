import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  query: { token: 'teamA', roomId: '123456' },
});
const socket2 = io('http://localhost:3000', {
  query: { token: 'teamB', roomId: '123456' },
});

let teamSide = '';
let teamSide2 = '';

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('roomCreated', (roomName: string) => {
  // console.log('Room created', roomName);
});

socket.on('joinedRoom', (room: any, side: string) => {
  // console.log('Joined room', room);
  teamSide = side;
});

socket.on('roomFound', (room: any) => {
  // console.log('Room found', room);
});

socket.on('matchTurnChecked', (turn: string) => {
  console.log('Match turn checked', turn);
});

socket.on('matchPhaseChecked', (phase: string) => {
  console.log('Match phase checked', phase);
});

socket.on('roomAlreadyExists', (roomName: string) => {
  console.log('Room already exists', roomName);
});

socket.on('notAllowedToJoinRoom', () => {
  console.log('Not allowed to join room');
});

socket.on('roomNotFound', (roomId: string) => {
  // console.log('Room not found', roomId);
});

socket.on('mapPicked', (map: string) => {
  console.log('Map picked', map);
});

socket.on('mapBanned', (map: string) => {
  console.log('Map banned', map);
});

// 2
socket2.on('connect', () => {
  console.log('Connected to server');
});

socket2.on('roomCreated', (roomName: string) => {
  // console.log('Room created', roomName);
});

socket2.on('joinedRoom', (room: any, side: string) => {
  // console.log('Joined room', room);
  teamSide2 = side;
});

socket2.on('roomFound', (room: any) => {
  // console.log('Room found', room);
});

socket2.on('matchTurnChecked', (turn: string) => {
  console.log('Match turn checked', turn);
});

socket2.on('matchPhaseChecked', (phase: string) => {
  console.log('Match phase checked', phase);
});

socket2.on('roomAlreadyExists', (roomName: string) => {
  console.log('Room already exists', roomName);
});

socket2.on('notAllowedToJoinRoom', () => {
  console.log('Not allowed to join room');
});

socket2.on('roomNotFound', (roomId: string) => {
  // console.log('Room not found', roomId);
});

socket2.on('mapPicked', (map: string) => {
  console.log('Map picked', map);
});

socket2.on('mapBanned', (map: string) => {
  console.log('Map banned', map);
});

export const socketClient = socket;
export const socketClient2 = socket2;
