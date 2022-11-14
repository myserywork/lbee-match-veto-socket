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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
var express = __importStar(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var server_1 = require("../socket/server/server");
var cors_1 = __importDefault(require("cors"));
var app = express.default();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
var generateUniqueId = function () {
    return Math.random().toString(36).substr(2, 9);
};
exports.httpServer = app;
exports.httpServer.post('/createRoom', function (req, res) {
    var checkIfRoomExists = server_1.rooms.find(function (room) { return room.name === req.body.roomName; });
    if (checkIfRoomExists) {
        server_1.rooms.slice(server_1.rooms.indexOf(checkIfRoomExists), 1);
    }
    var matchConfig = req.body;
    var teamAToken = 'teamA';
    var teamBToken = 'teamB';
    var teamA = __assign(__assign({}, matchConfig.teamA), { picked: [], banned: [], side: '', token: teamAToken });
    var teamB = __assign(__assign({}, matchConfig.teamB), { picked: [], banned: [], side: '', token: teamBToken });
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
    (0, server_1.createRoom)(matchConfig);
    res.send({ matchData: matchConfig });
});
exports.httpServer.get('/rooms', function (req, res) {
    res.send(server_1.rooms);
});
exports.httpServer.get('/room/:roomId', function (req, res) {
    var roomId = req.params.roomId;
    var room = server_1.rooms.find(function (room) { return room.id === roomId; });
    if (room) {
        res.send(room);
    }
    else {
        res.send('Room not found');
    }
});
