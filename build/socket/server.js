"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = exports.clients = exports.rooms = void 0;
var socket_io_1 = require("socket.io");
var socketFunctions_1 = require("./socketFunctions");
var io = new socket_io_1.Server(3000);
exports.rooms = [];
exports.clients = [];
setInterval(function () {
    console.log(exports.rooms);
}, 10000);
var getToken = function (socket) {
    return socket.handshake.query.token;
};
var findRoom = function (roomId) {
    return exports.rooms.find(function (room) { return room.id === roomId; });
};
var isUserAllowedToVeto = function (socket, roomId) {
    var room = findRoom(roomId);
    var token = getToken(socket);
    if (room) {
        if (room.matchConfig.matchTeamOne.token === token ||
            room.matchConfig.matchTeamTwo.token === token) {
            return true;
        }
    }
    return false;
};
var removeTeamTokenFromOutput = function (room) {
    var matchTeamOne = room.matchTeamOne, matchTeamTwo = room.matchTeamTwo, rest = __rest(room, ["matchTeamOne", "matchTeamTwo"]);
    return rest;
};
var getTeamSideByToken = function (socket, roomId) {
    var room = findRoom(roomId);
    var token = getToken(socket);
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
var checkMapAlreadyBanned = function (room, map) {
    if (room.matchConfig.matchBannedMaps.includes(map)) {
        return true;
    }
    return false;
};
var checkMatchTurn = function (room, side) {
    if (room.matchConfig.matchTurn === side) {
        return true;
    }
    return false;
};
var beginPickPhase = function (socket, roomId) {
    var room = findRoom(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'pick';
        exports.rooms[exports.rooms.indexOf(room)] = room;
        socket.to(room.name).emit('pickPhaseStarted');
    }
};
var getTeamSideObject = function (room, side) {
    if (side === 'teamOne') {
        return room.matchConfig.matchTeamOne;
    }
    else if (side === 'teamTwo') {
        return room.matchConfig.matchTeamTwo;
    }
    return null;
};
var checkIfIsPickPhase = function (room) {
    if (room.matchConfig.matchPhase === 'pick') {
        return true;
    }
    return false;
};
var checkIfisBanPhase = function (room) {
    if (room.matchConfig.matchPhase === 'ban') {
        return true;
    }
    return false;
};
var getMatchTurn = function (room) {
    return room.matchConfig.matchTurn;
};
var changeMatchTurn = function (room) {
    if (room.matchConfig.matchTurn === 'teamOne') {
        room.matchConfig.matchTurn = 'teamTwo';
    }
    else if (room.matchConfig.matchTurn === 'teamTwo') {
        room.matchConfig.matchTurn = 'teamOne';
    }
    exports.rooms[exports.rooms.indexOf(room)] = room;
};
var beginChooseSidePhase = function (socket, roomId) {
    var room = findRoom(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'chooseSide';
        exports.rooms[exports.rooms.indexOf(room)] = room;
        socket.to(room.name).emit('chooseSidePhaseStarted');
    }
};
var checkMapAlreadyPicked = function (room, map) {
    var teamOneMaps = room.matchConfig.matchTeamOne.picked;
    var teamTwoMaps = room.matchConfig.matchTeamTwo.picked;
    if (teamOneMaps.includes(map) || teamTwoMaps.includes(map)) {
        return true;
    }
    return false;
};
var getMapMisc = function (map) {
    var mapMisc = {
        map_name: map,
        map_picture: 'https://i.imgur.com/0Z4Z4Zm.jpg',
        map_description: 'A map description',
    };
    return mapMisc;
};
var checkIfIsChooseSidePhase = function (room) {
    if (room.matchConfig.matchPhase === 'chooseSide') {
        return true;
    }
    return false;
};
var checkifIsTimeToChooseSide = function (room) {
    if (room.matchConfig.matchMaps.length === room.matchConfig.matchBo) {
        return true;
    }
    return false;
};
var beginPickSidePhase = function (socket, roomId) {
    var room = findRoom(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'pickSide';
        exports.rooms[exports.rooms.indexOf(room)] = room;
        socket.to(room.name).emit('pickSidePhaseStarted');
    }
};
var insertMatchLog = function (roomId, log) {
    var room = findRoom(roomId);
    if (room) {
        room.matchLogs.push(log);
        exports.rooms[exports.rooms.indexOf(room)] = room;
    }
};
var checkIfisPickSidePhase = function (room) {
    if (room.matchConfig.matchPhase === 'pickSide') {
        return true;
    }
    return false;
};
var endPickSidePhase = function (socket, roomId) {
    var room = findRoom(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'end';
        exports.rooms[exports.rooms.indexOf(room)] = room;
        insertMatchLog(roomId, {
            type: 'matchEnd',
            message: 'Match has ended',
        });
        socket.to(room.name).emit('pickSidePhaseEnded');
    }
};
io.on('connection', function (socket) {
    console.log('New connection', socket.id);
    if (socket.handshake.query.token) {
        exports.clients.push({
            id: socket.id,
            token: socket.handshake.query.token,
        });
    }
    socket.on('checkMatchTurn', function (roomId) {
        var room = findRoom(roomId);
        if (room) {
            socket.emit('matchTurnChecked', room.matchConfig.matchTurn);
        }
    });
    socket.on('checkMatchPhase', function (roomId) {
        var room = findRoom(roomId);
        if (room) {
            socket.emit('matchPhaseChecked', room.matchConfig.matchPhase);
        }
    });
    socket.on('createRoom', function (matchConfig) {
        socketFunctions_1.socketFunctions.createRoom(socket, matchConfig);
    });
    socket.on('joinRoom', function (roomId) {
        var room = findRoom(roomId);
        if (!room) {
            return socket.emit('roomNotFound', roomId);
        }
        if (isUserAllowedToVeto(socket, roomId)) {
            socket.join(roomId);
            var teamSide = getTeamSideByToken(socket, roomId);
            socket.emit('joinedRoom', [room, teamSide]);
        }
        else {
            socket.emit('notAllowedToJoinRoom');
        }
    });
    socket.on('showRoom', function (roomId) {
        var room = findRoom(roomId);
        if (!room) {
            return socket.emit('roomNotFound', roomId);
        }
        socket.emit('roomFound', removeTeamTokenFromOutput(room));
    });
    socket.on('banMap', function (roomId, mapName) {
        console.log('banMap', roomId, mapName);
        var room = findRoom(roomId);
        if (!room) {
            console.log('room not found');
            return socket.emit('roomNotFound', roomId);
        }
        if (!isUserAllowedToVeto(socket, roomId)) {
            console.log('not allowed to veto');
            return socket.emit('notAllowedToVeto');
        }
        if (!checkIfisBanPhase(room)) {
            console.log('not ban phase');
            return socket.emit('notBanPhase');
        }
        var teamSide = getTeamSideByToken(socket, roomId);
        if (checkMapAlreadyBanned(room, mapName)) {
            console.log('map already banned');
            return socket.emit('mapAlreadyBanned', mapName);
        }
        if (!checkMatchTurn(room, teamSide)) {
            console.log('not your turn');
            return socket.emit('notYourTurn');
        }
        console.log('banMap', roomId, mapName, teamSide);
        console.log(room);
        var alreadyBannedMapsCount = room.matchConfig.matchBannedMaps.length;
        if (alreadyBannedMapsCount >= room.matchMisc.maxBans) {
            console.log('max bans reached');
            beginPickSidePhase(socket, roomId);
            var notBannedMaps = room.matchConfig.matchMaps.filter(function (map) { return !room.matchConfig.matchBannedMaps.includes(map); });
            var pickeMapsObject = notBannedMaps.map(function (map) {
                return {
                    name: map,
                    teamOneSide: '',
                    teamTwoSide: '',
                };
            });
            room.matchConfig.matchPickedsMaps = pickeMapsObject;
            exports.rooms[exports.rooms.indexOf(room)] = room;
            return socket.emit('maxBansReached');
        }
        var teamSideObject = getTeamSideObject(room, teamSide);
        if (teamSide === 'teamOne') {
            room.matchConfig.matchTeamOne = __assign(__assign({}, teamSideObject), { banned: __spreadArray(__spreadArray([], teamSideObject.banned, true), [mapName], false) });
        }
        else if (teamSide === 'teamTwo') {
            room.matchConfig.matchTeamTwo = __assign(__assign({}, teamSideObject), { banned: __spreadArray(__spreadArray([], teamSideObject.banned, true), [mapName], false) });
        }
        var isTimeToChooseSide = checkifIsTimeToChooseSide(room);
        if (isTimeToChooseSide) {
            beginChooseSidePhase(socket, roomId);
        }
        room.matchConfig.matchBannedMaps.push(mapName);
        exports.rooms[exports.rooms.indexOf(room)] = room;
        changeMatchTurn(room);
        socket.to(room.name).emit('mapBanned', mapName);
        insertMatchLog(roomId, { type: 'ban', map: mapName, team: teamSide });
    });
    socket.on('pickSide', function (roomId, mapName, side) {
        console.log('pickSide', roomId, mapName, side);
        var room = findRoom(roomId);
        if (!room) {
            console.log('room not found');
            return socket.emit('roomNotFound', roomId);
        }
        if (!isUserAllowedToVeto(socket, roomId)) {
            console.log('not allowed to veto');
            return socket.emit('notAllowedToVeto');
        }
        var isPickTime = checkIfisPickSidePhase(room);
        if (!isPickTime) {
            console.log('not pick side phase');
            return socket.emit('notPickSidePhase');
        }
        var teamSide = getTeamSideByToken(socket, roomId);
        if (!checkMatchTurn(room, teamSide)) {
            console.log('not your turn');
            return socket.emit('notYourTurn');
        }
        var mapObject = room.matchConfig.matchPickedsMaps.find(function (map) { return map.name === mapName; });
        console.log({ mapObject: mapObject });
        if (mapObject.teamOneSide !== '' && mapObject.teamTwoSide !== '') {
            console.log('side already picked');
            return socket.emit('sideAlreadyPicked', mapName);
        }
        if (teamSide === 'teamOne') {
            mapObject.teamOneSide = side;
            mapObject.teamTwoSide = side === 'attack' ? 'defend' : 'attack';
        }
        else {
            mapObject.teamTwoSide = side;
            mapObject.teamOneSide = side === 'attack' ? 'defend' : 'attack';
        }
        room.matchConfig.matchPickedsMaps[room.matchConfig.matchPickedsMaps.indexOf(mapObject)] = mapObject;
        exports.rooms[exports.rooms.indexOf(room)] = room;
        changeMatchTurn(room);
        insertMatchLog(roomId, {
            type: 'pick',
            map: mapName,
            team: teamSide,
            side: side,
        });
        var maps = room.matchConfig.matchPickedsMaps;
        var notSelected = maps.filter(function (map) {
            return map.teamOneSide === '' && map.teamTwoSide === '';
        });
        if (notSelected.length === 0) {
            endPickSidePhase(socket, roomId);
        }
    });
});
exports.socketServer = io;
