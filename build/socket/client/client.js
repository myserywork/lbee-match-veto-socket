"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketClient2 = exports.socketClient = void 0;
var socket_io_client_1 = require("socket.io-client");
var socket = (0, socket_io_client_1.io)('http://localhost:3000', {
    query: { token: 'teamA', roomId: '123456' },
});
var socket2 = (0, socket_io_client_1.io)('http://localhost:3000', {
    query: { token: 'teamB', roomId: '123456' },
});
var teamSide = '';
var teamSide2 = '';
socket.on('connect', function () {
    console.log('Connected to server');
});
socket.on('roomCreated', function (roomName) {
    // console.log('Room created', roomName);
});
socket.on('joinedRoom', function (room, side) {
    // console.log('Joined room', room);
    teamSide = side;
});
socket.on('roomFound', function (room) {
    // console.log('Room found', room);
});
socket.on('matchTurnChecked', function (turn) {
    console.log('Match turn checked', turn);
});
socket.on('matchPhaseChecked', function (phase) {
    console.log('Match phase checked', phase);
});
socket.on('roomAlreadyExists', function (roomName) {
    console.log('Room already exists', roomName);
});
socket.on('notAllowedToJoinRoom', function () {
    console.log('Not allowed to join room');
});
socket.on('roomNotFound', function (roomId) {
    // console.log('Room not found', roomId);
});
socket.on('mapPicked', function (map) {
    console.log('Map picked', map);
});
socket.on('mapBanned', function (map) {
    console.log('Map banned', map);
});
// 2
socket2.on('connect', function () {
    console.log('Connected to server');
});
socket2.on('roomCreated', function (roomName) {
    // console.log('Room created', roomName);
});
socket2.on('joinedRoom', function (room, side) {
    // console.log('Joined room', room);
    teamSide2 = side;
});
socket2.on('roomFound', function (room) {
    // console.log('Room found', room);
});
socket2.on('matchTurnChecked', function (turn) {
    console.log('Match turn checked', turn);
});
socket2.on('matchPhaseChecked', function (phase) {
    console.log('Match phase checked', phase);
});
socket2.on('roomAlreadyExists', function (roomName) {
    console.log('Room already exists', roomName);
});
socket2.on('notAllowedToJoinRoom', function () {
    console.log('Not allowed to join room');
});
socket2.on('roomNotFound', function (roomId) {
    // console.log('Room not found', roomId);
});
socket2.on('mapPicked', function (map) {
    console.log('Map picked', map);
});
socket2.on('mapBanned', function (map) {
    console.log('Map banned', map);
});
exports.socketClient = socket;
exports.socketClient2 = socket2;
