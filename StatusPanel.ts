import GameManager from "./GameManager";

export default class StatusPanel {
  static showCreepsStatistics(): void {
    var i = 0;
    for (var roomName in Game.rooms) {
      if (!Game.rooms[roomName]) return;
      GameManager.roomNameArray[0] = roomName;
      var numInfo: { [index: string]: number } = {}
      for (var name in Game.creeps) {
        if (numInfo[Game.creeps[name].memory.role] == null) {
          numInfo[Game.creeps[name].memory.role] = 1;
        } else {
          numInfo[Game.creeps[name].memory.role]++;
        }
        Game.rooms[roomName].visual.text(name,
          10,
          i + 2,
          {align: 'center', opacity: 0.8});
        i++;
      }
      for (var role in numInfo) {
        Game.rooms[roomName].visual.text(role + ": " + numInfo[role],
          10, i + 2, {align: 'center', opacity: 0.8});
        i++;
      }
    }
  }
}
