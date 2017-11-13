import {createHmac} from 'crypto';

// TODO: externalize this
const secretKey = 'sdfswfnmewoirfmoewinfxoiew';

const algorithm = 'sha256';
const encoding = 'hex';
export const signatureLength = 64;

export function sign(...message) {
  return new Promise((resolve, reject) => {
    const hmac = createHmac(algorithm, secretKey);
    hmac.on('readable', () => {
      const data = hmac.read();
      if (data) {
        resolve(data.toString(encoding));
      } else {
        reject(new Error('No data'));
      }
    });
    for (let d of [...message]) hmac.write(d);
    hmac.end();
  });
}

export function verify(signature, ...message) {
  return sign(...message)
    .then(hmac => hmac === signature);
}

export function acceptError(gameConnection, error) {
  gameConnection.say('Something bad happed on the server. I am sorry.');
  console.error(error);
}

const promiseWeakMap = new WeakMap();
export class ErrorFirstCallbackPromise extends Promise {

  constructor() {
    let state;
    super((resolve, reject) => {
      state = {
        resolve,
        reject
      };
    });
    promiseWeakMap.set(this, state);
  }

  get callback() {
    let state = promiseWeakMap.get(this);
    return (err, data) => {
      if (err) state.resolve(data);
      else state.reject(error);
    };
  }

}
