import { SliceDirection, Range } from '../Model/Range';

// 定义范围切割函数
const rangeSlicer = (direction: SliceDirection) => (range: Range) => (rangeToSlice: Range) => (): Range => range.slice(rangeToSlice, direction);

// 导出列切割函数
export const columnsSlicer = rangeSlicer('columns');
// 导出行切割函数
export const rowsSlicer = rangeSlicer('rows');