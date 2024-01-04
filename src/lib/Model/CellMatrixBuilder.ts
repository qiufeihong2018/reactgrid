import { CellMatrix, CellMatrixProps, StickyRanges, translateLocationIdxToLookupKey } from './CellMatrix';
import { GridColumn, GridRow } from './InternalModel';
import { Range } from './Range';


export interface StickyEdges {
    leftStickyColumns: number;
    topStickyRows: number;
    rightStickyColumns: number;
    bottomStickyRows: number;
}
export interface ICellMatrixBuilder<TCellMatrixBuilder = CellMatrixBuilder, TStickyEdges extends StickyEdges = StickyEdges> {
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
          const top = this.getTop(idx, topStickyRows, bottomStickyRows, rows);
          const height = row.height || CellMatrix.DEFAULT_ROW_HEIGHT;
          rows.push({
            ...row,
            top,
            height,
            idx,
            bottom: top + height,
          } as GridRow);
          this.cellMatrix.height += height;
  
          // TODO what with rowIndexLookup?
          this.cellMatrix.rowIndexLookup[row.rowId] = idx;
          return rows;
        },
        []
      );
      this.cellMatrix.columns = this.cellMatrix.props.columns.reduce<
        GridColumn[]
      >((cols, column, idx) => {
        const left = this.getLeft(
          idx,
          leftStickyColumns,
          rightStickyColumns,
          cols
        );
        const width = column.width
          ? column.width < (this.cellMatrix.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH)
            ? (this.cellMatrix.props?.minColumnWidth ?? CellMatrix.MIN_COLUMN_WIDTH)
            : column.width
          : CellMatrix.DEFAULT_COLUMN_WIDTH;
        cols.push({ ...column, idx, left, width, right: left + width });
        this.cellMatrix.width += width;
        // TODO what with columnIndexLookup?
        this.cellMatrix.columnIndexLookup[column.columnId] = idx;
        return cols;
      }, []);
      return this;
    }
  
    /**
     * 设置要渲染的单元格范围查找表
     * @returns {CellMatrixBuilder} 返回CellMatrixBuilder实例
     */
    setRangesToRenderLookup(): CellMatrixBuilder {
      let rangesToExclude: Range[] = [];
      this.cellMatrix.rows.forEach((row, idy) => {
        // 遍历每一行的单元格
        row.cells.forEach((cell, idx) => {
          // 获取单元格的合并行数和合并列数
          const rowspan = ("rowspan" in cell && cell.rowspan) || 0;
          const colspan = ("colspan" in cell && cell.colspan) || 0;
          // 根据合并行数和当前行索引生成需要合并的行集合
          const rows = rowspan
            ? this.cellMatrix.rows.slice(idy, idy + rowspan)
            : [this.cellMatrix.rows[idy]];
          // 根据合并列数和当前列索引生成需要合并的列集合
          const columns = colspan
            ? this.cellMatrix.columns.slice(idx, idx + colspan)
            : [this.cellMatrix.columns[idx]];
          // 生成需要合并的范围
          const range = new Range(rows, columns);
          // 获取需要渲染的范围集合
          const rangesToRender = this.getRangesToRender(range);
          // 将需要渲染的范围添加到需要排除的范围集合中
          rangesToExclude = [
            ...rangesToExclude,
            ...rangesToRender,
          ];
          // 将合并单元格的范围添加到单元格查找表中
          this.cellMatrix.spanCellLookup[
            translateLocationIdxToLookupKey(idx, idy)
          ] = { range };
        });
      });
      // TODO 尝试通过仅使用查找表进行优化
      const keys = rangesToExclude.map((range) =>
        translateLocationIdxToLookupKey(
          range.first.column.idx,
          range.first.row.idx
        )
      );
      // 遍历this.cellMatrix.spanCellLookup对象的所有键
      Object.keys(this.cellMatrix.spanCellLookup).forEach((key) => {
          // 如果keys数组不包含当前键
          if (!keys.includes(key)) {
              // 将this.cellMatrix.spanCellLookup[key]的值赋给this.cellMatrix.rangesToRender[key]
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
