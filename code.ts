/// <reference types="@figma/plugin-typings" />

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 450, height: 500 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

// 该插件将分析Figma页面中的元素，并根据其交互特性进行分类
// 例如，带有click交互的元素被识别为按钮，纯文本元素被识别为文本组件等

// 定义元素类型枚举
enum ElementType {
  BUTTON = '按钮',
  TEXT = '文本',
  INPUT = '输入框',
  IMAGE = '图片',
  ICON = '图标',
  CONTAINER = '容器',
  SCROLL = '滚动区域',
  UNKNOWN = '未知'
}

// 定义元素信息接口
interface ElementInfo {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  scrollDirection?: string;  // 添加滚动方向属性
}

// 根据节点特性判断元素类型
function determineElementType(node: SceneNode): ElementType {
  // 检查是否有原型交互
  if ('reactions' in node && node.reactions && node.reactions.length > 0) {
    // 遍历所有交互
    for (const reaction of node.reactions) {
      // 检查是否有点击事件，如果有则判断为按钮
      if (reaction.trigger && reaction.trigger.type === 'ON_CLICK' || 
          reaction.trigger && reaction.trigger.type === 'ON_PRESS' || 
          reaction.trigger && reaction.trigger.type === 'ON_DRAG') {
        return ElementType.BUTTON;
      }
    }
  }

  // 检查是否有滚动行为
  if (
    // 检查显式设置的溢出方向
    ('overflowDirection' in node && 
     (node.overflowDirection === 'BOTH' || 
      node.overflowDirection === 'HORIZONTAL' || 
      node.overflowDirection === 'VERTICAL')) || 
    // 检查是否是可滚动的Frame
    (node.type === 'FRAME' && 'layoutMode' in node && 
     node.layoutMode !== 'NONE' && 
     (('primaryAxisSizingMode' in node && node.primaryAxisSizingMode === 'FIXED') ||
      ('counterAxisSizingMode' in node && node.counterAxisSizingMode === 'FIXED')))
  ) {
    return ElementType.SCROLL;
  }

  // 检查是否为文本节点
  if (node.type === 'TEXT') {
    return ElementType.TEXT;
  }
  
  // 检查是否为图片或包含填充的矩形/形状
  if ((node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') && 
      'fills' in node && node.fills && 
      Array.isArray(node.fills) && node.fills.some(fill => fill.type === 'IMAGE')) {
    return ElementType.IMAGE;
  }

  // 检查是否为Frame或Group，视为容器
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    return ElementType.CONTAINER;
  }

  // 根据大小判断是否可能是图标
  if (node.width <= 24 && node.height <= 24) {
    return ElementType.ICON;
  }

  // 默认为未知类型
  return ElementType.UNKNOWN;
}

// 递归分析节点及其子节点
function analyzeNode(node: SceneNode): ElementInfo[] {
  let results: ElementInfo[] = [];
  
  // 跳过不可见的节点
  if ('visible' in node && !node.visible) {
    return results;
  }

  // 创建元素信息对象
  const elementType = determineElementType(node);
  const elementInfo: ElementInfo = {
    id: node.id,
    name: node.name,
    type: elementType,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height
  };
  
  // 如果是滚动区域，添加滚动方向信息
  if (elementType === ElementType.SCROLL && 'overflowDirection' in node) {
    switch (node.overflowDirection) {
      case 'BOTH':
        elementInfo.scrollDirection = '水平和垂直';
        break;
      case 'HORIZONTAL':
        elementInfo.scrollDirection = '水平方向';
        break;
      case 'VERTICAL':
        elementInfo.scrollDirection = '垂直方向';
        break;
      default:
        elementInfo.scrollDirection = '未知方向';
    }
  }
  
  results.push(elementInfo);

  // 如果节点有子节点，递归分析
  if ('children' in node) {
    for (const child of node.children) {
      results = results.concat(analyzeNode(child));
    }
  }

  return results;
}

// 处理来自UI的消息
figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'analyze-page') {
    // 获取当前页面的所有元素
    const elements: ElementInfo[] = [];
    
    // 分析当前页面中的所有节点
    for (const node of figma.currentPage.children) {
      elements.push(...analyzeNode(node));
    }
    
    // 按类型对元素进行分组统计
    const stats = {
      [ElementType.BUTTON]: 0,
      [ElementType.TEXT]: 0,
      [ElementType.INPUT]: 0,
      [ElementType.IMAGE]: 0,
      [ElementType.ICON]: 0,
      [ElementType.CONTAINER]: 0,
      [ElementType.SCROLL]: 0,
      [ElementType.UNKNOWN]: 0
    };
    
    elements.forEach(el => {
      stats[el.type]++;
    });
    
    // 将分析结果发送回UI
    figma.ui.postMessage({
      type: 'analysis-results',
      elements: elements,
      stats: stats
    });
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
