"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadReady = exports.preloadAll = exports.Capture = void 0;
const react_1 = __importStar(require("react"));
const ALL_INITIALIZERS = [];
const READY_INITIALIZERS = [];
const CaptureContext = (0, react_1.createContext)(undefined);
CaptureContext.displayName = 'Capture';
function Capture({ report, children }) {
    return react_1.default.createElement(CaptureContext.Provider, { value: report }, children);
}
exports.Capture = Capture;
Capture.displayName = 'Capture';
const isWebpackReady = (getModuleIds) => typeof __webpack_modules__ === 'object'
    && getModuleIds().every(moduleId => typeof moduleId !== 'undefined' && typeof __webpack_modules__[moduleId] !== 'undefined');
const load = (loader) => {
    const state = {
        loaded: undefined,
        error: undefined,
    };
    state.promise = new Promise(async (resolve, reject) => {
        try {
            resolve(state.loaded = await loader());
        }
        catch (e) {
            reject(state.error = e);
        }
    });
    return state;
};
const resolve = (obj) => obj?.__esModule ? obj.default : obj;
const defaultRenderer = (loaded, props) => {
    const Loaded = resolve(loaded);
    return react_1.default.createElement(Loaded, { ...props });
};
function createLoadableComponent({ loading: Loading, loader, webpack, render = defaultRenderer, ...opts }) {
    if (!Loading)
        throw new Error('react-loadable requires a `loading` component');
    let loadState;
    const init = () => {
        if (!loadState)
            loadState = load(loader);
        return loadState.promise;
    };
    ALL_INITIALIZERS.push(init);
    if (typeof webpack === 'function')
        READY_INITIALIZERS.push(() => {
            if (isWebpackReady(webpack))
                return init();
        });
    const LoadableComponent = (props) => {
        init();
        const report = (0, react_1.useContext)(CaptureContext);
        const [state, setState] = (0, react_1.useState)({
            error: loadState.error,
            loaded: loadState.loaded
        });
        const mountedRef = (0, react_1.useRef)(false);
        const pendingStateRef = (0, react_1.useRef)();
        (0, react_1.useEffect)(() => {
            mountedRef.current = true;
            if (pendingStateRef.current) {
                setState(pendingStateRef.current);
                pendingStateRef.current = undefined;
            }
            return () => void (mountedRef.current = false);
        }, []);
        const loadModule = (0, react_1.useCallback)(async () => {
            const modules = opts['modules'];
            const webpackChunkNames = opts['webpackChunkNames'];
            if (report && Array.isArray(modules))
                for (const index in modules)
                    report(modules[index], (webpackChunkNames || [])[index]);
            if (loadState.error || loadState.loaded)
                return;
            try {
                await loadState.promise;
            }
            catch {
            }
            finally {
                const newState = {
                    error: loadState.error,
                    loaded: loadState.loaded,
                };
                if (mountedRef.current)
                    setState(newState);
                else
                    pendingStateRef.current = newState;
            }
        }, [report, mountedRef]);
        const retry = (0, react_1.useCallback)(async () => {
            if (!mountedRef.current)
                return;
            setState({ error: undefined, loaded: undefined });
            loadState = load(loader);
            await loadModule();
        }, [loadModule]);
        const firstStateRef = (0, react_1.useRef)(state);
        if (firstStateRef.current) {
            loadModule();
            firstStateRef.current = undefined;
        }
        return !state.loaded || state.error
            ? react_1.default.createElement(Loading, { error: state.error, retry: retry })
            : render(state.loaded, props);
    };
    LoadableComponent.preload = (forceReload) => {
        if (!loadState || (loadState.error && forceReload))
            loadState = load(loader);
        return loadState.promise;
    };
    LoadableComponent.displayName = `LoadableComponent(${Array.isArray(opts['modules']) ? opts['modules'].join('-') : ''})`;
    return LoadableComponent;
}
const flushInitializers = async (initializers) => {
    const promises = [];
    while (initializers.length)
        promises.push(initializers.pop()());
    await Promise.all(promises);
    if (initializers.length)
        return flushInitializers(initializers);
};
const preloadAll = () => flushInitializers(ALL_INITIALIZERS);
exports.preloadAll = preloadAll;
const preloadReady = () => flushInitializers(READY_INITIALIZERS);
exports.preloadReady = preloadReady;
const loadable = (opts) => createLoadableComponent(opts);
exports.default = loadable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FXYztBQUtkLE1BQU0sZ0JBQWdCLEdBQTJCLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLGtCQUFrQixHQUFtQyxFQUFFLENBQUE7QUFDN0QsTUFBTSxjQUFjLEdBQUcsSUFBQSxxQkFBYSxFQUFxRSxTQUFTLENBQUMsQ0FBQTtBQUNuSCxjQUFjLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQTtBQUV0QyxTQUFnQixPQUFPLENBQUMsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUd4QztJQUNBLE9BQU8sOEJBQUMsY0FBYyxDQUFDLFFBQVEsSUFBQyxLQUFLLEVBQUUsTUFBTSxJQUMzQyxRQUFRLENBQ2dCLENBQUE7QUFDM0IsQ0FBQztBQVBELDBCQU9DO0FBRUQsT0FBTyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUE7QUFrQi9CLE1BQU0sY0FBYyxHQUFHLENBQUMsWUFBNEIsRUFBRSxFQUFFLENBQUMsT0FBTyxtQkFBbUIsS0FBSyxRQUFRO09BQzVGLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sUUFBUSxLQUFLLFdBQVcsSUFBSSxPQUFPLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFBO0FBUTdILE1BQU0sSUFBSSxHQUFHLENBQU8sTUFBd0IsRUFBRSxFQUFFO0lBQy9DLE1BQU0sS0FBSyxHQUFHO1FBQ2IsTUFBTSxFQUFFLFNBQVM7UUFDakIsS0FBSyxFQUFFLFNBQVM7S0FDRyxDQUFBO0lBQ3BCLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQTBCLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDOUUsSUFBSTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0s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