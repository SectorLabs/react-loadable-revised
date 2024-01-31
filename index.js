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
const CaptureContext = (0, react_1.createContext)({ report: () => null });
CaptureContext.displayName = 'Capture';
function Capture({ report, renderPreamble, children }) {
    return react_1.default.createElement(CaptureContext.Provider, { value: { report, renderPreamble } }, children);
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
const resolve = (obj) => obj.__esModule ? obj.default : obj;
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
        const { report, renderPreamble } = (0, react_1.useContext)(CaptureContext) || {};
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
            :
                react_1.default.createElement(react_1.default.Fragment, null,
                    renderPreamble && renderPreamble(),
                    render(state.loaded, props));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FXYztBQU1kLE1BQU0sZ0JBQWdCLEdBQTJCLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLGtCQUFrQixHQUFtQyxFQUFFLENBQUE7QUFDN0QsTUFBTSxjQUFjLEdBQUcsSUFBQSxxQkFBYSxFQUFpSCxFQUFDLE1BQU0sRUFBRSxHQUFFLEVBQUUsQ0FBQSxJQUFJLEVBQUMsQ0FBQyxDQUFBO0FBQ3hLLGNBQWMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFBO0FBRXRDLFNBQWdCLE9BQU8sQ0FBQyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUl4RDtJQUNBLE9BQU8sOEJBQUMsY0FBYyxDQUFDLFFBQVEsSUFBQyxLQUFLLEVBQUUsRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFDLElBQzdELFFBQVEsQ0FDZ0IsQ0FBQTtBQUMzQixDQUFDO0FBUkQsMEJBUUM7QUFFRCxPQUFPLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQTtBQW9CL0IsTUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUE0QixFQUFFLEVBQUUsQ0FBQyxPQUFPLG1CQUFtQixLQUFLLFFBQVE7T0FDNUYsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxRQUFRLEtBQUssV0FBVyxJQUFJLE9BQU8sbUJBQW1CLENBQUMsUUFBUSxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUE7QUFRN0gsTUFBTSxJQUFJLEdBQUcsQ0FBTyxNQUF3QixFQUFFLEVBQUU7SUFDL0MsTUFBTSxLQUFLLEdBQUc7UUFDYixNQUFNLEVBQUUsU0FBUztRQUNqQixLQUFLLEVBQUUsU0FBUztLQUNHLENBQUE7SUFDcEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBMEIsS0FBSyxFQUFFLE9BQU8sRUFBRSxN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