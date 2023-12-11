import { Cell, CellChange, Compatible } from '../Model/PublicModel';
import { Location } from '../Model/InternalModel';
import { State } from '../Model/State';
import { getCompatibleCellAndTemplate } from './getCompatibleCellAndTemplate';

/**
 * 尝试将更改添加到状态中，更新指定位置的单元格
 * @param state - 状态对象
 * @param location - 单元格的位置
 * @param cell - 要更新的单元格数据
 * @returns 更新后的状态对象
 */
export function tryAppendChange(state: State, location: Location, cell: Compatible<Cell>): State {
    const { cell: previousCell, cellTemplate } = getCompatibleCellAndTemplate(state, location);

    // 如果要更新的单元格与之前的单元格相同或者相同，则不进行更新
    if (previousCell === cell || JSON.stringify(previousCell) === JSON.stringify(cell) || cellTemplate.update === undefined)
        return state;

    // 根据单元格模板的更新函数更新单元格
    const newCell = cellTemplate.update(previousCell, cell);

    // 如果更新后的单元格与之前的单元格不同且不是只读单元格，则将更新信息添加到待执行的单元格更改列表中
    if ((newCell !== previousCell || JSON.stringify(newCell) !== JSON.stringify(previousCell)) && !newCell.nonEditable)
        state.queuedCellChanges.push({
            previousCell,
            newCell,
            type: newCell.type,
            rowId: location.row.rowId,
            columnId: location.column.columnId
        } as CellChange);

    // 返回更新后的状态对象
    return { ...state };
}