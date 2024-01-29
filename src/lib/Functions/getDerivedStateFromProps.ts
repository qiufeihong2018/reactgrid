import { State } from "../Model/State";
import { ReactGridProps, CellLocation } from "../Model/PublicModel";
import { CellMatrixBuilder } from "../Model/CellMatrixBuilder";
import { defaultCellTemplates } from "./defaultCellTemplates";
import { focusLocation } from "./focusLocation";
import { recalcVisibleRange } from "./recalcVisibleRange";
import { updateResponsiveSticky } from "./updateResponsiveSticky";
import { updateSelectedColumns, updateSelectedRows } from "./updateState";
import { resetSelection } from "./selectRange";

// TODO: rewrite without division
/**
 * 从属性和状态中获取派生状态
 * @param props React网格属性
 * @param state 状态
 * @returns 更新后的状态
 */
export function getDerivedStateFromProps(
  props: ReactGridProps,
  state: State
): State {
  const stateDeriverWithProps = stateDeriver(props);

  const hasHighlightsChanged = highlightsHasChanged(props, state);

  if (hasHighlightsChanged) {
    state = stateDeriverWithProps(state)(appendHighlights);
  }
  state = stateDeriverWithProps(state)(updateStateProps);

  state = stateDeriverWithProps(state)(appendCellTemplates);

  state = stateDeriverWithProps(state)(appendGroupIdRender);

  const hasChanged = dataHasChanged(props, state);

  state = stateDeriverWithProps(state)(updateResponsiveSticky);

  state = stateDeriverWithProps(state)(disableVirtualScrolling);

  if (hasChanged) {
    // 如果状态有改变
    state = stateDeriverWithProps(state)(updateCellMatrix);
    // 使用带有属性的状态派生函数更新状态
  }

  state = stateDeriverWithProps(state)(updateSelections);

  state = stateDeriverWithProps(state)(updateFocusedLocation);

  if (hasChanged) {
    state = stateDeriverWithProps(state)(updateVisibleRange);
  }

  state = stateDeriverWithProps(state)(setInitialFocusLocation);

  if (areFocusesDiff(props, state)) {
    state = stateDeriverWithProps(state)(setFocusLocation);
  }

  state = stateDeriverWithProps(state)(appendStateFields);

  return state;
}

function updateSelections(props: ReactGridProps, state: State): State {
  if (state.selectionMode === "row" && state.selectedIds.length > 0) {
    state = updateSelectedRows(state);
  } else if (state.selectionMode === "column" && state.selectedIds.length > 0) {
    state = updateSelectedColumns(state);
  } else {
    state = {
      ...state,
      selectedRanges: [...state.selectedRanges].map((range) =>
        state.cellMatrix.validateRange(range)
      ),
    };
  }
  return state;
}

function appendStateFields(props: ReactGridProps, state: State): State {
  return {
    ...state,
    enableFillHandle: !!props.enableFillHandle,
    enableRangeSelection: !!props.enableRangeSelection,
    enableColumnSelection: !!props.enableColumnSelection,
    enableRowSelection: !!props.enableRowSelection,
  };
}

export const areFocusesDiff = (
  props: ReactGridProps,
  state: State
): boolean => {
  return (
    props.focusLocation?.columnId !== state.focusedLocation?.column.columnId ||
    props.focusLocation?.rowId !== state.focusedLocation?.row.rowId ||
    (props.stickyRightColumns !== undefined &&
      props.stickyRightColumns !== state.rightStickyColumns) ||
    (props.stickyBottomRows !== undefined &&
      props.stickyBottomRows !== state.bottomStickyRows)
  );
};
// 导出stateDeriver函数
export const stateDeriver =
  (props: ReactGridProps) =>
  (state: State) =>
  (fn: (props: ReactGridProps, state: State) => State): State =>
    fn(props, state);
/**
 * 判断数据是否发生改变
 * @param props - React网格的属性
 * @param state - 状态
 * @returns 如果数据发生改变返回true，否则返回false
 */
export const dataHasChanged = (props: ReactGridProps, state: State): boolean =>
  !state.cellMatrix ||
  props !== state.cellMatrix.props ||
  (props.stickyLeftColumns !== undefined &&
    props.stickyLeftColumns !== state.leftStickyColumns) ||
  (props.stickyTopRows !== undefined &&
    props.stickyTopRows !== state.topStickyRows) ||
  (props.stickyBottomRows !== undefined &&
    props.stickyBottomRows !== state.bottomStickyRows) ||
  (props.stickyRightColumns !== undefined &&
    props.stickyRightColumns !== state.rightStickyColumns);

export const highlightsHasChanged = (
  props: ReactGridProps,
  state: State
): boolean => props.highlights !== state.props?.highlights;

export function updateStateProps(props: ReactGridProps, state: State): State {
  if (state.props !== props) {
    state = { ...state, props };
  }
  return state;
}

/**
 * 更新单元格矩阵
 *
 * @param props - React网格的属性
 * @param state - 状态对象
 * @returns 更新后的状态对象
 */
function updateCellMatrix(props: ReactGridProps, state: State): State {
  const builder = new CellMatrixBuilder();
  return {
    ...state,
    cellMatrix: builder
      .setProps(props) // 设置builder的props属性
      .fillRowsAndCols({
        // 填充builder的行和列
        leftStickyColumns: state.leftStickyColumns || 0, // 左侧粘性列，如果state.leftStickyColumns为undefined，则为0
        topStickyRows: state.topStickyRows || 0, // 上方粘性行，如果state.topStickyRows为undefined，则为0
        rightStickyColumns: state.rightStickyColumns || 0, // 右侧粘性列，如果state.rightStickyColumns为undefined，则为0
        bottomStickyRows: state.bottomStickyRows || 0, // 下方粘性行，如果state.bottomStickyRows为undefined，则为0
      })
      .setRangesToRenderLookup() // 设置需要渲染的范围的查找表
      .fillSticky({
        // 填充sticky
        leftStickyColumns: state.leftStickyColumns || 0, // 左侧粘性列，如果state.leftStickyColumns为undefined，则为0
        topStickyRows: state.topStickyRows || 0, // 上方粘性行，如果state.topStickyRows为undefined，则为0
        rightStickyColumns: state.rightStickyColumns || 0, // 右侧粘性列，如果state.rightStickyColumns为undefined，则为0
        bottomStickyRows: state.bottomStickyRows || 0, // 下方粘性行，如果state.bottomStickyRows为undefined，则为0
      })
      .fillScrollableRange({
        // 填充可滚动的范围
        leftStickyColumns: state.leftStickyColumns || 0, // 左侧粘性列，如果state.leftStickyColumns为undefined，则为0
        topStickyRows: state.topStickyRows || 0, // 上方粘性行，如果state.topStickyRows为undefined，则为0
        rightStickyColumns: state.rightStickyColumns || 0, // 右侧粘性列，如果state.rightStickyColumns为undefined，则为0
        bottomStickyRows: state.bottomStickyRows || 0, // 下方粘性行，如果state.bottomStickyRows为undefined，则为0
      })
      .setEdgeLocations() // 设置边缘位置
      .getCellMatrix(), // 获取cellMatrix
  };
}

/**
 * 更新焦点位置
 *
 * @param props - React网格组件的属性
 * @param state - 状态对象
 * @returns 更新后的状态对象
 */
export function updateFocusedLocation(
  props: ReactGridProps,
  state: State
): State {
  if (
    state.cellMatrix.columns.length > 0 &&
    state.focusedLocation &&
    !state.currentlyEditedCell
  ) {
    state = {
      ...state,
      focusedLocation: state.cellMatrix.validateLocation(state.focusedLocation),
    };
  }
  return state;
}

function updateVisibleRange(props: ReactGridProps, state: State): State {
  if (state.visibleRange) {
    state = recalcVisibleRange(state);
  }
  return state;
}

export function appendCellTemplates(
  props: ReactGridProps,
  state: State
): State {
  return {
    ...state,
    cellTemplates: { ...defaultCellTemplates, ...props.customCellTemplates },
  };
}

export function appendGroupIdRender(
  props: ReactGridProps,
  state: State
): State {
  return {
    ...state,
    enableGroupIdRender: !!props.enableGroupIdRender,
  };
}

function disableVirtualScrolling(props: ReactGridProps, state: State): State {
  return {
    ...state,
    disableVirtualScrolling: !!props.disableVirtualScrolling,
  };
}

export function appendHighlights(props: ReactGridProps, state: State): State {
  const highlights = props.highlights?.filter(
    (highlight) =>
      state.cellMatrix.rowIndexLookup[highlight.rowId] !== undefined &&
      state.cellMatrix.columnIndexLookup[highlight.columnId] !== undefined
  );
  if (highlights?.length !== props.highlights?.length) {
    console.error('Data inconsistency in ReactGrid "highlights" prop');
  }
  return {
    ...state,
    highlightLocations: highlights || [],
  };
}

export function setInitialFocusLocation(
  props: ReactGridProps,
  state: State
): State {
  const locationToFocus = props.initialFocusLocation;
  const wasFocused = !!state.focusedLocation;

  if (locationToFocus && !state.focusedLocation) {
    if (isLocationToFocusCorrect(state, locationToFocus)) {
      console.error(
        'Data inconsistency in ReactGrid "initialFocusLocation" prop'
      );
    } else {
      const location = state.cellMatrix.getLocationById(
        locationToFocus.rowId,
        locationToFocus.columnId
      );
      state = focusLocation(state, location);
    }
  }

  const location = state.focusedLocation;

  if (!wasFocused && location) {
    state = resetSelection(state, location);
  }

  return state;
}

export function setFocusLocation(props: ReactGridProps, state: State): State {
  const locationToFocus = props.focusLocation;
  const wasFocused = !!state.focusedLocation;

  if (locationToFocus) {
    if (isLocationToFocusCorrect(state, locationToFocus)) {
      console.error('Data inconsistency in ReactGrid "focusLocation" prop');
    } else {
      const location = state.cellMatrix.getLocationById(
        locationToFocus.rowId,
        locationToFocus.columnId
      );
      state = focusLocation(state, location);
    }
  }

  const location = state.focusedLocation;

  if (
    !wasFocused &&
    location &&
    props.focusLocation &&
    state.selectedRanges.length <= 1
  ) {
    state = resetSelection(state, location);
  }

  return state;
}

function isLocationToFocusCorrect(state: State, location: CellLocation) {
  return (
    !(state.cellMatrix.columnIndexLookup[location.columnId] !== undefined) ||
    !(state.cellMatrix.rowIndexLookup[location.rowId] !== undefined)
  );
}
