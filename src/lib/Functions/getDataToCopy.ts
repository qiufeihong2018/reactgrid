import { State } from "../Model/State";
import { Range } from "../Model/Range";
import { Location } from "../Model/InternalModel";
import { emptyCell } from "./emptyCell";
import { getCompatibleCellAndTemplate } from "./getCompatibleCellAndTemplate";
import { tryAppendChange } from "./tryAppendChange";
import { Id } from "../Model/PublicModel";

/**
 * 获取要复制的数据
 * @param state - 应用程序的状态对象
 * @param activeSelectedRange - 激活的选中范围
 * @param removeValues - 是否移除值，默认为false
 * @returns { div: HTMLDivElement, text: string } - 包含HTML div元素和文本内容的对象
 */
export function getDataToCopy(
  state: State,
  activeSelectedRange: Range,
  removeValues = false
): { div: HTMLDivElement; text: string } {
  const { div, table, location } = createHTMLElements(activeSelectedRange);
  const text = copyElements(
    state,
    location,
    activeSelectedRange,
    table,
    removeValues
  );
  setStyles(div, table);
  return { div, text };
}

/**
 * 复制元素
 *
 * @param state - 应用状态
 * @param location - 位置
 * @param activeSelectedRange - 激活的选中范围
 * @param table - HTML表格元素
 * @param removeValues - 是否删除值
 * @returns 返回复制的文本
 */
function copyElements(
  state: State,
  location: Location,
  activeSelectedRange: Range,
  table: HTMLTableElement,
  removeValues: boolean
): string {
  let text = "";
  let prevId: Id = "";
  activeSelectedRange.rows.forEach((row) => {
    const tableRow = table.insertRow();
    activeSelectedRange.columns.forEach((column) => {
      const tableCell = tableRow.insertCell();
      const { cell } = getCompatibleCellAndTemplate(state, { row, column });
      const validatedText = cell.text || " ";
      tableCell.textContent = validatedText;
      text =
        prevId === ""
          ? cell.text
          : text + (prevId === row.rowId ? "\t" : "\n") + validatedText;
      prevId = row.rowId;
      tableCell.setAttribute("data-reactgrid", JSON.stringify(cell));
      tableCell.style.border = "1px solid #D3D3D3";
      clearCell(state as State, { row, column }, removeValues);
    });
  });

  return text;
}

// ? unused?
/**
 * 处理单个单元格
 * @param tableRow 表格行元素
 * @param state 状态对象
 * @param location 位置对象
 */
export function processSingleCell(
  tableRow: HTMLTableRowElement,
  state: State,
  location: Location
): void {
  const tableCell: HTMLTableDataCellElement = tableRow.insertCell();
  const { cell } = getCompatibleCellAndTemplate(state, location);

  // 设置单元格文本内容为 cell 的文本内容，如果不存在则为一个空格
  tableCell.textContent = cell.text ? cell.text : " ";

  // 设置单元格的 data-reactgrid 属性为 cell 的 JSON 字符串形式
  tableCell.setAttribute("data-reactgrid", JSON.stringify(cell));

  // 设置单元格的边框为 1px 的实线灰色边框
  tableCell.style.border = "1px solid #D3D3D3";
}

/**
 * 创建HTML元素
 * @param activeSelectedRange - 当前选中的范围
 * @returns { div: HTMLDivElement, table: HTMLTableElement, location: Location } - 返回包含创建的HTML元素的div、table和location的对象
 */
export function createHTMLElements(activeSelectedRange: Range): {
  div: HTMLDivElement;
  table: HTMLTableElement;
  location: Location;
} {
  const div = document.createElement("div");
  const table = document.createElement("table");
  table.setAttribute("empty-cells", "show");
  table.setAttribute("data-reactgrid", "reactgrid-content");
  const location = {
    row: activeSelectedRange.first.row,
    column: activeSelectedRange.first.column,
  };
  return { div, table, location };
}

export function setStyles(div: HTMLDivElement, table: HTMLTableElement): void {
  div.setAttribute("contenteditable", "true");
  div.style.position = "fixed";
  div.style.top = "50%";
  div.style.left = "50%";
  div.appendChild(table);
}

export function clearCell(
  state: State,
  location: Location,
  removeValues: boolean
): void {
  if (removeValues) {
    state = tryAppendChange(state, location, emptyCell);
  }
}
