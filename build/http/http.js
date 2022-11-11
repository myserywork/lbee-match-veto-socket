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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var server_1 = require("../socket/server/server");
var app = (0, express_1.default)();
app.use(body_parser_1.default.json());
exports.http = app;
var generateUniqueId = function () {
    return Math.random().toString(36).substr(2, 9);
};
exports.http.post('/createRoom', function (req, res) {
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
    res.send({ mConfig: matchConfig });
});
exports.http.get('/rooms', function (req, res) {
    res.send(server_1.rooms);
});
exports.http.get('/room/:roomId', function (req, res) {
    var roomId = req.params.roomId;
    var room = server_1.rooms.find(function (room) { return room.id === roomId; });
    if (room) {
        res.send(room);
    }
    else {
        res.send('Room not found');
    }
});
