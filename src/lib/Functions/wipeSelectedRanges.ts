import { State } from '../Model/State';
import { emptyCell } from './emptyCell';
import { tryAppendChange } from './tryAppendChange';

/**
 * 清空选中的范围
 * @param state 状态对象
 * @returns 状态对象，清空选中的范围后
 */
export function wipeSelectedRanges(state: State): State {
    state.selectedRanges.forEach((range) =>
        range.rows.forEach((row) =>
            range.columns.forEach(
                (column) =>
                    (state = tryAppendChange(
                        state,
                        { row, column },
                        emptyCell
                    ) as State)
            )
        )
    );
    return state;
}