import type { LoadableManifest } from './webpack';
export declare const getBundles: ({ publicPath: defaultPublicPath, originToChunkGroups, chunkGroupAssets, preloadAssets, prefetchAssets, runtimeAssets, entryToId, }: LoadableManifest, moduleIds: string[], { entries, includeSourceMap, includeHotUpdate, publicPath, preserveEntriesOrder }?: {
    publicPath?: string;
    entries?: string[];
    includeHotUpdate?: boolean;
    includeSourceMap?: boolean;
    preserveEntriesOrder?: boolean;
}) => {
    assets: string[];
    preload: string[];
    prefetch: string[];
};
