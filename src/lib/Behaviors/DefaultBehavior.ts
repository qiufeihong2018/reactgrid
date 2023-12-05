import {
  PointerLocation,
  Location,
  handleKeyUp,
  handleCompositionEnd,
  handleDoubleClick,
  getScrollOfScrollableElement,
  isSelectionKey,
} from "../../core";
import {
  KeyboardEvent,
  ClipboardEvent,
  PointerEvent,
} from "../Model/domEventsTypes";
import { CellSelectionBehavior } from "./CellSelectionBehavior";
import { Behavior } from "../Model/Behavior";
import { handleKeyDown } from "../Functions/handleKeyDown";
import { State } from "../Model/State";
import { ColumnSelectionBehavior } from "./ColumnSelectionBehavior";
import { RowSelectionBehavior } from "./RowSelectionBehavior";
import { FillHandleBehavior } from "./FillHandleBehavior";
import { handleContextMenu } from "../Functions/handleContextMenu";
import { ResizeColumnBehavior } from "./ResizeColumnBehavior";
import { ColumnReorderBehavior } from "./ColumnReorderBehavior";
import { RowReorderBehavior } from "./RowReorderBehavior";
import { handleCopy } from "../Functions/handleCopy";
import { handlePaste } from "../Functions/handlePaste";

export class DefaultBehavior extends Behavior {
  handlePointerDown(
    event: PointerEvent,
    location: PointerLocation,
    state: State
  ): State {
    state = {
      ...state,
      currentBehavior: this.getNewBehavior(event, location, state),
      contextMenuPosition: { top: -1, left: -1 },
    };
    return state.currentBehavior.handlePointerDown(
      event,
      location,
      state
    ) as State;
  }

  /**
   * 根据事件、位置和状态获取新的行为
   *
   * @param event - 触发事件
   * @param location - 位置信息
   * @param state - 状态信息
   * @returns 新的行为
   */
  private getNewBehavior(
    event: PointerEvent,
    location: PointerLocation,
    state: State
  ): Behavior {
    // changing behavior will disable all keyboard event handlers
    const target = event.target as HTMLDivElement;

    // 如果是鼠标或触摸事件，并且目标元素是调整列大小的元素
    // 并且位置在第一行，并且可调整的列，并且点击位置在列宽度范围内
    if (
      ((event.pointerType === "mouse" &&
        target.className === "rg-resize-handle") ||
        (event.pointerType === "touch" &&
          (target.className === "rg-touch-resize-handle" ||
            target.className === "rg-resize-handle"))) &&
      location.row.idx === 0 &&
      location.column.resizable &&
      location.cellX >
        location.column.width -
          (state.reactGridElement?.querySelector(".rg-resize-handle")
            ?.clientWidth || 0) -
          getScrollOfScrollableElement(state.scrollableElement).scrollLeft
    ) {
      return new ResizeColumnBehavior();
    } else if (
      // 如果是启用列选择，并且位置在第一行，并且目标元素是选中的列
      // 并且不是选择键的事件，并且选择模式为列，并且该列可以重新排序
      state.enableColumnSelection &&
      location.row.idx === 0 &&
      state.selectedIds.includes(location.column.columnId) &&
      !isSelectionKey(event) &&
      state.selectionMode === "column" &&
      location.column.reorderable
    ) {
      return new ColumnReorderBehavior();
    } else if (
      // 如果是启用列选择，并且位置在第一行，并且目标元素不是列的选择或重新排序元素
      state.enableColumnSelection &&
      location.row.idx === 0 &&
      target.className !== "rg-fill-handle" &&
      target.className !== "rg-touch-fill-handle"
    ) {
      return new ColumnSelectionBehavior();
    } else if (
      // 如果是启用行选择，并且位置在第一列，并且目标元素是选中的行
      // 并且不是选择键的事件，并且选择模式为行，并且该行可以重新排序
      state.enableRowSelection &&
      location.column.idx === 0 &&
      state.selectedIds.includes(location.row.rowId) &&
      !isSelectionKey(event) &&
      state.selectionMode === "row" &&
      location.row.reorderable
    ) {
      return new RowReorderBehavior();
    } else if (
      // 如果是启用行选择，并且位置在第一列，并且目标元素不是行的选择或重新排序元素
      state.enableRowSelection &&
      location.column.idx === 0 &&
      target.className !== "rg-fill-handle" &&
      target.className !== "rg-touch-fill-handle"
    ) {
      return new RowSelectionBehavior();
    } else if (
      ((event.pointerType === "mouse" &&
        target.className === "rg-fill-handle") ||
        (event.pointerType === "touch" &&
          (target.className === "rg-touch-fill-handle" ||
            target.className === "rg-fill-handle"))) &&
      state.enableFillHandle
    ) {
      return new FillHandleBehavior();
    } else {
      return new CellSelectionBehavior();
    }
  }

  handleContextMenu(event: PointerEvent, state: State): State {
    return handleContextMenu(event, state);
  }

  handleDoubleClick(
    event: PointerEvent,
    location: Location,
    state: State
  ): State {
    return handleDoubleClick(event, location, state) as State;
  }

  handleKeyDown(event: KeyboardEvent, state: State): State {
    return handleKeyDown(state as State, event);
  }

  handleKeyUp(event: KeyboardEvent, state: State): State {
    return handleKeyUp(event, state) as State;
  }

  handleCompositionEnd(event: CompositionEvent, state: State): State {
    return handleCompositionEnd(event, state) as State;
  }

  handleCopy(event: ClipboardEvent, state: State): State {
    return handleCopy(event, state);
  }

  handlePaste(event: ClipboardEvent, state: State): State {
    return handlePaste(event, state);
  }

  handleCut(event: ClipboardEvent, state: State): State {
    return handleCopy(event, state, true);
  }
}
