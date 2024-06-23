import { State } from "../Model/State";
import {
  getScrollOfScrollableElement,
  getTopScrollableElement,
} from "./scrollHelpers";
import { isIOS } from "./operatingSystem";

// TODO replace any with exact type: HTMLElement | (Window & typeof globalThis)
export function getSizeOfElement(
  element: HTMLElement | (Window & typeof globalThis) | undefined
): { width: number; height: number } {
  if (!element) {
    return { width: 0, height: 0 };
  }
  const width =
    element instanceof HTMLElement
      ? element.clientWidth
      : isIOS()
      ? window.innerWidth
      : document.documentElement.clientWidth; // TODO check other mobile devices
  const height =
    element instanceof HTMLElement
      ? element.clientHeight
      : isIOS()
      ? window.innerHeight
      : document.documentElement.clientHeight;
  return { width, height };
}

/**
 * 获取React网格元素的偏移量。
 *
 * 该函数通过计算网格元素相对于可滚动元素的位置，来确定网格元素的左上角偏移量。
 * 这对于在滚动时正确定位网格元素非常有用，特别是当网格元素嵌套在可滚动元素内部时。
 *
 * @param state 包含网格和可滚动元素状态的对象。
 * @returns 返回一个对象，包含网格元素的左上角相对于视口的偏移量。
 * @throws 如果state.reactGridElement未初始化，则抛出错误。
 */
export function getReactGridOffsets(state: State): {
  left: number;
  top: number;
} {
  // 获取可滚动元素的滚动位置
  const { scrollLeft, scrollTop } = getScrollOfScrollableElement(
    state.scrollableElement
  );
  // 确保网格元素已经初始化
  if (!state.reactGridElement) {
    throw new Error(
      `"state.reactGridElement" field should be initiated before calling "getBoundingClientRect()"`
    );
  }
  // 获取网格元素的边界信息
  const { left: leftReactGrid, top: topReactGrid } =
    state.reactGridElement.getBoundingClientRect();
  // 计算网格元素相对于视口的左上角偏移量
  let left = leftReactGrid + scrollLeft,
    top = topReactGrid + scrollTop;
  // 如果可滚动元素不是顶级滚动元素，调整偏移量以考虑外层滚动的影响
  if (
    state.scrollableElement !== undefined &&
    state.scrollableElement !== getTopScrollableElement()
  ) {
    // 获取可滚动元素的边界信息
    const { left: leftScrollable, top: topScrollable } = (
      state.scrollableElement as HTMLElement
    ).getBoundingClientRect();
    // 调整偏移量以消除外层滚动的影响
    left -= leftScrollable;
    top -= topScrollable;
  }
  // 返回计算得到的偏移量
  return { left, top };
}

export function getVisibleSizeOfReactGrid(state: State): {
  width: number;
  height: number;
  visibleOffsetRight: number;
  visibleOffsetBottom: number;
} {
  const { scrollLeft, scrollTop } = getScrollOfScrollableElement(
    state.scrollableElement
  );
  const { width: widthOfScrollableElement, height: heightOfScrollableElement } =
    getSizeOfElement(state.scrollableElement);
  const { left, top } = getReactGridOffsets(state);

  const scrollBottom = scrollTop + heightOfScrollableElement,
    reactGridBottom = top + state.cellMatrix.height,
    visibleTop = top < scrollTop ? scrollTop : top,
    visibleBottom =
      reactGridBottom > scrollBottom ? scrollBottom : reactGridBottom;

  const scrollRight = scrollLeft + widthOfScrollableElement,
    reactGridRight = left + state.cellMatrix.width,
    visibleLeft = left < scrollLeft ? scrollLeft : left,
    visibleRight = reactGridRight > scrollRight ? scrollRight : reactGridRight;

  const width = Math.max(visibleRight - visibleLeft, 0),
    height = Math.max(visibleBottom - visibleTop, 0);
  const visibleOffsetRight = scrollRight - visibleRight,
    visibleOffsetBottom = scrollBottom - visibleBottom;
  return { width, height, visibleOffsetRight, visibleOffsetBottom };
}

export const getStickyOffset = (scroll: number, offset: number): number =>
  scroll > offset ? scroll - offset : 0;
