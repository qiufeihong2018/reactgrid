import { State } from '../Model/State';
import { Compatible, Cell } from '../Model/PublicModel';
import { ClipboardEvent } from '../Model/domEventsTypes';
import { getActiveSelectedRange } from './getActiveSelectedRange';
import { pasteData } from './pasteData';

/**
 * 处理粘贴事件的函数
 * @param event - ClipboardEvent对象，表示剪贴板事件
 * @param state - State对象，表示当前状态
 * @returns 修改后的状态对象
 */
export function handlePaste(event: ClipboardEvent, state: State): State {
    const activeSelectedRange = getActiveSelectedRange(state); // 获取活动选择范围
    if (!activeSelectedRange) {
        return state; // 如果没有活动选择范围，则直接返回当前状态
    }
    let pastedRows: Compatible<Cell>[][] = []; // 定义一个二维数组，用于存储粘贴的行数据
    const htmlData = event.clipboardData.getData("text/html"); // 获取剪贴板中的HTML数据
    const document = new DOMParser().parseFromString(htmlData, "text/html"); // 将HTML数据解析为DOM文档
    // TODO Do we need selection mode here ?
    //const selectionMode = parsedData.body.firstElementChild && parsedData.body.firstElementChild.getAttribute('data-selection') as SelectionMode;
    // TODO quite insecure! maybe do some checks ?
    const hasReactGridAttribute =
      document.body.firstElementChild?.getAttribute("data-reactgrid") ===
      "reactgrid-content"; // 检查DOM文档中的body元素是否存在data-reactgrid属性，且属性值为reactgrid-content
    if (
      hasReactGridAttribute &&
      document.body.firstElementChild?.firstElementChild // 如果存在data-reactgrid属性且body元素有子元素
    ) {
      const tableRows =
        document.body.firstElementChild.firstElementChild.children; // 获取table元素的行元素集合
      for (let ri = 0; ri < tableRows.length; ri++) {
        const row: Compatible<Cell>[] = []; // 定义一个用于存储行数据的数组
        for (let ci = 0; ci < tableRows[ri].children.length; ci++) {
          const rawData =
            tableRows[ri].children[ci].getAttribute("data-reactgrid"); // 获取单元格的data-reactgrid属性值
          const data = rawData && JSON.parse(rawData); // 如果属性值存在则将其解析为JSON对象
          const text = tableRows[ri].children[ci].innerHTML; // 获取单元格的文本内容
          row.push(data ? data : { type: "text", text, value: parseFloat(text) }); // 将数据或文本单元格添加到行数组中
        }
        pastedRows.push(row); // 将行数组添加到粘贴行数据集合中
      }
    } else {
      pastedRows = event.clipboardData
        .getData("text/plain")
        .split("\n")
        .map((line: string) =>
          line
            .split("\t")
            .map((t) => ({ type: "text", text: t, value: parseFloat(t) })) // 将纯文本数据按行、按制表符分隔，并转换为兼容的数据格式
        );
    }
    event.preventDefault(); // 阻止默认的粘贴行为
    return { ...pasteData(state, pastedRows) }; // 返回修改后的状态对象
}
  