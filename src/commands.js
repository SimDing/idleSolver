// Split line into first word and the rest
const CMD_PATTERN = /(\b\w*\b)(.*$)/;

export class NoCommandError extends Error {

  constructor() {
    super('Not a Command!');
  }

}

export function isCommand(line, cmds) {
  return parseLine(line, cmds).hasCommand;
}

function parseLine(line, cmds) {
  let found = CMD_PATTERN.exec(line) !== null;
  let ret = {
    'hasCommand': false,
    'command': null,
    'restOfLine': '',
    line,
  };
  if (found !== null) {
    let [_, commandName, restOfLine] = found;
    ret.restOfLine = restOfLine;
    commandName = commandName.toLowerCase();
    if (cmds.has(commandName)) {
      ret.hasCommand = true;
      ret.command = cmds.get(commandName);
    }
  }
  return ret;
}

// Returns the Promise of a ran command
export default function runAsCommand(line, cmds, ...args) {
  let {hasCommand, command, restOfLine} = parseLine(line, cmds);
  if (hasCommand) {
    Promise.resolve(command.run(restOfLine, ...args));
  } else {
    Promise.reject(new NoCommandError());
  }
}

export class ClientCommand {

  constructor(gameConnection) {
    this.gameConnection = gameConnection;
  }

  run() {
    throw new Error('Not implemented!');
  }

  mayRun() {
    return true;
  }

}
