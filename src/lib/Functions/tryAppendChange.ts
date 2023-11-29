import { Cell, CellChange, Compatible } from '../Model/PublicModel';
import { Location } from '../Model/InternalModel';
import { State } from '../Model/State';
import { getCompatibleCellAndTemplate } from './getCompatibleCellAndTemplate';

/**
 * 尝试将更改附加到状态中的单元格
 * @param state 状态对象
 * @param location 单元格的位置对象
 * @param cell 兼容的单元格对象
 * @returns 更新后的状态对象
 */
export function tryAppendChange(state: State, location: Location, cell: Compatible<Cell>): State {
    const { cell: previousCell, cellTemplate } = getCompatibleCellAndTemplate(state, location);

    // 如果更改的单元格与当前单元格相同或者更改后的单元格与当前单元格的JSON字符串相同，则不进行更新
    if (previousCell === cell || JSON.stringify(previousCell) === JSON.stringify(cell) || cellTemplate.update === undefined)
        return state;

    // 根据单元格模板的更新函数生成新的单元格
    const newCell = cellTemplate.update(previousCell, cell);

    // 如果新单元格与当前单元格不同且不是非可编辑的，则将更改附加到待处理的单元格更改列表中
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