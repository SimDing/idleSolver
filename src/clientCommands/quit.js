import {ClientCommand} from '../commands.js';

export default class Quit extends ClientCommand {

  run() {
    this.gameConnection.close();
  }

}
