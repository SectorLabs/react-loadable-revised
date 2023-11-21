import type { Compiler } from 'webpack';
export interface LoadableManifest {
    publicPath?: string;
    originToChunkGroups: Record<string, string[]>;
    chunkGroupAssets: Record<string, string[]>;
    preloadAssets: Record<string, string[] | undefined>;
    prefetchAssets: Record<string, string[] | undefined>;
    runtimeAssets: Record<string, string[] | undefined>;
    entryToId: Record<string, string>;
}
export declare class ReactLoadablePlugin {
    private options;
    constructor(options: {
        callback(manifest: LoadableManifest): any;
        moduleNameTransform?(moduleName: string): string;
        absPath?: boolean;
    });
    apply(compiler: Compiler): void;
}
