import { Suffix } from "../types/suffix.type";

export class Variables {
  static parse<T>(value: T): T {
    if (value === null || value === "" || typeof value !== "string") {
      return value;
    }

    if (typeof value === "string") {
      const idx = value.indexOf("env:");
      let retVal = value as string;
      if (idx > 0) {
        const matches = value.matchAll(/\$\{env:(\w+)\}/gi);
        for (const subgrp of matches) {
          if (subgrp.length > 0) {
            if (subgrp[1] in process.env) {
              const v = process.env[subgrp[1]];
              if (v !== undefined) {
                retVal = retVal.replace(subgrp[0], v);
              }
            }
          }
        }
      }
      return retVal as T;
    }
    return value;
  }
}

export class ConfigurationProperty<T> {
  private mChanged: boolean;
  private mProp: T;

  constructor(prop: T) {
    this.mChanged = true;
    this.mProp = Variables.parse<T>(prop);
  }

  get Value(): T {
    return this.mProp;
  }

  set Value(value: T) {
    if (this.mProp !== value) {
      this.mProp = Variables.parse<T>(value);
      this.mChanged = true;
    }
  }

  get Changed(): boolean {
    const old = this.mChanged;
    this.mChanged = false;
    return old;
  }

  set Changed(state: boolean) {
    this.mChanged = state;
  }
}

export class Configuration {
  private mBound = new ConfigurationProperty<RegExp>(/[\s\\"\\'\\>\\<#;]/);
  private mExtensions = new ConfigurationProperty<string[]>([]);
  private mExtraExtensionsForTypes = new ConfigurationProperty<Suffix[]>([]);
  private mSearchSubFoldersOfWorkspaceFolders = new ConfigurationProperty<string[]>([]);
  private mSearchPaths = new ConfigurationProperty<string[]>([]);
  private mLookupTildePathAlsoFromWorkspace = new ConfigurationProperty<boolean>(true);
  private mLeadingPathMapping = new ConfigurationProperty<Record<string, string>>({});
  private mNotFoundTriggerQuickOpen = new ConfigurationProperty<boolean>(true);
  private mOpenNewTab = new ConfigurationProperty<boolean>(false);
  private mPreferOpenFile = new ConfigurationProperty<boolean>(true);
  private mDefaultLinuxOpenCmd = new ConfigurationProperty<string>("xdg-open");

  get Bound(): ConfigurationProperty<RegExp> {
    return this.mBound;
  }

  get Extensions(): ConfigurationProperty<string[]> {
    return this.mExtensions;
  }

  get ExtraExtensionsForTypes(): ConfigurationProperty<Suffix[]> {
    return this.mExtraExtensionsForTypes;
  }

  get SearchSubFoldersOfWorkspaceFolders(): ConfigurationProperty<string[]> {
    return this.mSearchSubFoldersOfWorkspaceFolders;
  }

  get SearchPaths(): ConfigurationProperty<string[]> {
    return this.mSearchPaths;
  }

  get LookupTildePathAlsoFromWorkspace(): ConfigurationProperty<boolean> {
    return this.mLookupTildePathAlsoFromWorkspace;
  }

  get LeadingPathMapping(): ConfigurationProperty<Record<string, string>> {
    return this.mLeadingPathMapping;
  }

  get NotFoundTriggerQuickOpen(): ConfigurationProperty<boolean> {
    return this.mNotFoundTriggerQuickOpen;
  }

  get OpenNewTab(): ConfigurationProperty<boolean> {
    return this.mOpenNewTab;
  }

  get PreferOpenFile(): ConfigurationProperty<boolean> {
    return this.mPreferOpenFile;
  }

  get DefaultLinuxOpenCmd(): ConfigurationProperty<string> {
    return this.mDefaultLinuxOpenCmd;
  }
}
