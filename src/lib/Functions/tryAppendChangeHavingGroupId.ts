import { getCompatibleCellAndTemplate } from './getCompatibleCellAndTemplate';
import { Location } from '../Model/InternalModel';
import { State } from '../Model/State';
import { Cell, Compatible } from '../Model/PublicModel';
import { tryAppendChange } from './tryAppendChange';

/**
 * 尝试将新的单元格数据添加到指定位置。
 * 
 * @param state - 状态对象
 * @param location - 位置对象
 * @param cell - 单元格对象
 * @returns 新的状态对象
 */
export function tryAppendChangeHavingGroupId(state: State, location: Location, cell: Compatible<Cell>): State {
    const { cell: cellInLocation } = getCompatibleCellAndTemplate(state, location);

    // 如果单元格的位置信息中的groupId与要添加的单元格的groupId相同，则尝试添加新的单元格数据
    if (cellInLocation.groupId === cell.groupId) {
        return tryAppendChange(state, location, cell);
    } else {
        console.warn(`New cells data can't be appended into location: ('${location.column.columnId}', '${location.row.rowId}'). Cell's 'groupId' field doesn't match!`);
    }
    return state;
}