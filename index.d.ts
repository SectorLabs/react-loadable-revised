import { ComponentType, ReactElement, ReactNode } from 'react';
type PreloadLoaderType<T, P> = (force?: boolean) => Promise<LoadableComponent<T, P>>;
export declare function Capture({ report, renderPreamble, children }: {
    report(moduleId: string, webpackChunkName?: string): any;
    renderPreamble(): ReactNode;
    children: ReactNode;
}): JSX.Element;
export declare namespace Capture {
    var displayName: string;
}
type LoadableOptions<T, P> = {
    loading: ComponentType<{
        error?: Error;
        retry(): any;
    }>;
    webpack?(): string[];
    loader(): Promise<T>;
    render?(loaded: T, props: P): ReactElement;
    modules?: string[];
    webpackChunkNames?: string[];
};
type LoadableComponent<T, P> = ComponentType<T extends {
    default: ComponentType<infer Props>;
} ? Props : P>;
export declare const preloadAll: () => Promise<void>;
export declare const preloadReady: () => Promise<void>;
declare const loadable: <T, P>(opts: LoadableOptions<T, P>) => LoadableComponent<T, P> & {
    displayName: string;
    preload: PreloadLoaderType<T, P>;
};
export default loadable;
