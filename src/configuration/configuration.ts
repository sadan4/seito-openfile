'use strict';

import * as vscode from 'vscode';

export class Configuration
{
	private m_bound: RegExp;
	private m_extensions: Array<string>;
	private m_extraExtensionsForTypes: object;
	private m_searchSubFoldersOfWorkspaceFolders: Array<string>;
	private m_searchPaths: Array<string>;
	private m_lookupTildePathAlsoFromWorkspace: boolean;
	private m_leadingPathMapping: { [ leadingPath : string ] : string };
	private m_notFoundTriggerQuickOpen: boolean;

	public constructor()
	{
		this.m_bound = new RegExp("[\\s\\\"\\\'\\>\\<#;]");
		this.m_extensions = new Array<string>();
		this.m_extraExtensionsForTypes = {};
		this.m_searchSubFoldersOfWorkspaceFolders = new Array<string>();
		this.m_searchPaths = new Array<string>();
		this.m_lookupTildePathAlsoFromWorkspace = true;
		this.m_leadingPathMapping = {};
		this.m_notFoundTriggerQuickOpen = true;
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

	set SearchSubFoldersOfWorkspaceFolders(iPatterns: Array<string>)
	{
		if( iPatterns !== undefined )
		{
			this.m_searchSubFoldersOfWorkspaceFolders = iPatterns;
		}
	}

	get SearchSubFoldersOfWorkspaceFolders(): Array<string>
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

	set LookupTildePathAlsoFromWorkspace(yesNo: boolean)
	{
		if ( yesNo !== undefined)
			this.m_lookupTildePathAlsoFromWorkspace = yesNo;
	}

	get LookupTildePathAlsoFromWorkspace(): boolean
	{
		return this.m_lookupTildePathAlsoFromWorkspace;
	}

	set LeadingPathMapping(mappings: { [ leadingPath : string ] : string })
	{
		if ( mappings !== undefined)
			this.m_leadingPathMapping = mappings;
	}

	get LeadingPathMapping(): { [ leadingPath : string ] : string }
	{
		return this.m_leadingPathMapping;
	}

	set NotFoundTriggerQuickOpen(yesNo: boolean)
	{
		if ( yesNo !== undefined)
			this.m_notFoundTriggerQuickOpen = yesNo;
	}

	get NotFoundTriggerQuickOpen(): boolean
	{
		return this.m_notFoundTriggerQuickOpen;
	}
}