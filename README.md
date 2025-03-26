# Figma元素分析器

这是一个Figma插件，可以帮助设计师和开发者分析Figma设计中的元素，并根据元素的交互特性进行智能分类。例如，带有点击交互的元素会被识别为按钮组件，文本节点会被识别为文本组件等。此外，还能识别设计中的滚动区域及其滚动方向。

## 功能特点

- 自动扫描Figma页面中的所有元素
- 根据元素的交互设置和特性进行智能分类
- 支持的元素类型：
  - **按钮**：具有点击交互（onClick, onPress, onDrag）的元素
  - **文本**：纯文本节点
  - **输入框**：名称包含"input"、"field"、"form"、"输入"或"表单"的元素
  - **图片**：包含图片填充的矩形或形状
  - **图标**：尺寸小于等于24x24像素且名称包含"icon"或"图标"的元素
  - **滚动区域**：具有滚动行为设置或名称中包含滚动相关关键词的元素
  - **容器**：Frame、Group、Component或Instance类型的元素
  - **未知**：不属于上述任何类别的元素
- 提供元素分类统计和详细列表
- 分析滚动区域类型及方向（水平、垂直或两者）
- 界面完全中文化，使用方便

## 滚动区域分析

插件能够智能识别以下类型的滚动区域：

1. **显式设置了溢出方向的元素**：在Figma中设置了overflow属性的元素
2. **命名包含滚动关键词的元素**：名称中包含"scroll"、"滚动"、"scroller"、"carousel"、"轮播"、"列表"等关键词的元素
3. **具有特定布局设置的Frame**：使用了自动布局且设置了固定尺寸的Frame

对于识别到的滚动区域，插件会提供以下详细信息：
- 滚动区域的总数
- 不同滚动方向的统计（水平、垂直、两者兼有）
- 滚动区域的名称和位置信息

## 使用方法

1. 在Figma中打开您的设计文件
2. 从插件菜单中选择"Figma元素分析器"
3. 在插件界面中点击"开始分析"按钮
4. 查看分析结果，包括各类元素的数量统计、滚动区域详情和完整元素列表
5. 完成后点击"关闭插件"按钮

## 适用场景

- 帮助设计师审核设计中的交互元素和滚动行为
- 协助开发人员理解设计中各元素的用途、类型和滚动区域设置
- 辅助自动生成设计规范文档
- 在复杂设计中快速找到特定类型的元素和滚动区域
- 评估页面的可滚动区域数量，优化用户体验

## 开发与贡献

此插件使用TypeScript开发，如果您想要贡献代码或定制功能，请按照以下步骤：

1. 克隆仓库
2. 安装依赖：`npm install`
3. 编译代码：`npm run build`
4. 在Figma中加载插件进行测试

## 注意事项

- 插件的分类基于元素特征的启发式规则，可能不总是100%准确
- 对于复杂的嵌套组件，插件会递归分析所有子元素
- 当前版本不支持自定义分类规则，未来版本可能会添加此功能
- 滚动区域的识别准确性取决于设计文件的结构和命名规范

---

如有问题或建议，欢迎提交issue或联系开发者。
