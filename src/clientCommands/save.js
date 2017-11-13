import {ClientCommand} from '../commands.js';
import getSaveGame, {toSaveString} from '../saveGame.js';
import {acceptError} from '../util.js';


export default class Save extends ClientCommand {

  run() {
    const saveGame = getSaveGame(this.gameConnection);
    saveGame.flags.savedAtLeastOnce = true;
    toSaveString(saveGame)
      .then(saveString => {
        this.gameConnection.readline.println(saveString);
      })
      .catch(e => acceptError(this.gameConnection, e));
  }

}
