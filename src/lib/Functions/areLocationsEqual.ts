import { Location } from '../Model/InternalModel';

/**
 * 判断两个位置是否相等
 * @param location1 第一个位置
 * @param location2 第二个位置（可选）
 * @returns 如果两个位置相等，则返回true；否则返回false
 */
export function areLocationsEqual(location1: Location, location2?: Location): boolean {
    return location1.column.columnId === location2?.column.columnId
        && location1.row.rowId === location2?.row.rowId;
}
