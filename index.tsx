import React, {
	ComponentProps,
	ComponentType,
	createContext,
	ReactElement,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState
} from 'react'

type LoaderType<T, P> = () => Promise<LoadableComponent<T, P>>
type PreloadLoaderType<T, P> = (force?: boolean) => Promise<LoadableComponent<T, P>>
type LoaderTypeOptional<T, P> = () => Promise<LoadableComponent<T, P>> | undefined

const ALL_INITIALIZERS: LoaderType<any, any>[] = []
const READY_INITIALIZERS: LoaderTypeOptional<any, any>[] = []
const CaptureContext = createContext<((moduleId: string, webpackChunkName?: string) => any) | undefined>(undefined)
CaptureContext.displayName = 'Capture'

export function Capture({report, children}: {
	report(moduleId: string, webpackChunkName?: string): any
	children: ReactNode
}) {
	return <CaptureContext.Provider value={report}>
		{children}
	</CaptureContext.Provider>
}

Capture.displayName = 'Capture'

type LoadableOptions<T, P> = {
	loading: ComponentType<{
		error?: Error
		retry(): any
	}>
	webpack?(): string[]
	loader(): Promise<T>
	render?(loaded: T, props: P): ReactElement,
    modules?: string[],
    webpackChunkNames?: string[],
}

type LoadableComponent<T, P> = ComponentType<T extends {default: ComponentType<infer Props>}
	? Props
	: P // this conditional branch is not 100% correct. It should be never if render property is not provided
	>

declare const __webpack_modules__: any
const isWebpackReady = (getModuleIds: () => string[]) => typeof __webpack_modules__ === 'object'
	&& getModuleIds().every(moduleId => typeof moduleId !== 'undefined' && typeof __webpack_modules__[moduleId] !== 'undefined')

interface LoadState<T, P> {
	promise: Promise<LoadableComponent<T, P>>
	loaded?: LoadableComponent<T, P>
	error?: Error
}

const load = <T, P>(loader: LoaderType<T, P>) => {
	const state = {
		loaded: undefined,
		error: undefined,
	} as LoadState<T, P>
	state.promise = new Promise<LoadableComponent<T, P>>(async (resolve, reject) => {
		try {
			resolve(state.loaded = await loader())
		} catch (e) {
			reject(state.error = e as Error)
		}
	})
	return state
}

type LoadComponent<P> = {
	// __esModule: true
	default: ComponentType<P>
} | ComponentType<P>

const resolve = <P, >(obj: LoadComponent<P>): ComponentType<P> => (obj as any).__esModule ? (obj as any).default : obj
const defaultRenderer = <P, T extends {default: ComponentType<P>}>(
	loaded: T,
	props: T extends {default: ComponentType<infer P>} ? P : never
) => {
	const Loaded = resolve(loaded)
	return <Loaded {...props}/>
}

type LoadableState<T, P, > = {
	error?: Error
	loaded?: LoadableComponent<T, P>
}

function createLoadableComponent<T, P>(
	{
		loading: Loading,
		loader,
		webpack,
		render = defaultRenderer as (loaded: T, props: P) => ReactElement,
		...opts
	}: LoadableOptions<T, P>
): LoadableComponent<T, P> & {
	displayName: string
	preload: PreloadLoaderType<T, P>
} {
	if (!Loading) throw new Error('react-loadable requires a `loading` component')

	let loadState: LoadState<T, P>
	const init = () => {
		if (!loadState) loadState = load(loader as any)
		return loadState.promise
	}
	ALL_INITIALIZERS.push(init)

	if (typeof webpack === 'function') READY_INITIALIZERS.push(() => {
		if (isWebpackReady(webpack)) return init()
	})

	const LoadableComponent = (props: ComponentProps<LoadableComponent<T, P>>) => {
		init()

		const report = useContext(CaptureContext)

		const [state, setState] = useState<LoadableState<T, P>>({
			error: loadState.error,
			loaded: loadState.loaded
		})
		const mountedRef = useRef<boolean>(false)
		const pendingStateRef = useRef<LoadableState<T, P>>()
		useEffect(() => {
			mountedRef.current = true
			if (pendingStateRef.current) {
				setState(pendingStateRef.current)
				pendingStateRef.current = undefined
			}
			return () => void(mountedRef.current = false)
		}, [])

		const loadModule = useCallback(async () => {
            const modules = opts['modules'];
            const webpackChunkNames = opts['webpackChunkNames'];
			if (report && Array.isArray(modules)) for (const index in modules) report(modules[index], (webpackChunkNames || [])[index])
			if (loadState.error || loadState.loaded) return
			try {
				await loadState.promise
			} catch {
			} finally {
				const newState = {
					error: loadState.error,
					loaded: loadState.loaded,
				}
				if (mountedRef.current) setState(newState)
				else pendingStateRef.current = newState
			}
		}, [report, mountedRef])

		const retry = useCallback(async () => {
			if (!mountedRef.current) return
			setState({error: undefined, loaded: undefined})
			loadState = load(loader as any)
			await loadModule()
		}, [loadModule])

		const firstStateRef = useRef<LoadableState<T, P> | undefined>(state)
		if (firstStateRef.current) {
			loadModule()
			firstStateRef.current = undefined
		}

		return !state.loaded || state.error
			? <Loading error={state.error} retry={retry}/>
			: render(state.loaded as any, props as any)
	}

	LoadableComponent.preload = (forceReload: boolean) => {
		if (!loadState || (loadState.error && forceReload))
            loadState = load(loader as any)

		return loadState.promise
	}
	LoadableComponent.displayName = `LoadableComponent(${Array.isArray(opts['modules']) ? opts['modules'].join('-') : ''})`

	return LoadableComponent as any
}

const flushInitializers = async <T, P>(initializers: (LoaderType<T, P> | LoaderTypeOptional<T, P>)[]): Promise<void> => {
	const promises = []
	while (initializers.length) promises.push(initializers.pop()!())
	await Promise.all(promises)
	if (initializers.length) return flushInitializers(initializers)
}

export const preloadAll = () => flushInitializers(ALL_INITIALIZERS)
export const preloadReady = () => flushInitializers(READY_INITIALIZERS)

const loadable = <T, P>(opts: LoadableOptions<T, P>) => createLoadableComponent(opts)
export default loadable
