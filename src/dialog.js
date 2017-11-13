const PAGE_HEIGHT = 20;
const PAGE_WIDTH = 65;
const LINE_SEPERATOR = '\n';
const QUESTION = '..';

// Split text into <pages> that <should> fit into a console window and
// need to be interactively confirmed before showing the next one.
// This ought to feel like a pkmn-style conservation.
// Single pages do not have to be confirmed unless alwaysStop is true.
export function paginate(text, readline, then, alwaysStop = false) {
  paginateLines(text.split(LINE_SEPERATOR).map(s => s.trim()), readline, then);
}

function paginateLines(lines, readline, then, stop) {
  let paragraphLen = 0;
  while (lines.length > 0) {
    if (lines[0].length === 0) {
      // Empty line -> start new page
      lines.shift();
      break;
    }
    let lineLengthWithBreaks = Math.ceil(lines[0].length / PAGE_WIDTH);
    let newLen = lineLengthWithBreaks + paragraphLen;
    if (newLen < PAGE_HEIGHT || paragraphLen === 0) {
      // Enough space left -> print to page
      readline.println(lines.shift());
      paragraphLen = newLen;
    } else {
      // Page full -> start new page
      break;
    }
  }
  if (lines.length > 0) {
    readline.question(
      QUESTION,
      () => paginateLines(lines, readline, then, true)
    );
  } else
  if (stop) readline.question(QUESTION, then);
  else then();
}

