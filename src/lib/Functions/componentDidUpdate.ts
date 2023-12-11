import { Direction, Location } from "./../Model/InternalModel";
import { State } from "./../Model/State";
import { ReactGridProps } from "./../Model/PublicModel";
import { areLocationsEqual } from "./areLocationsEqual";
import { getReactGridOffsets, getStickyOffset } from "./elementSizeHelpers";
import {
  getScrollOfScrollableElement,
  getTopScrollableElement,
} from "./scrollHelpers";
import {
  getCalculatedScrollLeftValueToLeft,
  getCalculatedScrollLeftValueToRight,
  getCalculatedScrollTopValueToBottom,
  getCalculatedScrollTopValueToTop,
  getVisibleScrollAreaHeight,
  getVisibleScrollAreaWidth,
  isBottomCellAllVisible,
  isFocusLocationOnLeftSticky,
  isFocusLocationOnTopSticky,
  isLeftCellAllVisible,
  isRightCellAllVisible,
  isTopCellAllVisible,
  scrollIntoView,
} from "./scrollIntoView";
import { ResizeColumnBehavior } from "../Behaviors/ResizeColumnBehavior";

//TODO what about initialFocusLocation and focusLocation set by props
/**
 * 在组件更新后调用
 * @param prevProps 上一次的ReactGridProps参数
 * @param prevState 上一次的State状态
 * @param state 当前的State状态
 */
export function componentDidUpdate(
  prevProps: ReactGridProps,
  prevState: State,
  state: State
): void {
  const location = state.focusedLocation;
  if (location) {
    const shouldChangeScroll =
      !areLocationsEqual(location, prevState.focusedLocation) &&
      !(state.currentBehavior instanceof ResizeColumnBehavior);
    const wasCellEditorOpened =
      state.currentlyEditedCell !== undefined &&
      state.currentlyEditedCell !== prevState.currentlyEditedCell;
    if (shouldChangeScroll || wasCellEditorOpened) {
      const { left, top } = scrollCalculator(state, location);
      scrollIntoView(state, top, left);
    }
    //TODO 尝试在选中范围变化后改变滚动
    // const activeSelectedRange = getProActiveSelectedRange(prevState);
    // if (activeSelectedRange) {
    //     const shouldChangeScrollForActiveSelectedRangeChange = areRangeIsChanging(state, prevState);
    //     if (shouldChangeScrollForActiveSelectedRangeChange && (state.selectedRanges[0].rows.length !== 1 || state.selectedRanges[0].columns.length !== 1)) {
    //         // do something
    //     }
    // }
  }
}

/**
 * 计算滚动位置
 * @param state 应用状态
 * @param location 地点
 * @param direction 方向，默认为"both"
 * @returns 滚动位置的top和left值
 */
export function scrollCalculator(
  state: State,
  location: Location,
  direction: Direction = "both"
): { top: number; left: number } {
  const top = getScrollTop(state, location, direction === "horizontal");
  const left = getScrollLeft(state, location, direction === "vertical");
  return { top, left };
}

/**
 * 获取滚动条的垂直滚动距离
 *
 * @param state - 应用状态对象
 * @param location - 位置对象
 * @param dontChange - 是否允许改变滚动条位置
 * @returns 滚动条的垂直滚动距离
 */
export function getScrollTop(
  state: State,
  location: Location,
  dontChange: boolean
): number {
  const { stickyTopRange, stickyBottomRange } = state.cellMatrix.ranges;
  const { scrollTop } = getScrollOfScrollableElement(state.scrollableElement);
  const wholeStickyHeight = stickyTopRange.height + stickyBottomRange.height;
  const visibleScrollAreaHeight = getVisibleScrollAreaHeight(
    state,
    wholeStickyHeight
  );
  const { top } = getReactGridOffsets(state);
  const topStickyOffset = getStickyOffset(scrollTop, top);
  const row = location.row;
  if (dontChange || !row) {
    return scrollTop;
  }
  const additionalPixelOnScrollingOnBody = isLocationOnScrollableBody(
    state,
    location
  )
    ? 1
    : 0;
  if (
    isFocusLocationOnTopSticky(state, location) ||
    isFocusLocationOnBottomSticky(state, location)
  ) {
    return scrollTop;
  } else if (
    isBottomCellAllVisible(
      state,
      location,
      visibleScrollAreaHeight + additionalPixelOnScrollingOnBody
    )
  ) {
    return getCalculatedScrollTopValueToBottom(
      location,
      visibleScrollAreaHeight - 1 - additionalPixelOnScrollingOnBody,
      scrollTop,
      topStickyOffset
    );
  } else if (isTopCellAllVisible(state, location)) {
    return getCalculatedScrollTopValueToTop(
      location,
      scrollTop,
      topStickyOffset
    );
  }
  return scrollTop;
}

/**
 * 获取滚动位置
 *
 * @param state - 应用状态
 * @param location - 位置
 * @param dontChange - 是否禁止改变
 * @returns 滚动位置
 */
export function getScrollLeft(
  state: State,
  location: Location,
  dontChange: boolean
): number {
  const { stickyLeftRange, stickyRightRange } = state.cellMatrix.ranges;
  const { scrollLeft } = getScrollOfScrollableElement(state.scrollableElement);
  const wholeStickyWidth = stickyLeftRange.width + stickyRightRange.width;
  const visibleScrollAreaWidth = getVisibleScrollAreaWidth(
    state,
    wholeStickyWidth
  );
  const { left } = getReactGridOffsets(state);
  const leftStickyOffset = getStickyOffset(scrollLeft, left);
  const column = location.column;
  if (dontChange || !column) {
    return scrollLeft;
  }
  const additionalPixelOnScrollingOnBody = isLocationOnScrollableBody(
    state,
    location
  )
    ? 1
    : 0;
  if (
    isFocusLocationOnLeftSticky(state, location) ||
    isFocusLocationOnRightSticky(state, location)
  ) {
    return scrollLeft;
  } else if (
    isRightCellAllVisible(
      state,
      location,
      visibleScrollAreaWidth + additionalPixelOnScrollingOnBody
    )
  ) {
    return getCalculatedScrollLeftValueToRight(
      location,
      visibleScrollAreaWidth - 1 - additionalPixelOnScrollingOnBody,
      scrollLeft,
      leftStickyOffset
    );
  } else if (isLeftCellAllVisible(state, location)) {
    return getCalculatedScrollLeftValueToLeft(
      location,
      scrollLeft,
      leftStickyOffset
    );
  }
  return scrollLeft;
}

/**
 * 检查焦点位置是否在右侧吸附范围内
 *
 * @param state - 状态对象
 * @param location - 地点对象
 * @returns 如果焦点位置在右侧吸附范围内，则返回true；否则返回false
 */
function isFocusLocationOnRightSticky(state: State, location: Location) {
  const { stickyRightRange } = state.cellMatrix.ranges;
  const column = location.column;
  return (
    stickyRightRange.columns.length > 0 &&
    column.idx >= stickyRightRange.first.column.idx
  );
}

/**
 * 检查焦点位置是否在底部 sticky 范围内
 * @param state 状态对象
 * @param location 位置对象
 * @returns 如果焦点位置在底部 sticky 范围内，则返回 true，否则返回 false
 */
function isFocusLocationOnBottomSticky(state: State, location: Location) {
  const { stickyBottomRange } = state.cellMatrix.ranges;
  const row = location.row;
  return (
    stickyBottomRange.rows.length > 0 &&
    row.idx >= stickyBottomRange.first.row.idx
  );
}

/**
 * 判断给定的位置是否位于可滚动的元素体内
 *
 * @param state - 状态对象
 * @param location - 位置对象
 * @returns 如果位置位于可滚动的元素体内且该元素是页面顶部的可滚动元素，则返回true；否则返回false
 */
function isLocationOnScrollableBody(state: State, location: Location) {
  return (
    state.cellMatrix.scrollableRange.contains(location) &&
    state.scrollableElement === getTopScrollableElement()
  );
}
