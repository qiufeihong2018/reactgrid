import { GridColumn, GridRow, Location } from "./InternalModel";

export type SliceDirection = "columns" | "rows" | "both";

/**
 * 表示一个范围的类
 */
export class Range {
  /**
   * 范围的宽度
   */
  readonly width: number;
  /**
   * 范围的高度
   */
  readonly height: number;
  /**
   * 范围的第一位置
   */
  readonly first: Location;
  /**
   * 范围的最后一位置
   */
  readonly last: Location;

  /**
   * 构造函数
   * @param rows 行列表
   * @param columns 列表
   */
  constructor(
    public readonly rows: GridRow[],
    public readonly columns: GridColumn[]
  ) {
    this.first = { row: this.rows[0], column: this.columns[0] };
    this.last = {
      row: this.rows[this.rows.length - 1],
      column: this.columns[this.columns.length - 1],
    };
    this.height = this.rows.reduce((a, b) => a + b.height, 0);
    this.width = this.columns.reduce((a, b) => a + b.width, 0);
  }

  /**
   * 判断一个位置是否在范围内
   * @param location 位置
   * @returns 是否在范围内
   */
  contains(location: Location): boolean {
    return (
      location.column?.idx >= this.first.column?.idx &&
      location.column?.idx <= this.last.column?.idx &&
      location.row?.idx >= this.first.row?.idx &&
      location.row?.idx <= this.last.row?.idx
    );
  }

  /**
   * 根据指定范围和方向进行切割
   * @param range 范围
   * @param direction 切割方向
   * @returns 切割后的范围
   */
  slice(range: Range, direction: SliceDirection): Range {
    const firstRow =
      direction === "rows" && range ? range.first.row : this.first.row;
    const firstColumn =
      direction === "columns" && range ? range.first.column : this.first.column;
    const lastRow =
      direction === "rows" && range ? range.last.row : this.last.row;
    const lastColumn =
      direction === "columns" && range ? range.last.column : this.last.column;
    const slicedRows = this.rows.slice(
      firstRow.idx - this.first.row.idx,
      lastRow.idx - this.first.row.idx + 1
    );
    const slicedColumns = this.columns.slice(
      firstColumn.idx - this.first.column.idx,
      lastColumn.idx - this.first.column.idx + 1
    );
    return new Range(slicedRows, slicedColumns);
  }
}
