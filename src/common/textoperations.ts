'use strict';

import * as vscode from 'vscode';
import { ConfigHandler } from '../configuration/confighandler';

export class TextOperations
{
	/** @deprecated.  Now can use document.lineAt() in OpenFileFromText#getWordRanges. */
	public static getCurrentLine(iText: string, iLine: number): string
	{
		if( iText === undefined || iText === "" ){
			return "";
		}

		let raw = iText;
		let end = raw.length;
		let start = 0;
		let tmp = "";
		let newLine = false;
		let txt: string[] = [];
		while(start<=end)
		{
			if( raw[start] === '\n' || raw[start] === '\r' )
			{
				txt.push(tmp);
				if( txt.length > iLine ){
					break;
				}
				tmp = "";
				if( start+1 < end )
				{
					if( raw[start] === '\r' && raw[start+1] === '\n' ){
						start++;
					}
				}
			}
			else if(start === end){
				txt.push(tmp);
			}
			else
			{
				tmp += raw[start];
			}
			start++;
		}
		if( txt && txt.length > iLine )
		{
			return txt[iLine];
		}
		return "";
	}

	public static getPathAndPosition(iWord:string): any
	{
		let fileAndLine = {
			file: iWord,
			line: -1,
			column: -1
		};

		const lPos = iWord.lastIndexOf(":");
		if (lPos > -1) {
			let numberAfterLastColon = parseInt(iWord.substring(lPos+1));	// use original parseInt, may not accurate and thus only limit start with number after colon
			if( isNaN(numberAfterLastColon) ) {
				fileAndLine.file = (iWord.length === lPos+1 ? iWord.substring(0,lPos) : iWord);
				fileAndLine.line = fileAndLine.column = -1;
			} else {
				let b4Num = lPos - 1;
				while (b4Num > 0 && iWord[b4Num] >= '0' && iWord[b4Num] <= '9'){
					--b4Num;
				}
				let fileEnd;
				if (b4Num < lPos - 1 && iWord[b4Num] === ':') {	// i.e. :<integer> before this colon
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
	public static getWordBetweenBounds(iText: string, iPos:vscode.Position, iBounds?:RegExp): string
	{
		let bounds: RegExp = ConfigHandler.Instance.Configuration.Bound;
		if( iText === undefined || iText === "" ){
			return "";
		}
		if( iBounds !== undefined ){
			bounds = iBounds;
		}
		let end = iText.length;
		let i = iPos.character;
		let j = iPos.character;
		if( end < i ){
			return "";
		}

		i--;	// Fix: allow cursor touching the right-edge of the target path to work properly
		for(; i>=0; i--)
		{
			let t = iText[i];
			if( t.match(bounds) !== null )
			{
				break;
			}
		}
		i++;
		for(; j<end; j++)
		{
			let t = iText[j];
			if( t.match(bounds) !== null ){
				break;
			}
			if (t === ':') {
				let lineColMatches = iText.substring(i,j).match(/:\d+(:\d+)?$/);
				if (lineColMatches) {	// if the string before this ':' is already ":<number>[:<column>]", gonna stops, to remove any grep output like ":<matching-line>" at j
					if (lineColMatches[1] === undefined) {	// doesn't have column number before yet, so read any valid ":<column>" pattern at this colon
						let iSkipNum = j + 1;
						while (iSkipNum < end && iText[iSkipNum] >= '0' && iText[iSkipNum] <= '9'){
							iSkipNum++;
						}
						if (iSkipNum > j + 1) {		// i.e. is ":<number>" at j
							if (iSkipNum === end || iText[iSkipNum] === ':' || iText[iSkipNum].match(bounds) !== null) {	// at j, accept the column number if it's either :col or :col:... or :col<path-delimiter>
								j = iSkipNum;
							}
						}
					}
					break;
				}
			}
		}
		return iText.substring(i,j);

	}

	public static getWordOfSelection(iText: string, iSelection:vscode.Selection): string
	{
		let bounds: RegExp = ConfigHandler.Instance.Configuration.Bound;
		if( iText === undefined || iText === "" ){
			return "";
		}
		return iText.substring(iSelection.start.character,iSelection.end.character);

	}

	public static fixedCharCodeAt(str:string, idx:number) {
		// ex. fixedCharCodeAt('\uD800\uDC00', 0); // 65536
		// ex. fixedCharCodeAt('\uD800\uDC00', 1); // false
		idx = idx || 0;
		const code = str.charCodeAt(idx);
		let hi, low;
	
		// High surrogate (could change last hex to 0xDB7F
		// to treat high private surrogates
		// as single characters)
		if (0xD800 <= code && code <= 0xDBFF) {
			hi = code;
			low = str.charCodeAt(idx + 1);
			if (isNaN(low)) {
				throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
			}
			return (
				(hi - 0xD800) * 0x400) +
				(low - 0xDC00) + 0x10000;
		}
		if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
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