import GameState from './gameState.js';

const WELCOME_TEXT = 'Welcome to IDLE/SOLVER! ' +
  'This is the game where YOU have to solve my problems. ' +
  'That\'s SUPER exciting since starting now I will just lay back and let you do all my work. ' +
  'I bet you are just as eager to start as I am to chill at my sofa.' +
  '\n\nUuuhm and if you reaally need my help just ask by typing \'help\' and confirming with \'enter\'' +
  '\nJust don\'t overdo that since I have important work to do. At my sofa. Seeya!';

export default class Welcome extends GameState {

  enter() {
    this.gameConnection.say(WELCOME_TEXT);
  }

  leave() {
    this.rl.println('Bye!');
  }

  toString() {
    return 'WelcomeState';
  }

}
