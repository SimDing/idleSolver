const guessing = new WeakMap();

function inferType(propName, ignore) {
  let obj = {},
      arr = [];
  let inArr = propName in obj,
      inObj = propName in arr;
  let isNum = typeof propName === 'number';
  let isStrNum = typeof propName === 'string' && propName.match(/^[0-9]+$/) !== null;
  let isArrProp = inArr && !inObj;
  if (isNum || isStrNum || isArrProp) return arr;
  if (!inObj) return obj;
  return null;
}

function autoGenerate(object, ignore = new Set()) {
  let guessType = (target, prop) => {
    if (ignore.has(prop)) return target;
    if (guessing.has(target)) {
      let inferedObject = inferType(prop);
      if (inferedObject !== null) {
        for (let [propName, value] of Object.entries(target)) {
          inferedObject[propName] = value;
        }
        let [parent, targetName] = guessing.get(target);
        guessing.delete(target);
        parent[targetName] = autoGenerate(inferedObject, ignore);
        return inferedObject;
      }
    }
    return target;
  };

  return new Proxy(object, {
    get(target, prop) {
      let workingOn = guessType(target, prop);

      if (prop in workingOn) {
        return workingOn[prop];
      } else if (ignore.has(prop)) {
        return undefined;
      } else {
        let newProp = {};
        guessing.set(newProp, [workingOn, prop]);
        workingOn[prop] = autoGenerate(newProp, ignore);
        return workingOn[prop];
      }
    },

    set(target, prop, value) {
      let workingOn = guessType(target, prop);
      workingOn[prop] = value;
      return true;
    }
  });
}

function deepAutoGenerate(object, ignore = new Set()) {
  for (let [name, value] of Object.entries(object)) {
    object[name] = autoGenerate(value);
  }
  return autoGenerate(object);
}

const ignore = new Set(['toJSON']);


// Extending WeakMap is not possible... Let's do the hack again

export const saves = new WeakMap();
const oldGet = saves.get;

saves.get = (connection) => {
  if (saves.has(connection)) return oldGet.apply(saves, connection);
  else {
    let saveGame = autoGenerate({}, ignore);
    saves.set(connection, saveGame);
    return saveGame;
  }
};


export default function get(c) {
  return saves.get(c);
}

import {sign, signatureLength} from './util.js';
export function toSaveString(saveGame) {
  saveGame.flags.savedAtLeastOnce = true;
  let json = JSON.stringify(saveGame);
  return Promise.all([sign(String(2 * signatureLength + json.length)), sign(json)])
    .then(([lenSig, jsonSig]) => {
      return `${lenSig}${json}${jsonSig}`;
    });
}

export const invalidSaveError = new Error('Invalid saveString');

export function fromSaveString(saveString) {
  let msgLength = saveString.length - 2 * signatureLength;

  if (msgLength <= 0) return Promise.reject(invalidSaveError);
  let lenSig = saveString.substr(0, signatureLength);
  let messageStart = signatureLength;
  let msgSig = saveString.substr(messageStart + msgLength);
  let json;

  return sign(String(saveString.length))
    .then(computedLenSig => {
      if (computedLenSig === lenSig) {
        json = saveString.substr(messageStart, msgLength);
        return Promise.resolve(json);
      } else {
        return Promise.reject(invalidSaveError);
      }
    })
    .then(sign)
    .then(computedMsgSig => {
      if (computedMsgSig === msgSig) {
        let loaded = JSON.parse(json),
            save = deepAutoGenerate(loaded);
        return Promise.resolve(save);
      } else return Promise.reject(invalidSaveError);
    });
}
