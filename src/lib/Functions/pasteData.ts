import { Cell, Compatible } from "../Model/PublicModel";
import { State } from "../Model/State";
import { Location } from "../Model/InternalModel";
import { tryAppendChangeHavingGroupId } from "./tryAppendChangeHavingGroupId";
import { getActiveSelectedRange } from "./getActiveSelectedRange";
import { newLocation } from "./newLocation";
/**
 * 将数据粘贴到状态中的单元格
 * @param state - 状态对象
 * @param rows - 待粘贴的数据行
 * @returns - 更新后的状态对象
 */
export function pasteData(state: State, rows: Compatible<Cell>[][]): State {
  const activeSelectedRange = getActiveSelectedRange(state);
  if (rows.length === 1 && rows[0].length === 1) {
    // 如果待粘贴的单元格为一个单细胞，则粘贴到活动选择范围的活动单元格中
    activeSelectedRange.rows.forEach((row) =>
      activeSelectedRange.columns.forEach((column) => {
        state = tryAppendChangeHavingGroupId(
          state,
          newLocation(row, column),
          rows[0][0]
        ) as State;
      })
    );
  } else {
    let lastLocation: Location | undefined;
    const cellMatrix = state.cellMatrix;
    rows.forEach((row, ri) => {
      console.log("row", row);
      row.forEach((cell, ci) => {
        console.log("cell", cell);
        const rowIdx = activeSelectedRange.first.row.idx + ri;
        const columnIdx = activeSelectedRange.first.column.idx + ci;
        if (
          rowIdx <= cellMatrix.last.row.idx &&
          columnIdx <= cellMatrix.last.column.idx
        ) {
          // 将粘贴的单元格添加到状态中的单元格矩阵中
          lastLocation = cellMatrix.getLocation(rowIdx, columnIdx);
          state = tryAppendChangeHavingGroupId(
            state,
            lastLocation,
            cell
          ) as State;
        } else {
          // 扩展单元格矩阵
          cellMatrix.extend(rowIdx, columnIdx);
          // 将粘贴的单元格添加到状态中的单元格矩阵中
          lastLocation = cellMatrix.getLocation(rowIdx, columnIdx);
          state = tryAppendChangeHavingGroupId(
            state,
            lastLocation,
            cell
          ) as State;
        }
      });
    });
    if (!lastLocation) {
      return state;
    }

    // 获取新选择范围
    const newRange = cellMatrix.getRange(
      activeSelectedRange.first,
      lastLocation
    );

    if (
      state?.props?.onSelectionChanging &&
      !state.props.onSelectionChanging([newRange])
    ) {
      return state;
    }

    // 更新选择范围
    state?.props?.onSelectionChanged &&
      state.props.onSelectionChanged([newRange]);

    return {
      ...state,
      selectedRanges: [
        cellMatrix.getRange(activeSelectedRange.first, lastLocation),
      ],
      activeSelectedRangeIdx: 0,
    };
  }
  return state;
}
