import { GridColumn, GridRow, Location } from "./InternalModel";
import { Cell, Column, Id, Row } from "./PublicModel";
import { Range } from "./Range";

export interface IndexLookup {
  [id: string]: number;
}

// INTERNAL
export interface CellMatrixProps {
  columns: Column[];
  rows: Row<Cell>[];
  stickyTopRows?: number;
  stickyLeftColumns?: number;
  stickyRightColumns?: number;
  stickyBottomRows?: number;
  minColumnWidth?: number;
}

export interface StickyRanges {
  stickyTopRange: Range;
  stickyLeftRange: Range;
  stickyRightRange: Range;
  stickyBottomRange: Range;
}

export interface SpanLookup {
  range?: Range;
}

// INTERNAL
export class CellMatrix {
  /**
   * 行默认高度
   */
  static DEFAULT_ROW_HEIGHT = 25;
  /**
   * 列默认宽度
   */
  static DEFAULT_COLUMN_WIDTH = 150;
  /**
   * 最小列宽度
   */
  static MIN_COLUMN_WIDTH = 40;

  /**
   * 属性
   */
  props!: CellMatrixProps;
  /**
   * 滚动范围
   */
  scrollableRange!: Range;
  /**
   * 宽度
   */
  width = 0;
  /**
   * 高度
   */
  height = 0;

  /**
   * 列表
   */
  columns!: GridColumn[];
  /**
   * 行列表
   */
  rows!: GridRow[];
  /**
   * 第一个位置
   */
  first!: Location;
  /**
   * 最后一个位置
   */
  last!: Location;

  /**
   * 行索引查找表
   */
  rowIndexLookup: IndexLookup = {};
  /**
   * 列索引查找表
   */
  columnIndexLookup: IndexLookup = {};

  /**
   * 跨cell查找表
   */
  spanCellLookup: { [location: string]: SpanLookup } = {};

  /**
   * 要渲染的范围查找表
   */
  rangesToRender: { [location: string]: SpanLookup } = {};

  constructor(public ranges: StickyRanges) {}

  getRange(start: Location, end: Location): Range {
    const cols = this.columns.slice(
      Math.min(start.column.idx, end.column.idx),
      Math.max(start.column.idx, end.column.idx) + 1
    );
    const rows = this.rows.slice(
      Math.min(start.row.idx, end.row.idx),
      Math.max(start.row.idx, end.row.idx) + 1
    );

    return new Range(rows, cols);
  }

  getLocation(rowIdx: number, columnIdx: number): Location {
    return { row: this.rows[rowIdx], column: this.columns[columnIdx] };
  }

  getLocationById(rowId: Id, columnId: Id): Location {
    try {
      const row = this.rows[this.rowIndexLookup[rowId]];
      const column = this.columns[this.columnIndexLookup[columnId]];
      return this.validateLocation({ row, column });
    } catch (error) {
      throw new RangeError(`column: '${columnId}', row: '${rowId}'`);
    }
  }

  validateLocation(location: Location): Location {
    const colIdx =
      this.columnIndexLookup[location.column.columnId] ??
      Math.min(location.column.idx, this.last.column.idx);
    const rowIdx =
      this.rowIndexLookup[location.row.rowId] ??
      Math.min(location.row.idx, this.last.row.idx);
    return this.getLocation(rowIdx, colIdx);
  }

  validateRange(range: Range): Range {
    return this.getRange(
      this.validateLocation(range.first),
      this.validateLocation(range.last)
    );
  }

  getCell(location: Location): Cell {
    return this.rows[location.row.idx].cells[location.column.idx];
  }

  /**
   * 在指定行和列扩展矩阵
   * @param rowIdx 行索引
   * @param columnIdx 列索引
   */
  extend(rowIdx: number, columnIdx: number): void {
    const rowHeight = CellMatrix.DEFAULT_ROW_HEIGHT;
    const columnWidth = CellMatrix.DEFAULT_COLUMN_WIDTH;
    const location = this.getLocation(rowIdx - 1, columnIdx - 1);

    // 推出新行
    this.rows.push({
      ...location.row,
      top: location.row.bottom,
      bottom: location.row.bottom + rowHeight,
      height: rowHeight,
      idx: rowIdx,
      rowId: `row-${rowIdx}`,
    } as unknown as GridRow);

    // 推出新列
    this.columns.push({
      ...location.column,
      idx: rowIdx,
      left: location.column.right,
      right: location.column.right + columnWidth,
      columnId: `column-${rowIdx}`,
      width: columnWidth,
    });
  }
}

export function translateLocationIdxToLookupKey(
  idx: number,
  idy: number
): string {
  return `${idx}, ${idy}`;
}
