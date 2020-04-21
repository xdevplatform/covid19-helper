const YAML = require('yamljs');
const fs = require('fs');
const { EventEmitter } = require('events');

class Agent extends EventEmitter {
  constructor() {
    super();
    this.script = null;
    this.file = null;
    this.entryPoint = 'start';
    this.state = {};
  }

  loadFile(file, state = {}) {
    [this.file, this.entryPoint] = file.split('#');
    this.entryPoint = this.entryPoint || 'start';
    try {
      this.script = YAML.load(this.file);
    } catch (e) {
      console.error('Exception:', e);
    }
    
    this.step(this.entryPoint);
  }

  currentStep() {
    return this.script ? this.script[this.entryPoint] : null;
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
  }

  step(entryPoint = 'start', state = {}) {
    if (entryPoint.indexOf('#') > -1) {
      this.loadFile(entryPoint, state);
      return;
    }

    if (!this.script[entryPoint]) {
      throw Error(`No entry point named ${entryPoint} defined in ${this.file}. Add the entry point in your script file.`);
    }
    this.setState(state);
    this.entryPoint = entryPoint;
    this.emit('step');
  }
}

module.exports = Agent;