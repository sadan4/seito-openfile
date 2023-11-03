import { type Suffix } from "../types/suffix.type";

export class Configuration {
  private m_bound: RegExp;
  private m_extensions: string[];
  private m_extraExtensionsForTypes: Suffix[];
  private m_searchSubFoldersOfWorkspaceFolders: string[];
  private m_searchPaths: string[];
  private m_lookupTildePathAlsoFromWorkspace: boolean;
  private m_leadingPathMapping: Record<string, string>;
  private m_notFoundTriggerQuickOpen: boolean;
  private m_openNewTab: boolean;
  private m_preferOpenFile: boolean;
  private m_defaultLinuxOpenCmd: string;

  public constructor() {
    this.m_bound = /[\s\\"\\'\\>\\<#;]/;
    this.m_extensions = new Array<string>();
    this.m_extraExtensionsForTypes = [];
    this.m_searchSubFoldersOfWorkspaceFolders = new Array<string>();
    this.m_searchPaths = new Array<string>();
    this.m_lookupTildePathAlsoFromWorkspace = true;
    this.m_leadingPathMapping = {};
    this.m_notFoundTriggerQuickOpen = true;
    this.m_openNewTab = false;
    this.m_preferOpenFile = true;
    this.m_defaultLinuxOpenCmd = "xdg-open";
  }

  get Bound(): RegExp {
    return this.m_bound;
  }

  set Bound(iReg: RegExp) {
    if (iReg !== undefined) {
      this.m_bound = iReg;
    }
  }

  // eslint-disable-next-line accessor-pairs
  set BoundFromString(iReg: string) {
    if (iReg !== undefined) {
      this.m_bound = new RegExp(iReg);
    }
  }

  set Extensions(iSufx: string[]) {
    if (iSufx !== undefined) {
      this.m_extensions = iSufx;
    }
  }

  get Extensions(): string[] {
    return this.m_extensions;
  }

  set ExtraExtensionsForTypes(map: object) {
    this.m_extraExtensionsForTypes = map as Suffix[];
  }

  get ExtraExtensionsForTypes(): object {
    return this.m_extraExtensionsForTypes;
  }

  set SearchSubFoldersOfWorkspaceFolders(iPatterns: string[]) {
    if (iPatterns !== undefined) {
      this.m_searchSubFoldersOfWorkspaceFolders = iPatterns;
    }
  }

  get SearchSubFoldersOfWorkspaceFolders(): string[] {
    return this.m_searchSubFoldersOfWorkspaceFolders;
  }

  set SearchPaths(iPaths: string[]) {
    if (iPaths !== undefined) {
      this.m_searchPaths = iPaths;
    }
  }

  get SearchPaths(): string[] {
    return this.m_searchPaths;
  }

  set LookupTildePathAlsoFromWorkspace(yesNo: boolean) {
    if (yesNo !== undefined) {
      this.m_lookupTildePathAlsoFromWorkspace = yesNo;
    }
  }

  get LookupTildePathAlsoFromWorkspace(): boolean {
    return this.m_lookupTildePathAlsoFromWorkspace;
  }

  set LeadingPathMapping(mappings: Record<string, string>) {
    if (mappings !== undefined) {
      this.m_leadingPathMapping = mappings;
    }
  }

  get LeadingPathMapping(): Record<string, string> {
    return this.m_leadingPathMapping;
  }

  set NotFoundTriggerQuickOpen(yesNo: boolean) {
    if (yesNo !== undefined) {
      this.m_notFoundTriggerQuickOpen = yesNo;
    }
  }

  get NotFoundTriggerQuickOpen(): boolean {
    return this.m_notFoundTriggerQuickOpen;
  }

  set OpenNewTab(yesNo: boolean) {
    if (yesNo !== undefined) {
      this.m_openNewTab = yesNo;
    }
  }

  get OpenNewTab(): boolean {
    return this.m_openNewTab;
  }

  set PreferOpenFile(val: boolean) {
    this.m_preferOpenFile = val;
  }

  get PreferOpenFile(): boolean {
    return this.m_preferOpenFile;
  }

  set DefaultLinuxOpenCommand(cmd: string) {
    if (cmd !== undefined && cmd !== "") {
      this.m_defaultLinuxOpenCmd = cmd;
    }
  }

  get DefaultLinuxOpenCommand(): string {
    return this.m_defaultLinuxOpenCmd;
  }
}
