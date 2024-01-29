import { State } from "../Model/State";
import { CellLocation } from "../../core";

// TODO: simplify/optimize if possible
/**
 * 获取已选择的单元格位置
 * @param state - 状态对象
 * @returns 选择的单元格位置二维数组
 */
export function getSelectedLocations(state: State): Array<CellLocation[]> {
  return state.selectedRanges.map((selectedRange) => {
    return selectedRange.rows.flatMap((row) => {
      return selectedRange.columns.map<CellLocation>((col) => ({
        columnId: col.columnId,
        rowId: row.rowId,
      }));
    });
  });
}
