"use strict";

import * as vscode from "vscode";
import { Configuration } from "./configuration";

export class ConfigHandler {
  private static m_instance: ConfigHandler;
  private readonly m_configuration: Configuration;

  public constructor(shouldFollowVsCodeSettings: boolean = true) {
    this.m_configuration = new Configuration();
    if (shouldFollowVsCodeSettings) {
      this.onConfigChanged();
      vscode.workspace.onDidChangeConfiguration(this.onConfigChanged, this);
    }
  }

  // for unit test not to be affected by current user's settings
  static preInitInstanceNotFollowingVsCodeSettings(): void {
    // if (this.m_instance)
    // 	return;
    this.m_instance = new this(false);
  }

  static get Instance(): ConfigHandler {
    return this.m_instance ?? (this.m_instance = new this());
  }

  get Configuration(): Configuration {
    return this.m_configuration;
  }

  private onConfigChanged(): void {
    const config = vscode.workspace.getConfiguration("seito-openfile");
    if (config !== undefined) {
      if (config.has("wordbound")) {
        const r = new RegExp(config.get("wordbound") as string);
        this.m_configuration.Bound = r;
      }
      if (config.has("extensions")) {
        this.m_configuration.Extensions = config.get("extensions") as string[];
      }
      if (config.has("extraExtensionsForTypes")) {
        this.m_configuration.ExtraExtensionsForTypes = config.get(
          "extraExtensionsForTypes"
        ) as object;
      }
      if (config.has("searchSubFoldersOfWorkspaceFolders")) {
        this.m_configuration.SearchSubFoldersOfWorkspaceFolders = config.get(
          "searchSubFoldersOfWorkspaceFolders"
        ) as string[];
      }
      if (config.has("searchPaths")) {
        this.m_configuration.SearchPaths = config.get(
          "searchPaths"
        ) as string[];
      }
      if (config.has("lookupTildePathAlsoFromWorkspace")) {
        this.m_configuration.LookupTildePathAlsoFromWorkspace = config.get(
          "lookupTildePathAlsoFromWorkspace"
        ) as boolean;
      }
      if (config.has("leadingPathMapping")) {
        this.m_configuration.LeadingPathMapping = config.get(
          "leadingPathMapping"
        ) as Record<string,string>;
      }
      if (config.has("notFoundTriggerQuickOpen")) {
        this.m_configuration.NotFoundTriggerQuickOpen = config.get(
          "notFoundTriggerQuickOpen"
        ) as boolean;
      }
      if (config.has("openNewTab")) {
        this.m_configuration.OpenNewTab = config.get("openNewTab") as boolean;
      }
      if (config.has("preferOpenFile")) {
        this.m_configuration.PreferOpenFile = config.get("preferOpenFile") as boolean;
      }
      if (config.has("defaultLinuxOpenCommand")) {
        this.m_configuration.DefaultLinuxOpenCommand = config.get(
          "defaultLinuxOpenCommand"
        ) as string;
      }
    }
  }
}
