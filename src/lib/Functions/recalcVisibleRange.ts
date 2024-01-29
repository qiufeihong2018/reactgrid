import { Range } from "../Model/Range";
import { State } from "../Model/State";
import { GridColumn, GridRow } from "../Model/InternalModel";
import { getScrollOfScrollableElement } from "./scrollHelpers";
import {
  getVisibleSizeOfReactGrid,
  getReactGridOffsets,
  getStickyOffset,
} from "./elementSizeHelpers";

export const VS_PAGE_HEIGHT = 400;
export const VS_PAGE_WIDTH = 300;
const ADDITONAL_INDEX = 1; // is needed for getting last element in array

/**
 * 重新计算可见范围
 * @param state 状态对象
 * @returns 更新后的状态对象
 */
export function recalcVisibleRange(state: State): State {
  if (state.disableVirtualScrolling) {
    // 如果禁用了虚拟滚动，则获取滚动范围
    const { rows, columns } = state.cellMatrix.scrollableRange;
    const visibleRange = new Range(rows, columns);
    // 返回新的状态对象，包含可见范围
    return {
      ...state,
      visibleRange,
    };
  }
  // 获取滚动元素的滚动位置
  const { scrollTop, scrollLeft } = getScrollOfScrollableElement(
    state.scrollableElement
  );
  // 获取滚动元素可见范围的尺寸
  const { width, height } = getVisibleScrollableSize(
    state,
    [-state.cellMatrix.ranges.stickyTopRange.height],
    [-state.cellMatrix.ranges.stickyLeftRange.width]
  );
  // 获取可见列
  const visibleColumns = getVisibleColumns(state, width);
  // 获取可见行
  const visibleRows = getVisibleRows(state, height);
  // 创建新的可见范围对象
  const visibleRange = new Range(visibleRows, visibleColumns);
  return {
    ...state,
    leftScrollBoudary:
      visibleRange.columns.length > 0 ? scrollLeft - VS_PAGE_WIDTH : 0,
    rightScrollBoudary:
      visibleRange.last.column === undefined ? 0 : VS_PAGE_WIDTH + scrollLeft,
    topScrollBoudary:
      visibleRange.columns.length > 0 ? scrollTop - VS_PAGE_HEIGHT : 0,
    bottomScrollBoudary:
      visibleRange.last.row === undefined ? 0 : VS_PAGE_HEIGHT + scrollTop,
    visibleRange,
  };
}

/**
 * 获取可见区域中滚动元素的大小
 * @param state - 应用状态对象
 * @param heights - 高度数组
 * @param widths - 宽度数组
 * @returns { height: number, width: number } - 可见区域中滚动元素的大小对象
 */
export function getVisibleScrollableSize(
  state: State,
  heights: number[],
  widths: number[]
): { height: number; width: number } {
  const { height, width } = getVisibleSizeOfReactGrid(state);
  const sum = (a: number, b: number) => a + b;
  return {
    height: Math.max(heights.reduce(sum, height), 0),
    width: Math.max(widths.reduce(sum, width), 0),
  };
}

/**
 * 获取可见列
 *
 * @param state - 状态对象
 * @param scrollableWidth - 滚动宽度
 * @returns 可见列数组
 */
export function getVisibleColumns(
  state: State,
  scrollableWidth: number
): GridColumn[] {
  const { columns } = state.cellMatrix.scrollableRange;
  const { left } = getReactGridOffsets(state);
  const { scrollLeft } = getScrollOfScrollableElement(state.scrollableElement);
  const firstIndex = Math.max(
    colBinarySearch(columns, scrollLeft - left - VS_PAGE_WIDTH) -
      ADDITONAL_INDEX -
      1,
    0
  );
  const lastIndex = colBinarySearch(
    columns,
    scrollableWidth + getStickyOffset(scrollLeft, left) + VS_PAGE_WIDTH,
    firstIndex
  );
  return columns.slice(firstIndex, lastIndex + ADDITONAL_INDEX);
}

export function getVisibleRows(
  state: State,
  scrollableHeight: number
): GridRow[] {
  const { rows } = state.cellMatrix.scrollableRange;
  const { top } = getReactGridOffsets(state);
  const { scrollTop } = getScrollOfScrollableElement(state.scrollableElement);
  const firstIndex = Math.max(
    rowBinarySearch(rows, scrollTop - top - VS_PAGE_HEIGHT) -
      ADDITONAL_INDEX -
      1,
    0
  );
  const lastIndex = rowBinarySearch(
    rows,
    scrollableHeight + getStickyOffset(scrollTop, top) + VS_PAGE_HEIGHT,
    firstIndex
  );
  return rows.slice(firstIndex, lastIndex + ADDITONAL_INDEX);
}

/**
 * 行二分查找函数
 * @param arr 数组，包含网格行
 * @param val 要查找的值
 * @param start 开始索引，默认为0
 * @param end 结束索引，默认为数组长度减1
 * @returns 返回查找到的索引
 */
function rowBinarySearch(
  arr: GridRow[],
  val: number,
  start = 0,
  end = arr.length - 1
): number {
  const mid = (start + end) >> 1;
  if (mid < 0) return 0;
  if (start >= end) return mid;
  return val < arr[mid].top
    ? rowBinarySearch(arr, val, start, mid)
    : rowBinarySearch(arr, val, mid + 1, end);
}

function colBinarySearch(
  arr: GridColumn[],
  val: number,
  start = 0,
  end = arr.length - 1
): number {
  const mid = (start + end) >> 1;
  if (mid < 0) return 0;
  if (start >= end) return mid;
  return val < arr[mid].left
    ? colBinarySearch(arr, val, start, mid)
    : colBinarySearch(arr, val, mid + 1, end);
}
