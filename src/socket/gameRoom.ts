export default class gameRoom {
  teamA: any;
  teamB: any;
  currentTurn: string;
  currentPhase: string;
  matchesCount: any;
  game: any;
  maps: any;
  logo: any;
  id: any;
  matchTurnInterval: any;
  lastActionTime: any;
  lastActionTeam: any;
  maxBans: any;
  maxPicks: any;
  mapsCount: any;
  logs: any[] = [];
  lastActionId: any;
  timeLeft: any;
  nonPickedMaps: any;
  autoActionStarted: boolean;
  turnDisplayText: any;
  initData: any;

  constructor(data: {
    teamA: any;
    teamB: any;
    game: any;
    matchesCount: any;
    matchId: any;
    maps: any;
    logo: any;
    matchTurnInterval: any;
  }) {
    this.initData = data;
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
    setInterval(() => {
      if (this.currentPhase === 'finished') return;
      this.updateTimeLeft();
    }, 100);
  }

  updateTimeLeft = () => {
    if (!this.autoActionStarted) return new Date();
    const now = new Date();
    const timeLeft = now.getTime() - this.lastActionTime.getTime();
    this.timeLeft = timeLeft;
  };

  currentData() {
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
  }
  resume() {
    return {
      turn: this.currentTurn,
      phase: this.currentPhase,
      bannedMaps: this.getBannedMaps(),
      pickedMaps: this.getPickedMaps(),
      matchId: this.id,
      logs: this.logs,
      lastAction: this.lastActionTime,
    };
  }

  getPickedMaps() {
    const pickedMaps: string[] = [];
    Object.keys(this.maps).forEach((map) => {
      if (this.maps[map].picked) {
        pickedMaps.push(map);
      }
    });
    return pickedMaps;
  }

  checkTurn(team: any) {
    if (this.currentTurn === team) {
      console.log('turn is correct');
      return true;
    }
    console.log('turn is not correct');
    return false;
  }
  updateMap(mapName: string | number, data: any) {
    this.maps[mapName] = data;
  }
  getMapData(mapName: any) {
    return this.maps[mapName];
  }
  changeTurn() {
    this.getTurnDisplayText();
    if (this.currentTurn === 'teamA') {
      this.currentTurn = 'teamB';
    } else if (this.currentTurn === 'teamB') {
      this.currentTurn = 'teamA';
    }
  }
  getTurnDisplayText() {
    let msg = '';
    if (this.currentTurn === 'teamA') {
      msg = this.teamA.name;
    } else if (this.currentTurn === 'teamB') {
      msg = this.teamB.name;
    }
    if (this.currentPhase === 'ban') {
      msg += ' is banning';
    } else if (this.currentPhase === 'pick') {
      msg += ' is picking';
    }
    this.turnDisplayText = msg;
  }

  findMap(mapName: string) {
    return this.maps[mapName];
  }
  checkBannedMax() {
    let bannedMaps = 0;
    Object.keys(this.maps).forEach((map) => {
      if (this.maps[map].banned) {
        bannedMaps++;
      }
    });
    if (bannedMaps >= this.maxBans) {
      console.log('max bans reached');
      return true;
    }
    return false;
  }

  banMap(mapName: string, team: any, timeout = false) {
    if (this.checkBannedMax()) return false;
    if (!this.checkTurn(team)) return false;
    if (this.currentPhase !== 'ban') return false;
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
      if (this.checkBannedMax()) {
        this.nonPickedMaps = this.getNonPickedMaps();
        this.currentPhase = 'pick';
      }
      return true;
    } else {
      console.log('mapNotFound');
      return false;
    }
  }
  getBannedMaps() {
    const bannedMaps = [];
    for (const map in this.maps) {
      if (this.maps[map].banned) {
        bannedMaps.push(map);
      }
    }
    return bannedMaps;
  }

  getNonPickedMaps() {
    const nonPickedMaps = [];
    for (const map in this.maps) {
      if (!this.maps[map].picked) {
        if (!this.maps[map].banned) nonPickedMaps.push(map);
      }
    }
    return nonPickedMaps;
  }
  getResultPickedMaps() {
    const pickedMaps = [];
    for (const map in this.maps) {
      if (this.maps[map].picked) {
        pickedMaps.push(this.maps[map]);
      }
    }
    return pickedMaps;
  }

  getNonBannedMaps() {
    const nonBannedMaps = [];
    for (const map in this.maps) {
      if (!this.maps[map].banned) {
        if (!this.maps[map].picked) nonBannedMaps.push(map);
      }
    }
    return nonBannedMaps;
  }

  insertLogs(log: any) {
    const logDTO = {
      action: log.action,
      map: log.map,
      team: log.team,
      side: log.side,
      actionAt: new Date(),
    };
    this.lastActionTime = new Date();
    this.lastActionTeam = log.team;
    this.logs = [...this.logs, logDTO];

    this.lastActionId = this.lastActionId + 1;
    const actionId = this.lastActionId;
    this.autoActionStarted = true;

    setTimeout(() => {
      const timeout = true;

      const inverseTeam = this.lastActionTeam === 'teamA' ? 'teamB' : 'teamA';
      if (this.lastActionId === actionId) {
        if (this.currentPhase === 'pick') {
          const nonPickedMaps = this.getNonPickedMaps();
          if (nonPickedMaps) {
            const randomMap =
              nonPickedMaps[Math.floor(Math.random() * nonPickedMaps.length)];
            const sides = ['attack', 'defense'];
            const randomSide = sides[Math.floor(Math.random() * sides.length)];
            this.pickMapSide(randomMap, inverseTeam, randomSide, timeout);
            if (this.maps[randomMap].side === 'attack') {
              this.maps[randomMap].attack = inverseTeam;
              this.maps[randomMap].defense =
                inverseTeam === 'teamA' ? 'teamB' : 'teamA';
            } else {
              this.maps[randomMap].defense = inverseTeam;
              this.maps[randomMap].attack =
                inverseTeam === 'teamA' ? 'teamB' : 'teamA';
            }

            this.nonPickedMaps = this.getNonPickedMaps();
          }
        }
        if (this.currentPhase === 'ban') {
          const nonBannedMaps = this.getNonBannedMaps();
          if (nonBannedMaps) {
            const randomMap =
              nonBannedMaps[Math.floor(Math.random() * nonBannedMaps.length)];
            this.banMap(randomMap, inverseTeam, timeout);
          }
        }
      }
    }, this.matchTurnInterval);
  }
  getAutoActionTime() {
    if (!this.autoActionStarted) return new Date();
    const lastActionTime = this.lastActionTime;
    const lastActionPlusInterval = new Date(
      lastActionTime.getTime() + this.matchTurnInterval,
    );

    return lastActionPlusInterval;
  }
  pickMapSide(mapName: string, team: any, side: any, timeout = false) {
    if (!this.checkTurn(team)) return false;

    if (this.maps[mapName]) {
      this.maps[mapName].picked = true;
      this.maps[mapName].pickedBy = team;
      this.maps[mapName].actionAt = new Date();
      this.maps[mapName].side = side;

      if (this.maps[mapName].side === 'attack') {
        this.maps[mapName].attack = team;
        this.maps[mapName].defense = team === 'teamA' ? 'teamB' : 'teamA';
      } else {
        this.maps[mapName].defense = team;
        this.maps[mapName].attack = team === 'teamA' ? 'teamB' : 'teamA';
      }

      this.insertLogs({
        action: timeout ? 'timeout pick' : 'pick',
        map: mapName,
        team: team,
        side: side,
      });

      this.changeTurn();
      this.nonPickedMaps = this.getNonPickedMaps();

      if (this.getPickedMaps().length >= this.maxPicks) {
        this.currentPhase = 'finished';
      }
      return true;
    } else {
      return false;
    }
  }
}
