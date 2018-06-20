'use strict';

import * as vscode from 'vscode';

export class Configuration
{
	private m_bound: RegExp;
	private m_extensions: Array<string>;

	public constructor()
	{
		this.m_bound = new RegExp("[\\s\\\"\\\'\\>\\<#]");
		this.m_extensions = new Array<string>();
	}

	get Bound(): RegExp
	{
		return this.m_bound;
	}

	set Bound(iReg: RegExp)
	{
		if( iReg !== undefined )
		{
			this.m_bound = iReg;
		}
	}

	set BoundFromString(iReg: string)
	{
		if( iReg !== undefined )
		{
			this.m_bound = new RegExp(iReg);
		}
	}

	set Extensions(iSufx: Array<string>)
	{
		if( iSufx !== undefined )
		{
			this.m_extensions = iSufx;
		}
	}

	get Extensions(): Array<string>
	{
		return this.m_extensions;
	}
}