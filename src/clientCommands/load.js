import {ClientCommand} from '../commands.js';
import {fromSaveString, saves, invalidSaveError} from '../saveGame.js';
import {acceptError} from '../util.js';

export default class Load extends ClientCommand {

  run(saveString) {
    fromSaveString(saveString.trim())
      .then(saveGame => {
        this.gameConnection.say('Successfully loaded!');
        saves.set(this.gameConnection, saveGame);
      })
      .catch(error => {
        if (error === invalidSaveError) {
          this.gameConnection.say('Invalid savegame!');
        } else {
          acceptError(this.gameConnection, error);
        }
      });
  }

}
