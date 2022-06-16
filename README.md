## 代理 webpack linked (yarn link package2) package2 对 node_modules 的请求

使用 webpack 编译

package1 本地调试 package2
//package1
import 'package2'

```bash
yarn link package2
```

```js
// package1:
// index.ts

import react from "react" // 从 package1 node_modules 获取
import { fun } from "package2" //linked package2

// package2:
// index.ts

import react from "react" // 从 package2 node_modules 获取

export { fun }

// package1 有两个版本的 react ，导致运行失败
```

如果 package1 在本地 link 了 package2 ,
因为 link 的 package 不会对 package2 内的 node_modules link.
所以 如果 package2 import 了 node_modules 还是 从 package2 的 node_modules 获取,
不是从 package1 的 node_modules 获取，这会导致 : 对于(react ，react-router ，apollo/client )
这种必须只能从一个 node_modules 获取 的 module 产生两个版本的代码 (从 package1 import 的 和 从 package2 import 的 )
所以必须 都改成 从 package1 node_modules 获取 资源

## 使用

```js
const {ProxyLinkedModuleRequest , ZStackComponentsOptionsProxy} = require("proxy-linked-module-request")

const webpackConfig = {
  plugins: [
    // linked 的 package 的完整路径 : /dir/xx/package
    new ProxyLinkedModuleRequest({linkedPackagePath}),
    /**
     * ZStackComponentsOptionsProxy是zstack 组件库代理的一些参数，调试
     * zstack componnents的时候使用
     * */
    new ZStackComponentsOptionsProxy({linkedPackagePath}),
  ],
}
```
