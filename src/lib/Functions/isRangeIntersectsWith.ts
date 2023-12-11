import { Range } from "../../core";

/**
 * 判断两个Range是否相交
 * @param range1 第一个Range对象
 * @param range2 第二个Range对象
 * @returns 如果相交返回true，否则返回false
 */
export function isRangeIntersects(range1: Range, range2: Range): boolean {
  return (
    range2.first.column.idx <= range1.last.column.idx &&
    range2.first.row.idx <= range1.last.row.idx &&
    range2.last.column.idx >= range1.first.column.idx &&
    range2.last.row.idx >= range1.first.row.idx
  );
}
