import { type Position, type Selection } from "vscode";
import FileProps from "../types/fileprops.type";

export class TextOperations {
  /** @deprecated.  Now can use document.lineAt() in OpenFileFromText#getWordRanges. */
  public static getCurrentLine(iText: string, iLine: number): string {
    if (iText === undefined || iText === "") {
      return "";
    }

    const raw = iText;
    const end = raw.length;
    let start = 0;
    let tmp = "";
    const txt: string[] = [];
    while (start <= end) {
      if (raw[start] === "\n" || raw[start] === "\r") {
        txt.push(tmp);
        if (txt.length > iLine) {
          break;
        }
        tmp = "";
        if (start + 1 < end) {
          if (raw[start] === "\r" && raw[start + 1] === "\n") {
            start++;
          }
        }
      } else if (start === end) {
        txt.push(tmp);
      } else {
        tmp += raw[start];
      }
      start++;
    }
    if (txt.length > iLine) {
      return txt[iLine];
    }
    return "";
  }

  public static getPathAndPosition(iWord: string): FileProps {
    const fileAndLine: FileProps = {
      file: iWord,
      line: -1,
      column: -1,
    };

    const lPos = iWord.lastIndexOf(":");
    if (lPos > -1) {
      const numberAfterLastColon = parseInt(iWord.substring(lPos + 1)); // use original parseInt, may not accurate and thus only limit start with number after colon
      if (isNaN(numberAfterLastColon)) {
        fileAndLine.file = iWord.length === lPos + 1 ? iWord.substring(0, lPos) : iWord;
        fileAndLine.line = fileAndLine.column = -1;
      } else {
        let b4Num = lPos - 1;
        while (b4Num > 0 && iWord[b4Num] >= "0" && iWord[b4Num] <= "9") {
          --b4Num;
        }
        let fileEnd;
        if (b4Num < lPos - 1 && iWord[b4Num] === ":") {
          // i.e. :<integer> before this colon
          fileAndLine.line = parseInt(iWord.substring(b4Num + 1, lPos));
          fileAndLine.column = numberAfterLastColon;
          fileEnd = b4Num;
        } else {
          fileAndLine.line = numberAfterLastColon;
          fileAndLine.column = -1;
          fileEnd = lPos;
        }
        fileAndLine.file = iWord.substring(0, fileEnd);
      }
    }
    return fileAndLine;
  }

  public static getWordBetweenBounds(iText: string, iPos: Position, iBounds: RegExp): string {
    if (iText === undefined || iText === "") {
      return "";
    }
    const end = iText.length;
    let i = iPos.character;
    let j = iPos.character;
    if (end < i) {
      return "";
    }

    i--; // Fix: allow cursor touching the right-edge of the target path to work properly
    for (; i >= 0; i--) {
      const t = iText[i];
      if (t.match(iBounds) !== null) {
        break;
      }
    }
    i++;
    for (; j < end; j++) {
      const t = iText[j];
      if (t.match(iBounds) !== null) {
        break;
      }
      if (t === ":") {
        const lineColMatches = iText.substring(i, j).match(/:\d+(:\d+)?$/);
        if (lineColMatches !== null) {
          // if the string before this ':' is already ":<number>[:<column>]", gonna stops, to remove any grep output like ":<matching-line>" at j
          if (lineColMatches[1] === undefined) {
            // doesn't have column number before yet, so read any valid ":<column>" pattern at this colon
            let iSkipNum = j + 1;
            while (iSkipNum < end && iText[iSkipNum] >= "0" && iText[iSkipNum] <= "9") {
              iSkipNum++;
            }
            if (iSkipNum > j + 1) {
              // i.e. is ":<number>" at j
              if (iSkipNum === end || iText[iSkipNum] === ":" || iText[iSkipNum].match(iBounds) !== null) {
                // at j, accept the column number if it's either :col or :col:... or :col<path-delimiter>
                j = iSkipNum;
              }
            }
          }
          break;
        }
      }
    }
    return iText.substring(i, j);
  }

  public static getWordOfSelection(iText: string, iSelection: Selection): string {
    if (iText === undefined || iText === "") {
      return "";
    }
    return iText.substring(iSelection.start.character, iSelection.end.character);
  }

  public static fixedCharCodeAt(str: string, idx: number): number | boolean {
    // ex. fixedCharCodeAt('\uD800\uDC00', 0); // 65536
    // ex. fixedCharCodeAt('\uD800\uDC00', 1); // false
    idx = idx ?? 0;
    const code = str.charCodeAt(idx);
    let hi, low;

    // High surrogate (could change last hex to 0xDB7F
    // to treat high private surrogates
    // as single characters)
    if (code >= 0xd800 && code <= 0xdbff) {
      hi = code;
      low = str.charCodeAt(idx + 1);
      if (isNaN(low)) {
        throw new Error("High surrogate not followed by low surrogate in fixedCharCodeAt()");
      }
      return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      // Low surrogate
      // We return false to allow loops to skip
      // this iteration since should have already handled
      // high surrogate above in the previous iteration
      return false;
      // hi = str.charCodeAt(idx - 1);
      // low = code;
      // return ((hi - 0xD800) * 0x400) +
      //   (low - 0xDC00) + 0x10000;
    }
    return code;
  }
}
