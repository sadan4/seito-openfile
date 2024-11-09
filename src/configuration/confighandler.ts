import { Event, EventEmitter, workspace, WorkspaceConfiguration } from "vscode";
import { Configuration, ConfigurationProperty } from "./configuration";
import { Suffix } from "../types/suffix.type";
import { IDisposable } from "../model";

export class ConfigHandler implements IDisposable {
  private mConfigChanged = new EventEmitter<string[]>();
  private mConfiguration = new Configuration();
  private mChangeIdents: string[] = [];
  private mDisposables: IDisposable[] = [];

  constructor() {
    this.mDisposables.push(workspace.onDidChangeConfiguration(() => this.handleChangedConfig()));
    this.handleChangedConfig();
  }

  dispose(): void {
    this.mDisposables.forEach((d) => d.dispose());
  }

  get OnDidChangeConfiguration(): Event<string[]> {
    return this.mConfigChanged.event;
  }

  get Configuration(): Configuration {
    return this.mConfiguration;
  }

  private loadConfig(): boolean {
    const config = workspace.getConfiguration("seito-openfile");
    if (config) {
      this.mChangeIdents = [];
      this.setChangeConfigDate<RegExp>(config, "wordbound", this.mConfiguration.Bound);
      this.setChangeConfigDate<string[]>(config, "extensions", this.mConfiguration.Extensions);
      this.setChangeConfigDate<Suffix[]>(
        config,
        "extraExtensionsForTypes",
        this.mConfiguration.ExtraExtensionsForTypes
      );
      this.setChangeConfigDate<string[]>(
        config,
        "searchSubFoldersOfWorkspaceFolders",
        this.mConfiguration.SearchSubFoldersOfWorkspaceFolders
      );
      this.setChangeConfigDate<string[]>(config, "searchPaths", this.mConfiguration.SearchPaths);
      this.setChangeConfigDate<boolean>(
        config,
        "lookupTildePathAlsoFromWorkspace",
        this.mConfiguration.LookupTildePathAlsoFromWorkspace
      );
      this.setChangeConfigDate<Record<string, string>>(
        config,
        "leadingPathMapping",
        this.mConfiguration.LeadingPathMapping
      );
      this.setChangeConfigDate<boolean>(
        config,
        "notFoundTriggerQuickOpen",
        this.mConfiguration.NotFoundTriggerQuickOpen
      );
      this.setChangeConfigDate<boolean>(config, "openNewTab", this.mConfiguration.OpenNewTab);
      this.setChangeConfigDate<boolean>(config, "preferOpenFile", this.mConfiguration.PreferOpenFile);
      this.setChangeConfigDate<string>(config, "defaultLinuxOpenCommand", this.mConfiguration.DefaultLinuxOpenCmd);
      return true;
    }
    return false;
  }

  private handleChangedConfig(): void {
    if (this.loadConfig()) {
      this.mConfigChanged.fire(this.mChangeIdents);
    }
  }

  private setChangeConfigDate<T>(
    config: WorkspaceConfiguration,
    descriptor: string,
    configValue: ConfigurationProperty<T>
  ): boolean {
    if (config.has(descriptor)) {
      configValue.Value = config.get(descriptor) as T;
      if (configValue.Changed) {
        configValue.Changed = true;
        this.mChangeIdents.push(descriptor);
        return true;
      }
    }
    return false;
  }
}
