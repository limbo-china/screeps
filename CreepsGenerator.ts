import GameManager from "./GameManager";

interface ICreepsGenerator {
  generateIfLessThan(spawn: StructureSpawn, threshold: number): void

  getRole(): string
}

class BaseCreepsGenerator implements ICreepsGenerator {
  role: string;

  constructor(role: string) {
    this.role = role;
  }

  generateIfLessThan(spawn: StructureSpawn, threshold: number): void {

    var existCreeps = _.filter(Game.creeps,
      (creep) => creep.memory.role == this.getRole());
    if (existCreeps.length < threshold) {
      var name = this.getRole() + Game.time;
      if (spawn.spawnCreep(this.getBodyArray(spawn), name, {memory: this.getInitMemory()}) == OK) {
        console.log("Spawn " + spawn.name + ": spawns " + name);
      }
    }
  }

  getRole(): string {
    return this.role;
  }

  getInitMemory(): CreepMemory {
    return {role: this.role, building: false, upgrading: false, repairing: false, harvestering: false}
  }

  getBodyArray(spawn: StructureSpawn): BodyPartConstant[] {

    var totalEnergy = spawn.store.getCapacity(RESOURCE_ENERGY) + this.calcExtentionsEnergy(spawn);

    var energyPerGroup = BODYPART_COST[MOVE] + BODYPART_COST[CARRY] + BODYPART_COST[WORK];
    var num = Math.round(totalEnergy / energyPerGroup - 0.5);
    var extraMove = (totalEnergy % energyPerGroup) >= BODYPART_COST[MOVE];
    var resultLen = num * 3;
    if(extraMove){
      resultLen ++;
    }
    var result = new Array(resultLen);
    for(var i = 0 ;i<num ;i++){
      result[i*3] = MOVE;
      result[i*3 +1] = CARRY;
      result[i*3 +2] = WORK;
    }
    if(extraMove){
      result[resultLen-1] = MOVE;
    }

    return result;
  }
  calcExtentionsEnergy(spawn: StructureSpawn): number{
    var extentions = spawn.room.find(FIND_STRUCTURES,{filter:
        (structure) => structure.structureType == STRUCTURE_EXTENSION});
    var result = 0;
    for(var i = 0; i<extentions.length;i++){
      result += (extentions[i] as StructureExtension).store.getCapacity(RESOURCE_ENERGY);
    }
    return result;
  }
}

export class BuilderGenerator extends BaseCreepsGenerator {
}

export class HarvesterGenerator extends BaseCreepsGenerator {
}

export class RepairerGenerator extends BaseCreepsGenerator {
}

export class UpgraderGenerator extends BaseCreepsGenerator {
}

export class AttackerGenerator extends BaseCreepsGenerator {

  getBodyArray(): BodyPartConstant[] {
    return [MOVE, MOVE, ATTACK, ATTACK];
  }
}

export class GeneratorManager {

  roleNameArray: string[] = ["Builder", "Harvester", "Repairer", "Upgrader", "Attacker"];
  generatorMap: { [role: string]: ICreepsGenerator } = {
    "Builder": new BuilderGenerator("Builder"),
    "Harvester": new HarvesterGenerator("Harvester"),
    "Repairer": new RepairerGenerator("Repairer"),
    "Upgrader": new UpgraderGenerator("Upgrader"),
    "Attacker": new AttackerGenerator("Attacker")
  }

  run(spawn: StructureSpawn) {
    var roleAmountMap: { [role: string]: number } = {};
    var flags = Game.rooms[GameManager.roomNameArray[0]].find(FIND_FLAGS);
    if (flags) {
      for (var fi = 0; fi < flags.length; fi++) {
        for (var i = 0; i < this.roleNameArray.length; i++) {
          if (flags[fi].name.startsWith(this.roleNameArray[i])) {
            var num = Number(flags[fi].name.substring(this.roleNameArray[i].length));
            roleAmountMap[this.roleNameArray[i]] = num;
            break;
          }
        }
      }
    }
    for (var role in roleAmountMap) {
      this.generatorMap[role].generateIfLessThan(spawn, roleAmountMap[role]);
    }
  }
}
