export default class Constants {
  static ROLE: {
    HARVESTER: "Harvester",
    UPGRADER: "Upgrader",
    BUILDER: "Builder"
  }
  static CREEPMEMORY: {
    IDLE:{
      role: "",
      room: "",
      building: false,
      upgrading: false
    }
    HARVESTER: {
      role: "Harvester",
      room: "",
      building: false,
      upgrading: false
    },
    UPGRADER: {
      role: "Upgrader",
      room: "",
      building: false,
      upgrading: false
    },
    BUILDER: {
      role: "Builder",
      room: "",
      building: false,
      upgrading: false
    }
  }
}
