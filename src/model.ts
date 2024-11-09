export interface IDisposable {
  dispose(): void;
}

export function dispose<T extends IDisposable>(disposables: T[]): T[] {
  disposables.forEach((d) => d.dispose());
  return [];
}
