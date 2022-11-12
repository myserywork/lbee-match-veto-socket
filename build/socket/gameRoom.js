"use strict";
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
var gameRoom = /** @class */ (function () {
    function gameRoom(data) {
        var _this = this;
        this.logs = [];
        this.updateTimeLeft = function () {
            if (!_this.autoActionStarted)
                return new Date();
            var now = new Date();
            var timeLeft = now.getTime() - _this.lastActionTime.getTime();
            _this.timeLeft = timeLeft;
        };
        this.teamA = data.teamA;
        this.teamB = data.teamB;
        this.currentTurn = 'teamA';
        this.currentPhase = 'ban';
        this.game = data.game;
        this.matchesCount = data.matchesCount;
        this.id = '' + data.matchId;
        this.maps = data.maps;
        this.logo = data.logo;
        this.maxBans = Object.keys(data.maps).length - data.matchesCount;
        this.maxPicks = data.matchesCount;
        this.mapsCount = data.maps.length;
        this.matchTurnInterval = data.matchTurnInterval;
        this.lastActionTime = 0;
        this.lastActionId = 1;
        this.autoActionStarted = false;
        setInterval(function () {
            if (_this.currentPhase === 'finished')
                return;
            _this.updateTimeLeft();
        }, 100);
    }
    gameRoom.prototype.currentData = function () {
        return {
            teamA: this.teamA,
            teamB: this.teamB,
            currentTurn: this.currentTurn,
            currentPhase: this.currentPhase,
            game: this.game,
            matchesCount: this.matchesCount,
            id: this.id,
            maps: this.maps,
            logo: this.logo,
        };
    };
    gameRoom.prototype.resume = function () {
        return {
            turn: this.currentTurn,
            phase: this.currentPhase,
            bannedMaps: this.getBannedMaps(),
            pickedMaps: this.getPickedMaps(),
            matchId: this.id,
            logs: this.logs,
            lastAction: this.lastActionTime,
        };
    };
    gameRoom.prototype.getPickedMaps = function () {
        var _this = this;
        var pickedMaps = [];
        Object.keys(this.maps).forEach(function (map) {
            if (_this.maps[map].picked) {
                pickedMaps.push(map);
            }
        });
        return pickedMaps;
    };
    gameRoom.prototype.checkTurn = function (team) {
        if (this.currentTurn === team) {
            console.log('turn is correct');
            return true;
        }
        console.log('turn is not correct');
        return false;
    };
    gameRoom.prototype.updateMap = function (mapName, data) {
        this.maps[mapName] = data;
    };
    gameRoom.prototype.getMapData = function (mapName) {
        return this.maps[mapName];
    };
    gameRoom.prototype.changeTurn = function () {
        if (this.currentTurn === 'teamA') {
            this.currentTurn = 'teamB';
        }
        else if (this.currentTurn === 'teamB') {
            this.currentTurn = 'teamA';
        }
    };
    gameRoom.prototype.findMap = function (mapName) {
        return this.maps[mapName];
    };
    gameRoom.prototype.checkBannedMax = function () {
        var _this = this;
        var bannedMaps = 0;
        Object.keys(this.maps).forEach(function (map) {
            if (_this.maps[map].banned) {
                bannedMaps++;
            }
        });
        if (bannedMaps >= this.maxBans) {
            console.log('max bans reached');
            return true;
        }
        return false;
    };
    gameRoom.prototype.banMap = function (mapName, team, timeout) {
        if (timeout === void 0) { timeout = false; }
        if (this.checkBannedMax())
            return false;
        console.log({ currentMaps: this.maps });
        console.log({
            action: 'ban',
            map: mapName,
            team: team,
            mapObj: this.maps[mapName],
            timeout: timeout,
        });
        if (!this.checkTurn(team))
            return false;
        if (this.currentPhase !== 'ban')
            return false;
        if (this.maps[mapName]) {
            this.maps[mapName].banned = true;
            this.maps[mapName].bannedBy = team;
            this.maps[mapName].actionAt = new Date();
            this.insertLogs({
                action: timeout ? 'timeout ban' : 'ban',
                map: mapName,
                team: team,
            });
            this.changeTurn();
            if (this.checkBannedMax())
                this.currentPhase = 'pick';
            return true;
        }
        else {
            console.log('mapNotFound');
            return false;
        }
    };
    gameRoom.prototype.getBannedMaps = function () {
        var bannedMaps = [];
        for (var map in this.maps) {
            if (this.maps[map].banned) {
                bannedMaps.push(map);
            }
        }
        return bannedMaps;
    };
    gameRoom.prototype.getNonPickedMaps = function () {
        if (this.currentPhase === 'ban')
            return false;
        var nonPickedMaps = [];
        for (var map in this.maps) {
            if (!this.maps[map].picked) {
                if (!this.maps[map].banned)
                    nonPickedMaps.push(map);
            }
        }
        return nonPickedMaps;
    };
    gameRoom.prototype.getResultPickedMaps = function () {
        var pickedMaps = [];
        for (var map in this.maps) {
            if (this.maps[map].picked) {
                pickedMaps.push(this.maps[map]);
            }
        }
        return pickedMaps;
    };
    gameRoom.prototype.getNonBannedMaps = function () {
        var nonBannedMaps = [];
        for (var map in this.maps) {
            if (!this.maps[map].banned) {
                if (!this.maps[map].picked)
                    nonBannedMaps.push(map);
            }
        }
        return nonBannedMaps;
    };
    gameRoom.prototype.insertLogs = function (log) {
        var _this = this;
        var logDTO = {
            action: log.action,
            map: log.map,
            team: log.team,
            side: log.side,
            actionAt: new Date(),
        };
        this.lastActionTime = new Date();
        this.lastActionTeam = log.team;
        this.logs = __spreadArray(__spreadArray([], this.logs, true), [logDTO], false);
        this.lastActionId = this.lastActionId + 1;
        var actionId = this.lastActionId;
        this.autoActionStarted = true;
        setTimeout(function () {
            var timeout = true;
            var inverseTeam = _this.lastActionTeam === 'teamA' ? 'teamB' : 'teamA';
            if (_this.lastActionId === actionId) {
                if (_this.currentPhase === 'pick') {
                    var nonPickedMaps = _this.getNonPickedMaps();
                    if (nonPickedMaps) {
                        var randomMap = nonPickedMaps[Math.floor(Math.random() * nonPickedMaps.length)];
                        var sides = ['attack', 'defense'];
                        var randomSide = sides[Math.floor(Math.random() * sides.length)];
                        _this.pickMapSide(randomMap, inverseTeam, randomSide, timeout);
                    }
                }
                if (_this.currentPhase === 'ban') {
                    var nonBannedMaps = _this.getNonBannedMaps();
                    if (nonBannedMaps) {
                        var randomMap = nonBannedMaps[Math.floor(Math.random() * nonBannedMaps.length)];
                        _this.banMap(randomMap, inverseTeam, timeout);
                    }
                }
            }
        }, this.matchTurnInterval);
    };
    gameRoom.prototype.getAutoActionTime = function () {
        if (!this.autoActionStarted)
            return new Date();
        var lastActionTime = this.lastActionTime;
        var lastActionPlusInterval = new Date(lastActionTime.getTime() + this.matchTurnInterval);
        return lastActionPlusInterval;
    };
    gameRoom.prototype.pickMapSide = function (mapName, team, side, timeout) {
        if (timeout === void 0) { timeout = false; }
        if (!this.checkTurn(team))
            return false;
        if (this.maps[mapName]) {
            this.maps[mapName].picked = true;
            this.maps[mapName].pickedBy = team;
            this.maps[mapName].actionAt = new Date();
            this.maps[mapName].side = side;
            this.insertLogs({
                action: timeout ? 'timeout pick' : 'pick',
                map: mapName,
                team: team,
                side: side,
            });
            this.changeTurn();
            if (this.getPickedMaps().length >= this.maxPicks) {
                this.currentPhase = 'finished';
            }
            return true;
        }
        else {
            return false;
        }
    };
    return gameRoom;
}());
exports.default = gameRoom;
