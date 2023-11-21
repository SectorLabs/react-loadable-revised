declare const _default: ({ types: t, }: {
    types: any;
}, { shortenPath, absPath }?: {
    shortenPath?: string;
    absPath?: boolean;
}) => {
    visitor: {
        ImportDeclaration(path: any, stats: any): void;
    };
};
export default _default;
