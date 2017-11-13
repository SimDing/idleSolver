import {ClientCommand} from '../commands.js';
import {FixedSizeLifo} from 'fixed-size-lifo';

const HISTORY_LENGTH = 32;

export default class Back extends ClientCommand {

  constructor(gc) {
    super(gc);
    this.history = new FixedSizeLifo(HISTORY_LENGTH);
    this.binding = gc.stateChanged.add(this.onStateChanged, this);
  }

  run(rest) {
    let back = 1;
    let trimmed = rest.trim();
    if (trimmed.length > 0) {
      let arg = Number(trimmed);
      if (!Number.isNan(arg)) back = arg;
      else {
        this.gameConnection.say('Invailid argument');
        return false;
      }
    }
    if (back > HISTORY_LENGTH) {
      this.gameConnection.say('I can\'t remember...');
      return false;
    }
    if (back > this.history.size()) {
      this.gameConnection.say('You want to go back to the time before you connected? You might want to <quit>!');
      return false;
    }
    if (back === 0) return true;
    if (back < 0) {
      this.gameConnection.say('u wut m8?');
      return false;
    }
    let then;
    for (let i = 0; i < back; i++) {
      then = this.history.pop();
    }
    this.binding.active = false;
    let exception = null;
    try {
      this.gameConnection.state = then;
    } catch (e) {
      exception = e;
    } finally {
      this.binding.active = true;
    }
    if (exception !== null) throw exception;
    return true;
  }

  onStateChanged(oldState, newState) {
    if (oldState !== null) this.history.push(oldState);
  }

}
