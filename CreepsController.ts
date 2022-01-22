export interface ICreepsController {
  run(creep: Creep): void
}

export class CreepsControllerFactory {
  static newCreepController(role: string): ICreepsController | null {
    switch (role) {
      case "Builder":
        return new BuilderController(role);
      case "Harvester":
        return new HarvesterController(role);
      case "Upgrader":
        return new UpgraderController(role);
      case "Attacker":
        return new AttackerController(role);
      case "Repairer":
        return new RepairerController(role);
      default:
        return null;
    }
    ;
  }
}

export class BaseCreepsController implements ICreepsController {

  role: string;

  constructor(role: string) {
    this.role = role;
  }

  idleMove(creep: Creep): boolean {
    var flags = creep.room.find(FIND_FLAGS);
    if (flags && flags != undefined) {
      for (var i = 0; i < flags.length; i++) {
        if (creep.name == flags[i].name) {
          creep.moveTo(flags[i], {visualizePathStyle: {stroke: '#ffaa00'}});
          return true;
        }
      }
    }
    return false;
  }

  run(creep: Creep): void {
    if (this.idleMove(creep)) {
      return
    }
    ;
  }

}

export class WorkerCreepsController extends BaseCreepsController {
  run(creep: Creep) {
    super.run(creep);
    this.workingStatusControl(creep);
    if (this.isWorking(creep)) {
      this.work(creep);
    } else {
      this.prepare(creep);
    }
  }

  isWorking(creep: Creep): boolean {
    switch (this.role) {
      case "Harvester" :
        return creep.memory.harvestering;
      case "Builder":
        return creep.memory.building;
      case "Upgrader":
        return creep.memory.upgrading;
      case "Repairer":
        return creep.memory.repairing;
    }
    return false;
  }

  setWorking(isWorking: boolean, creep: Creep): void {
    switch (this.role) {
      case "Harvester" :
        creep.memory.harvestering = isWorking;
        break;
      case "Builder":
        creep.memory.building = isWorking;
        break;
      case "Upgrader":
        creep.memory.upgrading = isWorking;
        break;
      case "Repairer":
        creep.memory.repairing = isWorking;
        break;
    }
  }

  workingStatusControl(creep: Creep) {
    if (this.isWorking(creep) && creep.store[RESOURCE_ENERGY] == 0) {
      this.setWorking(false, creep);
      creep.say('🔄 Prepare');
    }
    if (!this.isWorking(creep) && creep.store.getFreeCapacity() == 0) {
      this.setWorking(true, creep);
      creep.say('🚧' + this.role);
    }
  }

  findWorkTarget(creep: Creep): any {
  }

  executeWorkAction(creep: Creep, target: any): any {
  }

  findSource1(creep: Creep): any {
    return creep.pos.findClosestByPath(FIND_STRUCTURES,
      {
        filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
          && structure.store[RESOURCE_ENERGY] > 0
      });
  }

  findSource2(creep: Creep): any {
    return creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  }

  executePrepareAction1(creep: Creep, source: any): any {
    return creep.withdraw(source, RESOURCE_ENERGY);
  }

  executePrepareAction2(creep: Creep, source: any): any {
    return creep.harvest(source);
  }

  idle(creep: Creep) {
    var flag = creep.pos.findClosestByPath(FIND_FLAGS,
      {filter: (flags) => flags.name.startsWith(creep.memory.role)});
    if (flag) {
      creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
  }

  work(creep: Creep) {
    var target = this.findWorkTarget(creep);
    if (target) {
      if (this.executeWorkAction(creep, target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
      }
    } else {
      this.idle(creep);
    }
  }

  prepare(creep: Creep) {
    var source = this.findSource1(creep);
    if (source) {
      if (this.executePrepareAction1(creep, source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    } else {
      var source2 = this.findSource2(creep);
      if (source2) {
        if (this.executePrepareAction2(creep, source2) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source2, {visualizePathStyle: {stroke: '#ffaa00'}});

        }
      }
    }
  }
}

export class BuilderController extends WorkerCreepsController {

  findWorkTarget(creep: Creep): any {
    return creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  }

  executeWorkAction(creep: Creep, target: any): any {
    return creep.build(target);
  }
}

export class HarvesterController extends BaseCreepsController {
  run(creep: Creep): void {
    super.run(creep);
    if (!creep.memory.harvestering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.harvestering = true;
      creep.say('🔄 harvest');
    }
    if (creep.memory.harvestering && creep.store.getFreeCapacity() == 0) {
      creep.memory.harvestering = false;
      creep.say('🚧 transfer');
    }
    if (creep.memory.harvestering) {
      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
    } else {
      var nearTargetFlag =  creep.pos.findClosestByPath(FIND_FLAGS,
        {filter: (flags) => flags.name.startsWith(creep.memory.role)});
      var pos;
      if(nearTargetFlag){
        pos = nearTargetFlag.pos;
      }else{
        pos = creep.pos;
      }
      var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });
      if (!target) {
        target = pos.findClosestByPath(FIND_STRUCTURES,
          {
            filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
              && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          });
      }
      if (target) {
        var free =
          (target as StructureContainer | StructureStorage | StructureSpawn
            | StructureExtension | StructureTower).store.getFreeCapacity(RESOURCE_ENERGY);
        var amount = Math.min(creep.store[RESOURCE_ENERGY], free);
        if (creep.transfer(target, RESOURCE_ENERGY, amount) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      }
    }
  }

}

export class UpgraderController extends WorkerCreepsController {

  findWorkTarget(creep: Creep): any {
    return creep.room.controller;
  }

  executeWorkAction(creep: Creep, target: any): any {
    return creep.upgradeController(target);
  }

}

export class AttackerController extends BaseCreepsController {
  run(creep: Creep): void {
    super.run(creep);
    var flags = creep.room.find(FIND_FLAGS);
    if (flags) {
      var targets = flags[0].pos.lookFor(LOOK_STRUCTURES);
      if (targets) {
        if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
    }
  }

}

export class RepairerController extends WorkerCreepsController {

  findWorkTarget(creep: Creep): any {
    return creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    });
  }

  executeWorkAction(creep: Creep, target: any): any {
    return creep.repair(target);
  }

}
