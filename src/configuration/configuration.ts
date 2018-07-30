'use strict';

import * as vscode from 'vscode';

export class Configuration
{
	private m_bound: RegExp;
	private m_extensions: Array<string>;
	private m_extraExtensionsForTypes: object;
	private m_searchSubFoldersOfWorkspaceFolders: string;
	private m_searchPaths: Array<string>;

	public constructor()
	{
		this.m_bound = new RegExp("[\\s\\\"\\\'\\>\\<#]");
		this.m_extensions = new Array<string>();
		this.m_extraExtensionsForTypes = {};
		this.m_searchSubFoldersOfWorkspaceFolders = '';
		this.m_searchPaths = new Array<string>();
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

	set ExtraExtensionsForTypes(map: object)
	{
		if( map !== undefined )
		{
			this.m_extraExtensionsForTypes = map;
		}
	}

	get ExtraExtensionsForTypes(): object
	{
		return this.m_extraExtensionsForTypes;
	}

	set SearchSubFoldersOfWorkspaceFolders(iPattern: string)
	{
		if( iPattern !== undefined )
		{
			this.m_searchSubFoldersOfWorkspaceFolders = iPattern;
		}
	}

	get SearchSubFoldersOfWorkspaceFolders(): string
	{
		return this.m_searchSubFoldersOfWorkspaceFolders;
	}

	set SearchPaths(iPaths: Array<string>)
	{
		if( iPaths !== undefined )
		{
			this.m_searchPaths = iPaths;
		}
	}

	get SearchPaths(): Array<string>
	{
		return this.m_searchPaths;
	}
}