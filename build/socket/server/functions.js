"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfisPickSidePhase = exports.insertMatchLog = exports.beginPickSidePhase = exports.checkifIsTimeToChooseSide = exports.checkIfIsChooseSidePhase = exports.checkMapAlreadyPicked = exports.beginChooseSidePhase = exports.changeMatchTurn = exports.getMatchTurn = exports.checkIfisBanPhase = exports.checkIfIsPickPhase = exports.getTeamSideObject = exports.beginPickPhase = exports.checkMatchTurn = exports.getTeamSideByToken = exports.removeTeamTokenFromOutput = exports.isUserAllowedToVeto = exports.findRoom = exports.getToken = void 0;
var server_1 = require("./server");
var getToken = function (socket) {
    return socket.handshake.query.token;
};
exports.getToken = getToken;
var findRoom = function (roomId) {
    return server_1.rooms.find(function (room) { return room.id === roomId; });
};
exports.findRoom = findRoom;
var isUserAllowedToVeto = function (socket, roomId) {
    var room = (0, exports.findRoom)(roomId);
    var token = (0, exports.getToken)(socket);
    if (room) {
        if (room.matchConfig.matchTeamOne.token === token ||
            room.matchConfig.matchTeamTwo.token === token) {
            return true;
        }
    }
    return false;
};
exports.isUserAllowedToVeto = isUserAllowedToVeto;
var removeTeamTokenFromOutput = function (room) {
    var matchTeamOne = room.matchTeamOne, matchTeamTwo = room.matchTeamTwo, rest = __rest(room, ["matchTeamOne", "matchTeamTwo"]);
    return rest;
};
exports.removeTeamTokenFromOutput = removeTeamTokenFromOutput;
var getTeamSideByToken = function (socket, roomId) {
    var room = (0, exports.findRoom)(roomId);
    var token = (0, exports.getToken)(socket);
    if (room) {
        if (room.matchConfig.matchTeamOne.token === token) {
            return 'teamOne';
        }
        else if (room.matchConfig.matchTeamTwo.token === token) {
            return 'teamTwo';
        }
    }
    return '';
};
exports.getTeamSideByToken = getTeamSideByToken;
var checkMatchTurn = function (room, side) {
    if (room.matchConfig.matchTurn === side) {
        return true;
    }
    return false;
};
exports.checkMatchTurn = checkMatchTurn;
var beginPickPhase = function (socket, roomId) {
    var room = (0, exports.findRoom)(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'pick';
        server_1.rooms[server_1.rooms.indexOf(room)] = room;
        socket.to(room.name).emit('pickPhaseStarted');
    }
};
exports.beginPickPhase = beginPickPhase;
var getTeamSideObject = function (room, side) {
    if (side === 'teamOne') {
        return room.matchConfig.matchTeamOne;
    }
    else if (side === 'teamTwo') {
        return room.matchConfig.matchTeamTwo;
    }
    return null;
};
exports.getTeamSideObject = getTeamSideObject;
var checkIfIsPickPhase = function (room) {
    if (room.matchConfig.matchPhase === 'pick') {
        return true;
    }
    return false;
};
exports.checkIfIsPickPhase = checkIfIsPickPhase;
var checkIfisBanPhase = function (room) {
    if (room.matchConfig.matchPhase === 'ban') {
        return true;
    }
    return false;
};
exports.checkIfisBanPhase = checkIfisBanPhase;
var getMatchTurn = function (room) {
    return room.matchConfig.matchTurn;
};
exports.getMatchTurn = getMatchTurn;
var changeMatchTurn = function (room) {
    if (room.matchConfig.matchTurn === 'teamOne') {
        room.matchConfig.matchTurn = 'teamTwo';
    }
    else if (room.matchConfig.matchTurn === 'teamTwo') {
        room.matchConfig.matchTurn = 'teamOne';
    }
    server_1.rooms[server_1.rooms.indexOf(room)] = room;
};
exports.changeMatchTurn = changeMatchTurn;
var beginChooseSidePhase = function (socket, roomId) {
    var room = (0, exports.findRoom)(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'chooseSide';
        server_1.rooms[server_1.rooms.indexOf(room)] = room;
        socket.to(room.name).emit('chooseSidePhaseStarted');
    }
};
exports.beginChooseSidePhase = beginChooseSidePhase;
var checkMapAlreadyPicked = function (room, map) {
    var teamOneMaps = room.matchConfig.matchTeamOne.picked;
    var teamTwoMaps = room.matchConfig.matchTeamTwo.picked;
    if (teamOneMaps.includes(map) || teamTwoMaps.includes(map)) {
        return true;
    }
    return false;
};
exports.checkMapAlreadyPicked = checkMapAlreadyPicked;
var checkIfIsChooseSidePhase = function (room) {
    if (room.matchConfig.matchPhase === 'chooseSide') {
        return true;
    }
    return false;
};
exports.checkIfIsChooseSidePhase = checkIfIsChooseSidePhase;
var checkifIsTimeToChooseSide = function (room) {
    if (room.matchConfig.matchMaps.length === room.matchConfig.matchBo) {
        return true;
    }
    return false;
};
exports.checkifIsTimeToChooseSide = checkifIsTimeToChooseSide;
var beginPickSidePhase = function (socket, roomId) {
    var room = (0, exports.findRoom)(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'pickSide';
        server_1.rooms[server_1.rooms.indexOf(room)] = room;
        socket.to(room.name).emit('pickSidePhaseStarted');
    }
};
exports.beginPickSidePhase = beginPickSidePhase;
var insertMatchLog = function (roomId, log) {
    var room = (0, exports.findRoom)(roomId);
    if (room) {
        room.matchLogs.push(log);
        server_1.rooms[server_1.rooms.indexOf(room)] = room;
    }
};
exports.insertMatchLog = insertMatchLog;
var checkIfisPickSidePhase = function (room) {
    if (room.matchConfig.matchPhase === 'pickSide') {
        return true;
    }
    return false;
};
exports.checkIfisPickSidePhase = checkIfisPickSidePhase;
