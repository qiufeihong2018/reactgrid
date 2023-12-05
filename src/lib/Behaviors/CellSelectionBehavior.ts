import {
  Location,
  isSelectionKey,
  isOnClickableArea,
  getCompatibleCellAndTemplate,
  CellMatrix,
  PointerLocation,
} from "../../core";
import { PointerEvent } from "../Model/domEventsTypes";
import {
  updateActiveSelectedRange,
  selectRange,
} from "../Functions/selectRange";
import { Behavior } from "../Model/Behavior";
import { State } from "../Model/State";
import { focusLocation } from "../Functions/focusLocation";
import { handleContextMenu } from "../Functions/handleContextMenu";

// 单元格选择行为
export class CellSelectionBehavior extends Behavior {
  // 处理指针按下事件
  handlePointerDown(
    event: PointerEvent,
    location: Location,
    state: State
  ): State {
    if ((event.target as HTMLDivElement).className === "reactgrid-content")
      return state;
    if (state.enableRangeSelection && event.shiftKey && state.focusedLocation) {
      const range = state.cellMatrix.getRange(state.focusedLocation, location);
      if (isSelectionKey(event) && state.selectionMode === "range") {
        return updateActiveSelectedRange(state, range);
      } else {
        return selectRange(state, range, false);
      }
    } else if (state.enableRangeSelection && isSelectionKey(event)) {
      const pointedRangeIdx = state.selectedRanges.findIndex((range) =>
        range.contains(location)
      );
      const pointedRange = state.selectedRanges[pointedRangeIdx];
      const { cellTemplate } = getCompatibleCellAndTemplate(state, location);
      if (pointedRange) {
        state = focusLocation(state, location, false);
        state = { ...state, activeSelectedRangeIdx: pointedRangeIdx };
      } else if (!cellTemplate.isFocusable) {
        const range = state.cellMatrix.getRange(location, location);
        state = selectRange(state, range, true);
        state = focusLocation(state, location, false);
      }
    } else {
      state = focusLocation(state, location);
    }
    return state;
  }

  // 处理指针进入事件
  handlePointerEnter(
    event: PointerEvent,
    location: Location,
    state: State
  ): State {
    if (
      !state.enableRangeSelection ||
      !state.focusedLocation ||
      (event.target as HTMLDivElement).className === "reactgrid-content"
    ) {
      // 修复FF滚动问题
      return state;
    }
    const range = state.cellMatrix.getRange(state.focusedLocation, location);
    if (state.selectionMode === "range" && isOnClickableArea(event, state)) {
      return updateActiveSelectedRange(state, range);
    } else {
      return selectRange(state, range, false);
    }
  }

  // 处理指针抬起事件
/**
   * 处理鼠标抬起事件
   * @param event 鼠标事件对象
   * @param location 鼠标位置对象
   * @param state 组件状态对象
   * @returns 更新后的组件状态对象
   */
  handlePointerUp(event: MouseEvent | PointerEvent, location: PointerLocation, state: State<CellMatrix, Behavior<MouseEvent | PointerEvent>>): State<CellMatrix, Behavior<MouseEvent | PointerEvent>> {
      if (state.props?.onSelectionChanging && !state.props.onSelectionChanging(state.selectedRanges)) {
          // 取消最近一次选择
          const filteredRanges = [
              ...state.selectedRanges,
          ].filter((_, index) => index !== state.activeSelectedRangeIdx);

          return {
              ...state,
              selectedRanges: filteredRanges,
              activeSelectedRangeIdx: filteredRanges.length - 1,
          };
      }

      state.props?.onSelectionChanged && state.props.onSelectionChanged(state.selectedRanges);

      return state;
  }

  // 处理右键单击事件
  handleContextMenu(event: PointerEvent, state: State): State {
    return handleContextMenu(event, state);
  }
}