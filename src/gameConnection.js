import GameState from './gameStates/gameState.js';
import {createInterface as createReadLine} from 'readline';
import devNull from 'dev-null';
import runCommand, {isCommand} from './commands.js';
import Signal from 'signals';
import {paginate} from './dialog.js';
// eslint-disable-next-line import/no-unresolved
import * as _commandClasses from './clientCommands';
import {acceptError} from './util.js';

const nullStream = devNull();
nullStream.resume = () => { /* Do nothing */ };

class ShutDown extends GameState {

  enter() {
    const gc = this.gameConnection;
    if (!gc.socket.destroyed) {
      gc.socket.end();
      gc.socket.destroy();
    }
    gc.socket.unref();
  }

  leave() {
    throw new Error('Forbidden!');
  }

  toString() {
    return 'Shutdown';
  }

}

export default class GameConnection {

  constructor(socket) {
    this.socket = socket;
    this.readline = this.genRL(socket);
    this.isShutDown = socket.destroyed;

    this.stateChanged = new Signal();
    this.commands = new Map(Object.entries(_commandClasses).map(([
      name,
      Class
    ]) => [
      name.toLowerCase(),
      new Class(this)
    ]));

    socket.on('error', err => {
      acceptError(this, err);
    });

    socket.on('close', () => {
      // Stream remaining I/O to dev-null
      this.readline = this.genRL(nullStream);
      this.close();
    });

    socket.on('end', () => {
      this.close();
    });
  }

  say(...args) {
    return new Promise((resolve, reject) => {
      paginate(
        this.i18n.__(...args),
        this.readline,
        resolve
      );
    });
  }

  set state(state) {
    let oldState = this.state;
    if (oldState) oldState.leave();
    this._state = state;
    this.state.enter();
    this.stateChanged.dispatch(oldState, this.state);

    return this._state;
  }

  get state() {
    return this._state;
  }

  close() {
    if (this.isShutDown) return;
    this.isShutDown = true;
    this.state = new ShutDown(this);
  }

  genRL(duplex) {
    const readline = createReadLine({
      'input': duplex,
      'output': duplex,
    });

    readline.on('line', line => {
      if (isCommand(line)) {
        const self = this;
        runCommand(line, this.commands)
          .catch(exception => acceptError(self, exception));
      }
    });

    /* 
     * The readline implementation is really akward...
     * Instead of simply writing to the output stream it calls
     * the line event if output is not a tty.
     * So we have to fix this.
     */
    readline.write = readline._writeToOutput;

    readline.println = line => {
      duplex.write(line);
      duplex.write('\r\n');
    };

    readline.on('close', this.close);

    return readline;
  }

}

