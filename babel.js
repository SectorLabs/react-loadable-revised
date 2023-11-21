"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// https://babeljs.io/docs/en/babel-types
// https://doc.esdoc.org/github.com/mason-lang/esast/class/src/ast.js~Property.html
// https://astexplorer.net/
const node_path_1 = __importDefault(require("node:path"));
exports.default = ({ types: t, /*template*/ }, { shortenPath, absPath } = {}) => {
    return ({
        visitor: {
            ImportDeclaration(path, stats) {
                const source = path.node.source.value;
                if (!(stats.opts.hocSources ?? ['@react-loadable/revised']).includes(source))
                    return;
                const defaultSpecifier = path.get('specifiers').find(specifier => specifier.isImportDefaultSpecifier());
                if (!defaultSpecifier)
                    return;
                const bindingName = defaultSpecifier.node.local.name;
                const binding = path.scope.getBinding(bindingName);
                refPath: for (const refPath of binding.referencePaths) {
                    let callExpression = refPath.parentPath;
                    if (callExpression.isMemberExpression() &&
                        callExpression.node.computed === false &&
                        (stats.opts.hocIdentifiers || []).some(identifier => callExpression.get('property').isIdentifier({ name: identifier }))) {
                        callExpression = callExpression.parentPath;
                    }
                    if (!callExpression.isCallExpression())
                        continue;
                    const args = callExpression.get('arguments');
                    if (args.length !== 1)
                        throw new Error('react-loadable: must provide exactly 1 argument to loadable()');
                    const options = args[0];
                    if (!options.isObjectExpression())
                        continue;
                    let loader;
                    for (const property of options.get('properties')) {
                        if (property.type !== 'SpreadProperty') {
                            const key = property.get('key');
                            if (key.node.name === 'webpack')
                                continue refPath;
                            else if (key.node.name === 'loader')
                                loader = property;
                        }
                    }
                    if (!loader)
                        throw new Error('react-loadable: at least loader or webpack properties must be statically provided to the option that is passed to loadable()');
                    const loaderValue = loader.get('value');
                    const dynamicImports = [];
                    const body = loader.isFunction()
                        ? loader.get('body')
                        : loaderValue.isArrowFunctionExpression() && loaderValue.get('body');
                    if (!body)
                        throw new Error('react-loadable: loader must be function shorthand expression or arrow function expression');
                    body.traverse({
                        Import(path) {
                            dynamicImports.push(path.parentPath);
                        }
                    });
                    if (!dynamicImports.length)
                        continue;
                    loader.insertAfter(t.objectProperty(t.identifier('webpack'), t.arrowFunctionExpression([], t.arrayExpression(dynamicImports.map(dynamicImport => t.callExpression(t.memberExpression(t.identifier('require'), t.identifier('resolveWeak')), [dynamicImport.get('arguments')[0].node]))))));
                    const dir = node_path_1.default.dirname(this.file.opts.filename);
                    const rootDir = this.file.opts.root;
                    loader.insertAfter(t.objectProperty(t.identifier('modules'), t.arrayExpression(dynamicImports.map(dynamicImport => {
                        const node = dynamicImport.get('arguments')[0].node;
                        if (absPath && node.type === 'StringLiteral') {
                            const { value } = node;
                            if (typeof value === 'string') {
                                const resolvedPath = absPath && value.startsWith('./') ? node_path_1.default.resolve(dir, value) : value;
                                const afterShortenPath = typeof shortenPath === 'string' && resolvedPath.startsWith(rootDir)
                                    ? `${shortenPath}${resolvedPath.slice(rootDir.length)}`
                                    : resolvedPath;
                                return t.stringLiteral(afterShortenPath);
                            }
                        }
                        return node;
                    }))));
                    loader.insertAfter(t.objectProperty(t.identifier('webpackChunkNames'), t.arrayExpression(dynamicImports.map(dynamicImport => {
                        const leadingComments = dynamicImport.get('arguments')[0].node.leadingComments ?? [];
                        const webpackChunkName = leadingComments
                            .map(leadingComment => leadingComment.value)
                            .filter(comment => /webpackChunkName/.test(comment))
                            .map(comment => comment.split(':')[1].replace(/["']/g, '').trim())[0];
                        return t.stringLiteral(webpackChunkName || '');
                    }))));
                }
            }
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHlDQUF5QztBQUN6QyxtRkFBbUY7QUFDbkYsMkJBQTJCO0FBQzNCLDBEQUFnQztBQUVoQyxrQkFBZSxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUMsRUFBRSxFQUFDLFdBQVcsRUFBRSxPQUFPLEtBRzNELEVBQUUsRUFBRSxFQUFFO0lBQ1QsT0FBTyxDQUFDO1FBQ1AsT0FBTyxFQUFFO1lBQ1IsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEtBQUs7Z0JBQzVCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQTtnQkFDckMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFBRSxPQUFNO2dCQUVwRixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQTtnQkFDdkcsSUFBSSxDQUFDLGdCQUFnQjtvQkFBRSxPQUFNO2dCQUU3QixNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQTtnQkFDcEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBRWxELE9BQU8sRUFDTixLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7b0JBQzdDLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7b0JBRXJCLElBQ0ksY0FBYyxDQUFDLGtCQUFrQixFQUFF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