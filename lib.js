"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBundles = void 0;
const getBundles = ({ publicPath: defaultPublicPath, originToChunkGroups, chunkGroupAssets, preloadAssets, prefetchAssets, runtimeAssets, entryToId, }, moduleIds, { entries, includeSourceMap, includeHotUpdate, publicPath, preserveEntriesOrder } = {}) => {
    if (typeof publicPath !== 'string')
        publicPath = defaultPublicPath || '';
    const assetFilter = (file) => {
        const fileWithoutQuery = file.split('?')[0];
        return (includeHotUpdate || !/\.hot-update\.js$/.test(fileWithoutQuery))
            && (fileWithoutQuery.endsWith('.js')
                || fileWithoutQuery.endsWith('.css')
                || (includeSourceMap && fileWithoutQuery.endsWith('.map')));
    };
    if (!entries)
        entries = ['main'];
    for (const entry of entries)
        if (!entryToId[entry])
            console.warn(`Cannot find chunk group id for entry ${entry}`);
    entries = entries.map(entry => entryToId[entry]);
    const chunkGroups = new Set();
    const assets = new Set();
    const preload = new Set();
    const prefetch = new Set();
    const addChunkGroup = (chunkGroup) => {
        if (chunkGroups.has(chunkGroup))
            return;
        chunkGroups.add(chunkGroup);
        if (!chunkGroupAssets[chunkGroup]) {
            console.warn(`Cannot find chunk group ${chunkGroup}`);
            return;
        }
        for (const asset of (chunkGroupAssets[chunkGroup] || []).filter(assetFilter))
            assets.add(asset);
        for (const asset of (preloadAssets[chunkGroup] || []).filter(assetFilter))
            preload.add(asset);
        for (const asset of (prefetchAssets[chunkGroup] || []).filter(assetFilter))
            prefetch.add(asset);
    };
    for (const entry of entries)
        addChunkGroup(entry);
    for (const moduleId of moduleIds) {
        const includingChunkGroups = originToChunkGroups[moduleId];
        if (!includingChunkGroups) {
            console.warn(`Can not determine chunk group for module id ${moduleId}`);
            continue;
        }
        if (includingChunkGroups.some(chunkGroup => chunkGroups.has(chunkGroup)))
            continue;
        addChunkGroup(includingChunkGroups[0]);
    }
    const getOrder = (asset) => {
        if (!asset.endsWith('.js'))
            return 0;
        for (const entry of entries)
            if (runtimeAssets[entry]?.includes(asset))
                return -1;
        for (const entry of entries)
            if (chunkGroupAssets[entry]?.includes(asset))
                return 1;
        return 0;
    };
    const assetToArray = (assets) => (values => preserveEntriesOrder
        ? values
        : values.map((asset, index) => [asset, index])
            .sort(([as1, index1], [as2, index2]) => getOrder(as1) - getOrder(as2) || index1 - index2)
            .map(([asset]) => asset))([...assets.values()])
        .map(file => `${publicPath}${file}`);
    return {
        assets: assetToArray(assets),
        preload: assetToArray(preload),
        prefetch: assetToArray(prefetch),
    };
};
exports.getBundles = getBundles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVPLE1BQU0sVUFBVSxHQUFHLENBQ3pCLEVBQ0MsVUFBVSxFQUFFLGlCQUFpQixFQUM3QixtQkFBbUIsRUFDbkIsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixjQUFjLEVBQ2QsYUFBYSxFQUNiLFNBQVMsR0FDUyxFQUNuQixTQUFtQixFQUNuQixFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEtBTTFFLEVBQUUsRUFDTCxFQUFFO0lBQ0gsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRO1FBQUUsVUFBVSxHQUFHLGlCQUFpQixJQUFJLEVBQUUsQ0FBQTtJQUN4RSxNQUFNLFdBQVcsR0FBRyxDQUNuQixJQUFZLEVBQ1gsRUFBRTtRQUNILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQyxPQUFPLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztlQUNwRSxDQUNGLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7bUJBQzdCLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7bUJBQ2pDLENBQUMsZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQzFELENBQUE7SUFDSCxDQUFDLENBQUE7SUFDRCxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2hDLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTztRQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLEtBQUssRUFBRSxDQUFDLENB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