import { Cell, CellTemplate, Compatible } from "../Model/PublicModel";
import { State } from "../Model/State";
import { Location } from "../Model/InternalModel";

/**
 * 根据给定的状态和位置获取兼容的单元格和单元格模板
 * @param state 状态对象
 * @param location 位置对象
 * @returns 包含兼容的单元格和单元格模板的对象
 */
export function getCompatibleCellAndTemplate(
  state: State,
  location: Location
): { cell: Compatible<Cell>; cellTemplate: CellTemplate } {
  try {
    const rawCell = state.cellMatrix.getCell(location);
    if (!rawCell) throw new TypeError(`Cell doesn't exists at location`);
    if (!rawCell.type) throw new Error("Cell is missing type property");
    const cellTemplate = state.cellTemplates[rawCell.type];
    if (!cellTemplate)
      throw new Error(`CellTemplate missing for type '${rawCell.type}'`);
    const cell = cellTemplate.getCompatibleCell({
      ...rawCell,
      type: rawCell.type,
    });
    if (!cell) throw new Error("Cell validation failed");
    return { cell, cellTemplate };
  } catch (e) {
    throw new Error(
      `${(e as Error).message} (rowId: '${location.row.rowId}', columnId: '${
        location.column.columnId
      }')`
    );
  }
}
