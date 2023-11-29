import { getCompatibleCellAndTemplate } from './getCompatibleCellAndTemplate';
import { Location } from '../Model/InternalModel';
import { State } from '../Model/State';
import { Cell, Compatible } from '../Model/PublicModel';
import { tryAppendChange } from './tryAppendChange';
/**
 * 尝试将新的单元格数据追加到指定位置，并返回更新后的状态。
 * @param state - 当前状态
 * @param location - 指定位置
 * @param cell - 新的单元格数据
 * @returns 更新后的状态
 */
export function tryAppendChangeHavingGroupId(state: State, location: Location, cell: Compatible<Cell>): State {
    const { cell: cellInLocation } = getCompatibleCellAndTemplate(state, location);

    // 如果指定位置中的单元格的 groupId 与新的单元格的 groupId 相同，则将新的单元格数据追加到指定位置
    if (cellInLocation.groupId === cell.groupId) {
        return tryAppendChange(state, location, cell);
    } else {
        // 如果指定位置中的单元格的 groupId 与新的单元格的 groupId 不同，则发出警告信息
        console.warn(`New cells data can't be appended into location: ('${location.column.columnId}', '${location.row.rowId}'). Cell's 'groupId' field doesn't match!`);
    }

    // 返回更新后的状态
    return state;
}