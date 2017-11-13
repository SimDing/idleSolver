import runCommand, {isCommand} from '../commands.js';
import {acceptError} from '../util.js';

export default class GameState {

  constructor(gameConnection) {
    this.gameConnection = gameConnection;
    this.commands = new Set();
  }

  followWidth(StateConstructor) {
    this.gameConnection.state = new StateConstructor(this.gameConnection);
  }

  get rl() {
    return this.gameConnection.readline;
  }

  onLine(line) {
    if (isCommand(line, this.commands)) {
      runCommand(line, this.commands, this)
        .catch(exeption => acceptError(this.gameConnection, exeption));
    } else {
      this.digestLine();
    }
  }

  digestLine(line) {
      
  }

  enter() { /* ignore */ }

  leave() { /* ignore */ }

}
