'use strict';

import * as vscode from 'vscode';
import {Configuration} from './configuration';


export class ConfigHandler
{
	private static m_instance: ConfigHandler;
	private m_configuration: Configuration;

	public constructor()
	{
		this.m_configuration = new Configuration();
		this.onConfigChanged();
		vscode.workspace.onDidChangeConfiguration(this.onConfigChanged, this);
	}

	static get Instance(): ConfigHandler
	{
		return this.m_instance || (this.m_instance = new this());
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
			if( config.has("suffixes") === true )
			{
				this.m_configuration.Suffixes = config.get("suffixes") as string[];
			}
		}
	}
}