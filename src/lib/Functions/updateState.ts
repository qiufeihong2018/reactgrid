import { GridRow, GridColumn } from "../../core";
import { State } from "../Model/State";
import { newLocation } from "./newLocation";

/**
 * 更新选中的行
 * @param state 状态对象
 * @returns 更新后的状态对象
 */
export function updateSelectedRows(state: State): State {
  const firstCol = state.cellMatrix.first.column; // 获取第一行第一列的坐标
  const lastCol = state.cellMatrix.last.column; // 获取最后一行最后一列的坐标
  // TODO 对于大的表格，这个过滤操作非常低效
  const updatedRows = state.cellMatrix.rows // 获取所有的行
    .filter((r) => state.selectedIds.includes(r.rowId)) // 筛选出包含在选中的行Id中的行
    .sort((a, b) => a.idx - b.idx); // 对筛选出的行按照索引排序
  const rows = groupedRows(updatedRows); // 对筛选出的行进行分组
  const ranges = rows.map((row) =>
    state.cellMatrix.getRange(
      newLocation(row[0], firstCol), // 获取当前行第一列的坐标
      newLocation(row[row.length - 1], lastCol) // 获取当前行最后一列的坐标
    )
  );
  let activeSelectedRangeIdx = state.selectedRanges.length - 1; // 记录当前激活的选中范围的索引

  if (state.focusedLocation) {
    ranges.forEach((range, idx) => {
      range.rows.forEach((row) => {
        if (state.focusedLocation?.row.rowId === row.rowId) {
          activeSelectedRangeIdx = idx; // 如果当前行的rowId与焦点行的rowId相等，则更新activeSelectedRangeIdx为对应的索引
        }
      });
    });
  }

  return {
    ...state,
    selectionMode: "row", // 设置选择模式为行选择
    activeSelectedRangeIdx, // 激活的选中范围的索引
    selectedRanges: [...ranges], // 更新选中的范围
    selectedIndexes: updatedRows.map((row) => row.idx), // 更新选中的索引
    selectedIds: updatedRows.map((row) => row.rowId), // 更新选中的行Id
  };
}

export function updateSelectedColumns(state: State): State {
  const firstRow = state.cellMatrix.first.row;
  const lastRow = state.cellMatrix.last.row;
  // TODO this filter is very inefficient for big tables
  const updatedColumns = state.cellMatrix.columns
    .filter((r) => state.selectedIds.includes(r.columnId))
    .sort((a, b) => a.idx - b.idx);
  const columns = groupedColumns(updatedColumns);
  const ranges = columns.map((arr) =>
    state.cellMatrix.getRange(
      newLocation(firstRow, arr[0]),
      newLocation(lastRow, arr[arr.length - 1])
    )
  );
  let activeSelectedRangeIdx = state.selectedRanges.length - 1;

  if (state.focusedLocation) {
    ranges.forEach((range, idx) => {
      range.columns.forEach((col) => {
        if (state.focusedLocation?.column.columnId === col.columnId) {
          activeSelectedRangeIdx = idx;
        }
      });
    });
  }

  return {
    ...state,
    selectionMode: "column",
    activeSelectedRangeIdx,
    selectedRanges: [...ranges],
    selectedIndexes: updatedColumns.map((col) => col.idx),
    selectedIds: updatedColumns.map((col) => col.columnId),
  };
}

const groupedRows = (array: GridRow[]) => {
  const grouped: GridRow[][] = [];
  let sortIndex = 0;
  array.forEach((current: GridRow, index) => {
    if (!array[index - 1]) {
      grouped.push([current]);
      return;
    }
    const prev: GridRow = array[index - 1];
    if (current.idx - prev.idx === 1) {
      if (!grouped[sortIndex]) {
        grouped.push([prev, current]);
      } else {
        grouped[sortIndex].push(current);
      }
    } else {
      grouped.push([current]);
      sortIndex += 1;
    }
  });
  return grouped;
};

const groupedColumns = (array: GridColumn[]) => {
  const grouped: GridColumn[][] = [];
  let sortIndex = 0;
  array.forEach((current: GridColumn, index) => {
    if (!array[index - 1]) {
      grouped.push([current]);
      return;
    }
    const prev: GridColumn = array[index - 1];
    if (current.idx - prev.idx === 1) {
      if (!grouped[sortIndex]) {
        grouped.push([prev, current]);
      } else {
        grouped[sortIndex].push(current);
      }
    } else {
      grouped.push([current]);
      sortIndex += 1;
    }
  });
  return grouped;
};
