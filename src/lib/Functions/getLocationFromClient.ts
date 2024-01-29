import {
  Direction,
  GridColumn,
  GridRow,
  PointerLocation,
} from "../Model/InternalModel";
import { getScrollOfScrollableElement } from "./scrollHelpers";
import {
  getReactGridOffsets,
  getSizeOfElement,
  getStickyOffset,
  getVisibleSizeOfReactGrid,
} from "./elementSizeHelpers";
import { State } from "../Model/State";

// TODO: rewrite without division
/**
 * 从客户端获取位置
 * @param state 状态对象
 * @param clientX 客户端X坐标
 * @param clientY 客户端Y坐标
 * @param favorScrollableContent 选择可滚动内容的方向，默认为无偏好的方向
 * @returns 返回指针位置对象
 */
export function getLocationFromClient(
  state: State,
  clientX: number,
  clientY: number,
  favorScrollableContent?: Direction
): PointerLocation {
  if (!state.reactGridElement) {
    throw new Error(
      `"state.reactGridElement"字段在调用"getBoundingClientRect()"之前应该被初始化`
    );
  }
  const { left, top } = state.reactGridElement.getBoundingClientRect();
  const viewportX = clientX - left;
  const viewportY = clientY - top;

  const { cellY, row } = getRow(
    state,
    viewportY,
    favorScrollableContent === "vertical" || favorScrollableContent === "both"
  );
  const { cellX, column } = getColumn(
    state,
    viewportX,
    favorScrollableContent === "horizontal" || favorScrollableContent === "both"
  );
  return { row, column, viewportX, viewportY, cellX, cellY };
}

function getRow(
  state: State,
  viewportY: number,
  favorScrollableContent: boolean
): { cellY: number; row: GridRow } {
  return (
    getStickyTopRow(state, viewportY, favorScrollableContent) ||
    getStickyBottomRow(state, viewportY, favorScrollableContent) ||
    getRowOnNonSticky(state, viewportY)
  );
}

function getColumn(
  state: State,
  viewportX: number,
  favorScrollableContent: boolean
): { cellX: number; column: GridColumn } {
  return (
    getLeftStickyColumn(state, viewportX, favorScrollableContent) ||
    getRightStickyColumn(state, viewportX, favorScrollableContent) ||
    getColumnOnNonSticky(state, viewportX)
  );
}

function getRowOnNonSticky(
  state: State,
  viewportY: number
): { cellY: number; row: GridRow } {
  if (state.cellMatrix.scrollableRange.rows.length < 1) {
    const sticky =
      viewportY >= state.cellMatrix.height
        ? state.cellMatrix.last
        : state.cellMatrix.first;
    return {
      cellY: sticky.row.height,
      row: sticky.row,
    };
  }
  return getScrollableContentRow(state, viewportY);
}

/**
 * 获取非粘滞列的信息
 *
 * @param state - 当前状态
 * @param viewportX - 视口X坐标
 * @returns - 包含单元格X坐标和列信息的对象
 */
function getColumnOnNonSticky(
  state: State,
  viewportX: number
): { cellX: number; column: GridColumn } {
  if (state.cellMatrix.scrollableRange.columns.length < 1) {
    const sticky =
      viewportX >= state.cellMatrix.width
        ? state.cellMatrix.last
        : state.cellMatrix.first;
    return {
      cellX: sticky.column.width,
      column: sticky.column,
    };
  }
  return getScrollableContentColumn(state, viewportX);
}

// PRO
function getStickyBottomRow(
  state: State,
  viewportY: number,
  favorScrollableContent: boolean
): { cellY: number; row: GridRow } | undefined {
  const cellMatrix = state.cellMatrix;
  const { scrollTop } = getScrollOfScrollableElement(state.scrollableElement);
  const { top } = getReactGridOffsets(state);
  const { height } = getSizeOfElement(state.scrollableElement);
  const topStickyOffset = getStickyOffset(scrollTop, top);
  const maxScrollTop = Math.max(cellMatrix.height - height + top, 0);
  const bottomStickyOffset =
    getVisibleSizeOfReactGrid(state).height +
    topStickyOffset -
    cellMatrix.ranges.stickyBottomRange.height;
  if (
    cellMatrix.ranges.stickyBottomRange.rows.length > 0 &&
    viewportY >= bottomStickyOffset &&
    !(favorScrollableContent && scrollTop + 1 < maxScrollTop)
  ) {
    const row =
      cellMatrix.ranges.stickyBottomRange.rows.find(
        (row) => row.bottom > viewportY - bottomStickyOffset
      ) || cellMatrix.last.row;
    const cellY = viewportY - bottomStickyOffset - row.top;
    return { cellY, row };
  }
}

/**
 * 获取右侧粘性列
 * @param state - 状态
 * @param viewportX - 视图范围X坐标
 * @param favorScrollableContent - 是否优先考虑可滚动内容
 * @returns - 返回包含单元格X坐标和粘性列的对象或undefined
 */
export function getRightStickyColumn(
  state: State,
  viewportX: number,
  favorScrollableContent: boolean
): { cellX: number; column: GridColumn } | undefined {
  const cellMatrix = state.cellMatrix; // 细分矩阵
  const { scrollLeft } = getScrollOfScrollableElement(state.scrollableElement); // 获取滚动元素的滚动位置
  const { left } = getReactGridOffsets(state); // 获取React网格的偏移量
  const { width } = getSizeOfElement(state.scrollableElement); // 获取滚动元素的大小
  const leftStickyOffset = getStickyOffset(scrollLeft, left); // 获取左侧粘性偏移量
  const maxScrollLeft = Math.max(cellMatrix.width - width + left, 0); // 计算最大滚动位置
  const rightStickyOffset =
    getVisibleSizeOfReactGrid(state).width +
    leftStickyOffset -
    cellMatrix.ranges.stickyRightRange.width; // 计算右侧粘性偏移量
  if (
    cellMatrix.ranges.stickyRightRange.columns.length > 0 && // 如果存在右侧粘性列
    viewportX >= rightStickyOffset && // 如果视图范围X坐标大于等于右侧粘性偏移量
    !(favorScrollableContent && scrollLeft + 1 < maxScrollLeft) // 如果不优先考虑可滚动内容或者滚动位置加1小于最大滚动位置
  ) {
    const column =
      cellMatrix.ranges.stickyRightRange.columns.find(
        (column) => column.right > viewportX - rightStickyOffset
      ) || cellMatrix.last.column; // 找到最右侧粘性列或最后一列
    const cellX = viewportX - rightStickyOffset - column.left; // 计算单元格X坐标
    return { cellX, column }; // 返回包含单元格X坐标和粘性列的对象
  }
}

export function getStickyTopRow(
  state: State,
  viewportY: number,
  favorScrollableContent: boolean
): { cellY: number; row: GridRow } | undefined {
  const cellMatrix = state.cellMatrix;
  const { scrollTop } = getScrollOfScrollableElement(state.scrollableElement);
  const { top } = getReactGridOffsets(state);
  const topStickyOffset = getStickyOffset(scrollTop, top);
  if (
    cellMatrix.ranges.stickyTopRange.rows.find(
      (row) => row.bottom > viewportY - topStickyOffset
    ) &&
    viewportY < cellMatrix.ranges.stickyTopRange.height + topStickyOffset &&
    !(favorScrollableContent && scrollTop > top)
  ) {
    const row =
      cellMatrix.ranges.stickyTopRange.rows.find(
        (row) => row.bottom > viewportY - topStickyOffset
      ) || cellMatrix.ranges.stickyTopRange.first.row;
    const cellY = viewportY - row.top;
    return { cellY, row };
  }
}

export function getLeftStickyColumn(
  state: State,
  viewportX: number,
  favorScrollableContent: boolean
): { cellX: number; column: GridColumn } | undefined {
  const cellMatrix = state.cellMatrix;
  const { scrollLeft } = getScrollOfScrollableElement(state.scrollableElement);
  const { left } = getReactGridOffsets(state);
  const leftStickyOffset = getStickyOffset(scrollLeft, left);
  if (
    cellMatrix.ranges.stickyLeftRange.columns.find(
      (column) => column.right > viewportX - leftStickyOffset
    ) &&
    viewportX < cellMatrix.ranges.stickyLeftRange.width + leftStickyOffset &&
    !(favorScrollableContent && scrollLeft > left)
  ) {
    const column =
      cellMatrix.ranges.stickyLeftRange.columns.find(
        (column) => column.right > viewportX - leftStickyOffset
      ) || cellMatrix.ranges.stickyLeftRange.first.column;
    const cellX = viewportX - column.left;
    return { cellX, column };
  }
}

export function getScrollableContentRow(
  state: State,
  viewportY: number
): { cellY: number; row: GridRow } {
  const cellMatrix = state.cellMatrix;
  const scrollableContentY =
    viewportY - cellMatrix.ranges.stickyTopRange.height;
  const row =
    cellMatrix.scrollableRange.rows.find(
      (row) => row.bottom >= scrollableContentY
    ) || cellMatrix.scrollableRange.last.row;
  const cellY = scrollableContentY - row.top;
  return { cellY, row };
}

export function getScrollableContentColumn(
  state: State,
  viewportX: number
): { cellX: number; column: GridColumn } {
  const cellMatrix = state.cellMatrix;
  const scrollableContentX =
    viewportX - cellMatrix.ranges.stickyLeftRange.width;
  const column =
    cellMatrix.scrollableRange.columns.find(
      (column) => column.right >= scrollableContentX
    ) || cellMatrix.scrollableRange.last.column;
  const cellX = scrollableContentX - column.left;
  return { cellX, column };
}
