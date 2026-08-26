# 位图原稿（已被组件版取代）

这里是三张 Canonical Figure 的位图原稿，中英各一版。它们**不再被站点渲染**，
保留在这里只作为历史参照与设计出处。

站点上的三张图现在由 `docs/.vitepress/theme/figures/` 下的 Vue 组件绘制。
换掉位图是因为两处缺陷改不动：

- **Figure 2** 没有画出 `IdentityBinding`。图上是一条从 SoulseedAGI 直连
  ActorIdentity 的虚线，标签写 `Canonical Actor Binding`。标签名对，缺的是那个
  canonical 对象本身 —— 语料 06 §4 与 08 §6 要求的关系是
  `Soulseed Canonical Actor ↔ IdentityBinding ↔ SoulAuth ActorIdentity`。
  补这个对象要改版式，不是改像素。
- **Figure 1 中文版比英文版实质更薄**。英文版有三条底部编号注释、
  `Public Bridge / On-demand Access` 副标、以及 SoulseedAGI ↔ SoulseedOS ↔ Apps
  和 SoulseedOS ↔ SoulAuth ↔ Any Application 的双向箭头；中文版这三样都没有，
  箭头是单向下行加无头连线。而这种差异不会让任何检查变红。

组件版把这两处都修掉了，并且中英从同一份 `strings.ts` 生成 ——「某个语言版本
更薄」从"靠人眼发现"变成结构上不可能，`npm run check:figures` 会逐层比对两个
locale 的结构。

另有一处已在位图上直接修掉：Figure 3 中文版 `Credentiat` → `Credential`
（从同词的 `d` 取升部竖干贴回末位）。这处修改保留在本目录的 PNG 里。
