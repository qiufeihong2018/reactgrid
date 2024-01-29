import * as React from "react";
import { translateLocationIdxToLookupKey } from "../Model/CellMatrix";
import { GridRow, GridColumn, Borders, Location } from "../Model/InternalModel";
import { State } from "../Model/State";
import { CellRendererProps } from "./CellRenderer";

export interface RowRendererProps {
  state: State;
  row: GridRow;
  columns: GridColumn[];
  forceUpdate: boolean;
  borders: Borders;
  cellRenderer: React.FC<CellRendererProps>;
}
/**
 * 判断是否需要重新渲染行渲染器
 * @param prevProps 上一次的行渲染器属性
 * @param nextProps 当前的行渲染器属性
 * @returns 如果不需要重新渲染，则返回false；否则返回true
 */
function shouldMemoRowRenderer(
  prevProps: RowRendererProps,
  nextProps: RowRendererProps
): boolean {
  const { columns: prevCols } = prevProps;
  const { columns: nextCols, forceUpdate } = nextProps;
  return !(
    // 为了提高渲染速度而设置的键，例如每个列/行/单元格的校验和
    (
      forceUpdate ||
      nextCols[0].idx !== prevCols[0].idx ||
      nextCols.length !== prevCols.length ||
      nextCols[nextCols.length - 1].idx !== prevCols[prevCols.length - 1].idx
    )
  );
}
// 映射列组件
const MappedColumns: React.FC<RowRendererProps> = ({
  columns,
  row,
  cellRenderer,
  borders,
  state,
}) => {
  // 获取最后一个列的索引
  const lastColIdx = columns[columns.length - 1].idx;
  const CellRenderer = cellRenderer;

  return (
    <>
      {columns.map((column) => {
        // 获取该列的范围
        const range =
          state.cellMatrix.rangesToRender[
            translateLocationIdxToLookupKey(column.idx, row.idx)
          ]?.range;
        if (!range) {
          return null;
        }
        // 定义位置
        const location: Location = { row, column };

        return (
          // 渲染单元格渲染器
          <CellRenderer
            key={row.idx + "-" + column.idx}
            borders={{
              ...borders,
              left: borders.left && column.left === 0,
              right:
                (borders.right && column.idx === lastColIdx) ||
                !(
                  state.cellMatrix.scrollableRange.last.column.idx ===
                  location.column.idx
                ),
            }}
            state={state}
            location={location}
            range={range}
            currentlyEditedCell={state.currentlyEditedCell}
            update={state.update}
          />
        );
      })}
    </>
  );
};
/**
 * 行渲染组件
 *
 * @param {RowRendererProps} props - 属性对象
 * @returns {React.ReactElement} - 返回渲染结果
 */
export const RowRenderer: React.NamedExoticComponent<RowRendererProps> =
  React.memo(MappedColumns, shouldMemoRowRenderer);
RowRenderer.displayName = "RowRenderer";
