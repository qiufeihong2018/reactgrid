import {
  CellMatrix,
  CellMatrixProps,
  StickyRanges,
  translateLocationIdxToLookupKey,
} from "./CellMatrix";
import { GridColumn, GridRow } from "./InternalModel";
import { Range } from "./Range";

export interface StickyEdges {
  leftStickyColumns: number;
  topStickyRows: number;
  rightStickyColumns: number;
  bottomStickyRows: number;
}
export interface ICellMatrixBuilder<
  TCellMatrixBuilder = CellMatrixBuilder,
  TStickyEdges extends StickyEdges = StickyEdges
> {
  setProps(props: CellMatrixProps): TCellMatrixBuilder;
  fillRowsAndCols(edges: TStickyEdges): TCellMatrixBuilder;
  fillSticky(edges: TStickyEdges): TCellMatrixBuilder;
  fillScrollableRange(edges: TStickyEdges): TCellMatrixBuilder;
  setEdgeLocations(): TCellMatrixBuilder;
}

export class CellMatrixBuilder implements ICellMatrixBuilder {
  private cellMatrix!: CellMatrix;

  constructor() {
    this.reset();
  }

  private reset(): CellMatrixBuilder {
    this.cellMatrix = new CellMatrix({} as StickyRanges);
    return this;
  }

  setProps(props: CellMatrixProps): CellMatrixBuilder {
    this.cellMatrix.props = props;
    return this;
  }

  fillRowsAndCols(
    edges: StickyEdges = {
      leftStickyColumns: 0,
      topStickyRows: 0,
      rightStickyColumns: 0,
      bottomStickyRows: 0,
    }
  ): CellMatrixBuilder {
    const {
      leftStickyColumns,
      topStickyRows,
      rightStickyColumns,
      bottomStickyRows,
    } = edges;
    if (!Array.isArray(this.cellMatrix.props.rows)) {
      throw new TypeError('Feeded ReactGrids "rows" property is not an array!');
    }
    if (!Array.isArray(this.cellMatrix.props.columns)) {
      throw new TypeError(
        'Feeded ReactGrids "columns" property is not an array!'
      );
    }
    this.cellMatrix.rows = this.cellMatrix.props.rows.reduce<GridRow[]>(
      (rows, row, idx) => {
        // 获取当前行的顶部位置
        const top = this.getTop(idx, topStickyRows, bottomStickyRows, rows);
        // 获取当前行的高度
        const height = row.height || CellMatrix.DEFAULT_ROW_HEIGHT;
        // 创建新的网格行对象并添加到网格行数组中
        rows.push({
          ...row,
          top,
          height,
          idx,
          bottom: top + height,
        } as GridRow);
        // 更新网格的高度
        this.cellMatrix.height += height;

        // 在行索引查找对象中添加当前行的行Id和索引的映射关系
        this.cellMatrix.rowIndexLookup[row.rowId] = idx;
        return rows;
      },
      []
    );
    this.cellMatrix.columns = this.cellMatrix.props.columns.reduce<
      GridColumn[]
    >((cols, column, idx) => {
      // 获取当前列的左边位置
      const left = this.getLeft(
        idx,
        leftStickyColumns,
        rightStickyColumns,
        cols
      );
      // 获取当前列的宽度
      const width = column.width
        ? column.width <
          (this.cellMatrix.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH)
          ? this.cellMatrix.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH
          : column.width
        : CellMatrix.DEFAULT_COLUMN_WIDTH;
      // 创建新的列对象并添加到列数组中
      cols.push({ ...column, idx, left, width, right: left + width });
      // 更新总宽度
      this.cellMatrix.width += width;
      // 在列索引映射表中记录当前列的索引
      this.cellMatrix.columnIndexLookup[column.columnId] = idx;
      return cols;
    }, []);
    return this;
  }

  setRangesToRenderLookup(): CellMatrixBuilder {
    let rangesToExclude: Range[] = [];
    this.cellMatrix.rows.forEach((row, idy) => {
      row.cells.forEach((cell, idx) => {
        const rowspan = ("rowspan" in cell && cell.rowspan) || 0;
        const colspan = ("colspan" in cell && cell.colspan) || 0;
        const rows = rowspan
          ? this.cellMatrix.rows.slice(idy, idy + rowspan)
          : [this.cellMatrix.rows[idy]];
        const columns = colspan
          ? this.cellMatrix.columns.slice(idx, idx + colspan)
          : [this.cellMatrix.columns[idx]];
        const range = new Range(rows, columns);
        rangesToExclude = [
          ...rangesToExclude,
          ...this.getRangesToRender(range),
        ];
        this.cellMatrix.spanCellLookup[
          translateLocationIdxToLookupKey(idx, idy)
        ] = { range };
      });
    });
    // TODO try to optimize by using only lookup
    const keys = rangesToExclude.map((range) =>
      translateLocationIdxToLookupKey(
        range.first.column.idx,
        range.first.row.idx
      )
    );
    Object.keys(this.cellMatrix.spanCellLookup).forEach((key) => {
      if (!keys.includes(key)) {
        this.cellMatrix.rangesToRender[key] =
          this.cellMatrix.spanCellLookup[key];
      }
    });
    return this;
  }

  getRangesToRender(range: Range): Range[] {
    const result = range.rows.flatMap((row) =>
      range.columns.map((column) => new Range([row], [column]))
    );
    result.shift();
    return result;
  }

  fillSticky(
    edges: StickyEdges = {
      leftStickyColumns: 0,
      topStickyRows: 0,
      rightStickyColumns: 0,
      bottomStickyRows: 0,
    }
  ): CellMatrixBuilder {
    const {
      leftStickyColumns,
      topStickyRows,
      rightStickyColumns,
      bottomStickyRows,
    } = edges;
    this.cellMatrix.ranges.stickyLeftRange = new Range(
      this.cellMatrix.rows,
      this.cellMatrix.columns.slice(0, leftStickyColumns || 0)
    );
    this.cellMatrix.ranges.stickyTopRange = new Range(
      this.cellMatrix.rows.slice(0, topStickyRows || 0),
      this.cellMatrix.columns
    );
    this.cellMatrix.ranges.stickyRightRange = new Range(
      this.cellMatrix.rows,
      this.cellMatrix.columns.slice(
        this.getStickyRightFirstIdx(leftStickyColumns, rightStickyColumns),
        this.cellMatrix.columns.length
      )
    );
    this.cellMatrix.ranges.stickyBottomRange = new Range(
      this.cellMatrix.rows.slice(
        this.getStickyBottomFirstIdx(topStickyRows, bottomStickyRows),
        this.cellMatrix.rows.length
      ),
      this.cellMatrix.columns
    );
    return this;
  }

  fillScrollableRange(
    edges: StickyEdges = {
      leftStickyColumns: 0,
      topStickyRows: 0,
      rightStickyColumns: 0,
      bottomStickyRows: 0,
    }
  ): CellMatrixBuilder {
    const {
      leftStickyColumns,
      topStickyRows,
      rightStickyColumns,
      bottomStickyRows,
    } = edges;
    this.cellMatrix.scrollableRange = this.getScrollableRange(
      leftStickyColumns,
      topStickyRows,
      rightStickyColumns,
      bottomStickyRows
    );
    return this;
  }

  setEdgeLocations(): CellMatrixBuilder {
    this.cellMatrix.first = this.cellMatrix.getLocation(0, 0);
    this.cellMatrix.last = this.cellMatrix.getLocation(
      this.cellMatrix.rows.length - 1,
      this.cellMatrix.columns.length - 1
    );
    return this;
  }

/**
 * 获取指定索引的网格行的顶部位置
 * @param idx 索引值
 * @param topRowsSticky 顶部粘性行的索引值
 * @param bottomRowsSticky 底部粘性行的索引值
 * @param rows 网格行数组
 * @returns 指定索引的顶部位置
 */
private getTop(
    idx: number,
    topRowsSticky: number | undefined,
    bottomRowsSticky: number | undefined,
    rows: GridRow[]
  ): number {
    return idx === 0 ||
      idx === topRowsSticky ||
      idx ===
        this.getStickyBottomFirstIdx(topRowsSticky || 0, bottomRowsSticky || 0)
      ? 0
      : rows[idx - 1].top + rows[idx - 1].height;
  }
  private getLeft(
    idx: number,
    leftColumnsSticky: number | undefined,
    rightColumnsSticky: number | undefined,
    cols: GridColumn[]
  ): number {
    return idx === 0 ||
      idx === leftColumnsSticky ||
      idx ===
        this.getStickyRightFirstIdx(
          leftColumnsSticky || 0,
          rightColumnsSticky || 0
        )
      ? 0
      : cols[idx - 1].left + cols[idx - 1].width;
  }

  private getScrollableRange(
    leftColumnsSticky: number,
    topRowsSticky: number,
    rightColumnsSticky: number,
    bottomRowsSticky: number
  ): Range {
    return new Range(
      this.cellMatrix.rows.slice(
        topRowsSticky || 0,
        this.getStickyBottomFirstIdx(topRowsSticky, bottomRowsSticky)
      ),
      this.cellMatrix.columns.slice(
        leftColumnsSticky || 0,
        this.getStickyRightFirstIdx(leftColumnsSticky, rightColumnsSticky)
      )
    );
  }

  private getStickyBottomFirstIdx(
    topRowsSticky: number,
    bottomRowsSticky: number
  ): number {
    const stickyBottomRows = bottomRowsSticky || 0;
    const stickyTopRows = topRowsSticky || 0;
    const rows = this.cellMatrix.props.rows.length;
    return (
      rows - (stickyBottomRows + stickyTopRows > rows ? 0 : stickyBottomRows)
    );
  }

  private getStickyRightFirstIdx(
    stickyColumnsLeft: number,
    stickyColumnsRight: number
  ): number {
    const stickyRightColumns = stickyColumnsRight || 0;
    const stickyLeftColumns = stickyColumnsLeft || 0;
    const columns = this.cellMatrix.props.columns.length;
    return (
      columns -
      (stickyRightColumns + stickyLeftColumns > columns
        ? 0
        : stickyRightColumns)
    );
  }

  getCellMatrix(): CellMatrix {
    const result = this.cellMatrix;
    this.reset();
    return result;
  }
}
