"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactLoadablePlugin = void 0;
const node_path_1 = __importDefault(require("node:path"));
const webpack_1 = __importDefault(require("webpack"));
// type Entrypoint = Parameters<typeof ChunkGraph.prototype.connectChunkAndEntryModule>[2]
const isOriginDynamicImported = (origin, _chunkGroup) => {
    // check if origin is imported via import()
    // for (const chunk of chunkGroup.chunks)
    // 	for (const md of chunk.getModules())
    // 		for (const {type, userRequest} of md.reasons)
    // 			if (userRequest === origin.request && type === 'import()') return true
    // return false
    return !!origin.request;
};
const getAssetsOfChunkGroups = (chunkGroups) => {
    if (!chunkGroups)
        return;
    const assets = new Set();
    for (const chunkGroup of chunkGroups)
        for (const asset of chunkGroup.getFiles())
            assets.add(asset);
    return [...assets.values()];
};
const buildManifest = (compilation, { moduleNameTransform, absPath, }) => {
    const entryToId = {};
    const runtimeAssets = {};
    const includedChunkGroups = new Set();
    // always add entries
    for (const chunkGroup of compilation.chunkGroups)
        if (chunkGroup.isInitial()) {
            entryToId[chunkGroup.name] = chunkGroup.id;
            includedChunkGroups.add(chunkGroup.id);
            runtimeAssets[chunkGroup.id] = [...chunkGroup.getRuntimeChunk().files.values()];
        }
    // get map of origin to chunk groups
    const originToChunkGroups = {};
    for (const chunkGroup of compilation.chunkGroups)
        for (const origin of chunkGroup.origins)
            if (isOriginDynamicImported(origin, chunkGroup)) {
                includedChunkGroups.add(chunkGroup.id);
                const absModuleName = absPath && origin.request?.startsWith('./') && origin.module?.context
                    ? node_path_1.default.resolve(origin.module.context, origin.request)
                    : origin.request;
                const moduleName = moduleNameTransform ? moduleNameTransform(absModuleName) : absModuleName;
                if (!originToChunkGroups[moduleName])
                    originToChunkGroups[moduleName] = [];
                if (!originToChunkGroups[moduleName].includes(chunkGroup.id))
                    originToChunkGroups[moduleName].push(chunkGroup.id);
            }
    const chunkGroupAssets = {};
    const preloadAssets = {};
    const prefetchAssets = {};
    const chunkGroupSizes = {};
    for (const chunkGroup of compilation.chunkGroups)
        if (includedChunkGroups.has(chunkGroup.id)) {
            //get map of chunk group to assets
            chunkGroupAssets[chunkGroup.id] = chunkGroup.getFiles();
            //get chunk group size
            let size = 0;
            for (const chunk of chunkGroup.chunks)
                size += compilation.chunkGraph
                    ? compilation.chunkGraph.getChunkSize(chunk)
                    : chunk.size();
            chunkGroupSizes[chunkGroup.id] = size;
            //child assets
            const { prefetch, preload } = chunkGroup.getChildrenByOrders(compilation.moduleGraph, compilation.chunkGraph);
            preloadAssets[chunkGroup.id] = getAssetsOfChunkGroups(preload);
            prefetchAssets[chunkGroup.id] = getAssetsOfChunkGroups(prefetch);
        }
    //sort for the greedy cover set algorithm
    for (const chunkGroups of Object.values(originToChunkGroups))
        chunkGroups.sort((cg1, cg2) => chunkGroupSizes[cg1] - chunkGroupSizes[cg2]);
    return {
        publicPath: compilation.outputOptions.publicPath,
        originToChunkGroups,
        chunkGroupAssets,
        preloadAssets,
        prefetchAssets,
        runtimeAssets,
        entryToId,
    };
};
const pluginName = '@react-loadable/revised';
class ReactLoadablePlugin {
    options;
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        const emit = async (compilation) => {
            try {
                const manifest = buildManifest(compilation, {
                    moduleNameTransform: this.options.moduleNameTransform,
                    absPath: this.options.absPath,
                });
                await this.options.callback(manifest);
            }
            catch (e) {
                compilation.errors.push(e);
            }
        };
        if (compiler.hooks) {
            if (webpack_1.default.version.slice(0, 2) === '4.')
                compiler.hooks.emit.tap(pluginName, emit);
            // hooks.thisCompilation is recommended over hooks.compilation
            // https://github.com/webpack/webpack/issues/11425#issuecomment-690547848
            else
                compiler.hooks.thisCompilation.tap(pluginName, compilation => {
                    compilation.hooks.processAssets.tap({
                        name: pluginName,
                        stage: webpack_1.default.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                    }, () => emit(compilation));
                });
            compiler.hooks.emit.tap(pluginName, emit);
        }
        else
            compiler.plugin('emit', emit);
    }
}
exports.ReactLoadablePlugin = ReactLoadablePlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnBhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMERBQTRCO0FBRTVCLHNEQUE2QjtBQUc3QiwwRkFBMEY7QUFFMUYsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLE1BQXlCLEVBQUUsV0FBdUIsRUFBRSxFQUFFO0lBQ3RGLDJDQUEyQztJQUMzQyx5Q0FBeUM7SUFDekMsd0NBQXdDO0lBQ3hDLGtEQUFrRDtJQUNsRCw0RUFBNEU7SUFDNUUsZUFBZTtJQUNmLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUE7QUFDeEIsQ0FBQyxDQUFBO0FBV0QsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFdBQTBCLEVBQUUsRUFBRTtJQUM3RCxJQUFJLENBQUMsV0FBVztRQUFFLE9BQU07SUFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQTtJQUNoQyxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVc7UUFDbkMsS0FBSyxNQUFNLEtBQUssSUFBSyxVQUFrQixDQUFDLFFBQVEsRUFBRTtZQUNqRCxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ25CLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0FBQzVCLENBQUMsQ0FBQTtBQUNELE1BQU0sYUFBYSxHQUFHLENBQ3JCLFdBQXdCLEVBQ3hCLEVBQ0MsbUJBQW1CLEVBQ25CLE9BQU8sR0FJUCxFQUNtQixFQUFFO0lBQ3RCLE1BQU0sU0FBUyxHQUEyQixFQUFFLENBQUE7SUFDNUMsTUFBTSxhQUFhLEdBQTZCLEVBQUUsQ0FBQTtJQUNsRCxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUE7SUFDN0MscUJBQXFCO0lBQ3JCLEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxDQUFDLFdBQVc7UUFDL0MsSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFLEVB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