'use strict';

import * as vscode from 'vscode';
import {Configuration} from './configuration';


export class ConfigHandler
{
	private m_configuration: Configuration;

	public constructor()
	{
		this.m_configuration = new Configuration();
		this.onConfigChanged();
		vscode.workspace.onDidChangeConfiguration(this.onConfigChanged, this);
	}

	get Configuration(): Configuration
	{
		return this.m_configuration;
	}

	private onConfigChanged()
	{
		let config = vscode.workspace.getConfiguration("seito-openfile");
		if( config !== undefined )
		{
			if( config.has("wordbound") === true )
			{
				let r = new RegExp(config.get("wordbound") as string);
				this.m_configuration.Bound = r;
			}
		}
	}
}