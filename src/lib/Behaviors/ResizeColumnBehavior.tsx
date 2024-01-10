import React from "react";
import {
  Direction,
  GridColumn,
  PointerLocation,
  Range,
  getScrollOfScrollableElement,
  getReactGridOffsets,
  getStickyOffset,
  getVisibleSizeOfReactGrid,
  CellMatrix,
} from "../../core";
import { PointerEvent } from "../Model/domEventsTypes";
import { State } from "../Model/State";
import { Behavior } from "../Model/Behavior";
import { ResizeHint } from "../Components/ResizeHint";

export class ResizeColumnBehavior extends Behavior {
  // TODO min / max column with on column object
  private resizedColumn!: GridColumn;
  private initialLocation!: PointerLocation;
  autoScrollDirection: Direction = "horizontal";
  isInScrollableRange!: boolean;
  /**
   * 处理指针按下事件
   * @param event - PointerEvent对象
   * @param location - PointerLocation对象
   * @param state - State对象
   * @returns 修改后的State对象
   */
  handlePointerDown(
    event: PointerEvent,
    location: PointerLocation,
    state: State
  ): State {
    this.initialLocation = location;
    this.resizedColumn = location.column;
    this.isInScrollableRange = state.cellMatrix.scrollableRange.columns.some(
      (c) => c.idx === this.resizedColumn.idx
    );
    return state;
  }
  /**
   * 当指针移动时处理函数
   * @param event - PointerEvent对象，表示指针事件
   * @param location - PointerLocation对象，表示指针位置
   * @param state - State对象，表示当前状态
   * @returns 更新后的状态
   */
  handlePointerMove(
    event: PointerEvent,
    location: PointerLocation,
    state: State
  ): State {
    let linePosition = location.viewportX;
    if (
      !(
        (location.column.idx === this.resizedColumn.idx &&
          location.cellX >
            (state.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH)) ||
        location.column.idx > this.resizedColumn.idx
      )
    ) {
      const offset = this.getLinePositionOffset(state);
      linePosition =
        (state.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH) +
        this.resizedColumn.left +
        offset;
    }
    return { ...state, linePosition, lineOrientation: "vertical" };
  }
  /**
   * 处理鼠标抬起事件
   *
   * @param event - PointerEvent对象
   * @param location - PointerLocation对象
   * @param state - 状态对象
   * @returns 状态对象
   */
  handlePointerUp(
    event: PointerEvent,
    location: PointerLocation,
    state: State
  ): State {
    const newWidth =
      this.resizedColumn.width +
      location.viewportX -
      this.initialLocation.viewportX;
    if (state.props?.onColumnResized) {
      const newColWidth =
        newWidth >= (state.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH)
          ? newWidth
          : state.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH;
      state.props.onColumnResized(
        this.resizedColumn.columnId,
        newColWidth,
        state.selectedIds
      );
    }
    let focusedLocation = state.focusedLocation;
    if (
      focusedLocation !== undefined &&
      this.resizedColumn.columnId === focusedLocation.column.idx
    ) {
      const column = { ...focusedLocation.column, width: newWidth };
      focusedLocation = { ...focusedLocation, column };
    }
    return { ...state, linePosition: -1, focusedLocation };
  }

  // 在具有最高优先级的面板上渲染ResizeHint
  renderPanePart(state: State, pane: Range): React.ReactNode {
    const offset = this.getLinePositionOffset(state);

    // 如果初始位置在面板内，则渲染ResizeHint
    return (
      pane.contains(this.initialLocation) && (
        <ResizeHint
          left={this.resizedColumn.left}
          linePosition={state.linePosition}
          offset={offset}
        />
      )
    );
  }
  /**
   * 获取行位置偏移量
   * @param state - 状态对象
   * @returns 偏移量
   */
  getLinePositionOffset(state: State): number {
    const { scrollLeft } = getScrollOfScrollableElement(
      state.scrollableElement
    );
    const { left } = getReactGridOffsets(state);
    const leftStickyOffset = getStickyOffset(scrollLeft, left);
    const rightStickyOffset =
      getVisibleSizeOfReactGrid(state).width +
      leftStickyOffset -
      state.cellMatrix.ranges.stickyRightRange.width;
    let offset = 0;
    if (
      state.cellMatrix.scrollableRange.columns.some(
        (c) => c.idx === this.resizedColumn.idx
      )
    ) {
      offset = state.cellMatrix.ranges.stickyLeftRange.width;
    } else if (
      state.cellMatrix.ranges.stickyRightRange.columns.some(
        (c) => c.idx === this.resizedColumn.idx
      )
    ) {
      offset = rightStickyOffset;
    } else {
      offset = scrollLeft;
    }
    return offset;
  }
}
