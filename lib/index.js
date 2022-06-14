/**
 *
 * 本地调试 package1
 * yarn link package2
 *
 * package1:
 *  // index.ts
 *
 * import react from 'react' // 从 package1 node_modules 获取
 * import {fun} from 'package2'
 *
 * package2:
 *  // index.ts
 *
 * import react from 'react' // 从 package2 node_modules 获取
 *
 * export {fun}
 *
 * // package1 有两个版本的 react ，导致运行失败
 *
 * 如果 package1 在本地调试 link 了 package2 ,
 * 因为link的package 不会对package2 对内的 node_modules link
 * 所以 如果 package2 import 了 node_modules 还是 从 package2 的 node_modules 获取
 * 不是 从 package1 的 node_modules 获取，这会导致 : 对于(react ，react-router ，apollo/client )
 * 这种必须只能从一个 node_modules 获取 的 module 产生两个版本的代码 (从 package1 import 的 和 从 package2 import 的 )
 * 所以必须 都改成 从 package1  node_modules  获取 资源
 */
class ProxyLinkedModuleRequest {
  constructor(linkedPackagePath) {
    this.linkedPackagePath = linkedPackagePath
  }
  apply(compiler) {
    // compiler.hooks.environment.tap("tsoptions", () => {
    //   const module = compiler.options.module

    //   const tsRule = module.rules.find((rule) => rule.test.test(".ts"))
    //   if (tsRule) {
    //     const options = tsRule.use[0].options
    //     tsRule.use[0].options = cleverMerge(
    //       {
    //         compilerOptions: {
    //           // typeRoots:[],
    //           paths: {
    //             "@zstack/components/lib/*": [
    //               "/Users/a/github/zstack/zstack-ui-component/components/*",
    //             ],
    //             "@zstack/components/es/*": [
    //               "/Users/a/github/zstack/zstack-ui-component/components/*",
    //             ],
    //             "@zstack/components": [
    //               "/Users/a/github/zstack/zstack-ui-component/components/index.ts",
    //             ],
    //             "@zstack/*": [
    //               "/Users/a/github/zstack/zstack-ui-component/components/external-src/*",
    //             ],
    //           },
    //         },
    //       },
    //       options
    //     )
    //   }
    // })

    compiler.hooks.compilation.tap("compilationtap", (compilation, params) => {
      if (compilation.compiler.isChild()) {
        // html plugin
        return
      }
      // params.normalModuleFactory.resolverFactory.hooks.resolveOptions
      //   .for("normal")
      //   .tap("resolveOptions", (resolveOptionsWithDepType) => {
      //     const options = {
      //       alias: {
      //         "@zstack/components/es/style":
      //           "/Users/a/github/zstack/zstack-ui-component/components/style",
      //         "@zstack/components/lib/style":
      //           "/Users/a/github/zstack/zstack-ui-component/components/style",
      //         "@zstack/components/es":
      //           "/Users/a/github/zstack/zstack-ui-component/components",
      //         "@zstack/components/lib":
      //           "/Users/a/github/zstack/zstack-ui-component/components",
      //         "@zstack/utils":
      //           "/Users/a/github/zstack/zstack-ui-component/components/external-src/utils",
      //         "@zstack/components":
      //           "/Users/a/github/zstack/zstack-ui-component/components",
      //         "@zstack/types":
      //           "/Users/a/github/zstack/zstack-ui-component/components/external-src/types",
      //         "@zstack/hooks":
      //           "/Users/a/github/zstack/zstack-ui-component/components/external-src/hooks",
      //       },
      //     }

      //     return cleverMerge(resolveOptionsWithDepType, options)
      //   })

      params.normalModuleFactory.resolverFactory.hooks.resolver
        .for("normal")
        .tap(
          "resolverFactoryresolver",
          (resolver, resolveOptions, userResolveOptions) => {
            resolver.hooks.resolve.tapAsync(
              {
                name: "ResolverNodeModulesPluginPlugin",
                stage: -50,
              },
              (request, resolveContext, callback) => {
                if (
                  request.path &&
                  request.path.indexOf(
                    // "/Users/a/github/zstack/zstack-ui-component"
                    linkedPackagePath
                  ) > -1 &&
                  // enhanced-resolve : isModule() : 是否是 path1/path2  ，从 node_modules 获取 module
                  // 从 zstack-ui-component 获取 node_modules 的时候，改成从 当前cwd() 获取
                  // 因为 zstack-ui-component 是link 的 所以cwd() 的 node_modules 和 zstack-ui-component node_modules 不是
                  // 一个 目录，对于(react ，react-router ，apollo/client )这种必须只能从一个 node_modules 获取 所以都改成 从
                  // cwd()  node_modules  获取 资源
                  resolver.isModule(request.request)
                ) {
                  // 设置 context
                  request.path = process.cwd()
                }
                callback()
              }
            )
          }
        )
    })
  }
}
