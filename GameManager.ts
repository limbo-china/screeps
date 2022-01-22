import {GeneratorManager} from "./CreepsGenerator";
import { CreepsControllerFactory,ICreepsController} from "./CreepsController";

export default class GameManager{
  static HarvesterControllerSingleton : ICreepsController | null=
    CreepsControllerFactory.newCreepController("Harvester");
  static AttackerControllerSingleton : ICreepsController | null=
    CreepsControllerFactory.newCreepController("Attacker");
  static UpgraderControllerSingleton : ICreepsController | null=
    CreepsControllerFactory.newCreepController("Upgrader");
  static BuilderControllerSingleton : ICreepsController | null=
    CreepsControllerFactory.newCreepController("Builder");
  static RepairControllerSingleton : ICreepsController | null =
    CreepsControllerFactory.newCreepController("Repairer");

  static getCreepsControllerSingleton(role:string):ICreepsController | null{
    switch (role){
      case "Harvester" : return this.HarvesterControllerSingleton;
      case "Attacker": return this.AttackerControllerSingleton;
      case "Upgrader": return this.UpgraderControllerSingleton;
      case "Builder": return this.BuilderControllerSingleton;
      case "Repairer": return this.RepairControllerSingleton;
      default: return null;
    }
  }

  static roomNameArray:string[] = new Array(5);

  static generatorManager:GeneratorManager = new GeneratorManager();
}
