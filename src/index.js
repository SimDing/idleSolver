import {createServer} from 'net';
import GameConnection from './gameConnection.js';
import i18n from 'i18n';
import Welcome from './gameStates/welcome.js';

i18n.configure({
  'locales': [
    'en',
    'de'
  ],
  'directory': `${__dirname}/locales`,
});

let server = createServer({'allowHalfOpen': true}, socket => {
  let gc = new GameConnection(socket);

  // Hack i18n
  let res = {};
  let req = {res};
  i18n.init(req, res);
  gc.i18n = res;

  gc.state = new Welcome(gc);
});

server.on('listening', () => {
  console.info(server.address());
});

server.listen(1337);

