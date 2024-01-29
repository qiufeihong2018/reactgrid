import { State } from "../Model/State";
import { ReactGridProps } from "../Model/PublicModel";
import { getSizeOfElement } from "./elementSizeHelpers";
import { CellMatrix } from "../Model/CellMatrix";

const DEFAULT_BREAKPOINT = 50;

export function updateResponsiveSticky(
  props: ReactGridProps,
  state: State
): State {
  const {
    horizontalStickyBreakpoint = DEFAULT_BREAKPOINT,
    verticalStickyBreakpoint = DEFAULT_BREAKPOINT,
  } = props;
  let leftStickyColumns = props.stickyLeftColumns || 0;
  let topStickyRows = props.stickyTopRows || 0;
  let rightStickyColumns = props.stickyRightColumns || 0;
  let bottomStickyRows = props.stickyBottomRows || 0;
  if (
    props.stickyTopRows ||
    props.stickyLeftColumns ||
    props.stickyRightColumns ||
    props.stickyBottomRows
  ) {
    const {
      width: widthOfScrollableElement,
      height: heightOfScrollableElement,
    } = getSizeOfElement(state.scrollableElement);
    if (props.stickyLeftColumns || props.stickyRightColumns) {
      // 预测左侧范围宽度
      const predictedLeftRangeWidth = props.columns
        .slice(0, leftStickyColumns)
        .reduce((acc, column) => {
          return acc + (column.width || CellMatrix.DEFAULT_COLUMN_WIDTH);
        }, 0);
      let predictedRightRangeWidth = 0;
      if (rightStickyColumns > 0) {
        // 预测右侧范围宽度
        predictedRightRangeWidth = props.columns
          .slice(-rightStickyColumns)
          .reduce((acc, column) => {
            return acc + (column.width || CellMatrix.DEFAULT_COLUMN_WIDTH);
          }, 0);
      }
      // 判断是否禁用水平粘性
      const shouldDisableStickyHorizontally =
        predictedLeftRangeWidth + predictedRightRangeWidth >
        (horizontalStickyBreakpoint * widthOfScrollableElement) / 100;
      // 根据水平粘性是否禁用来更新左侧和右侧的列数
      leftStickyColumns = shouldDisableStickyHorizontally
        ? 0
        : leftStickyColumns;
      rightStickyColumns = shouldDisableStickyHorizontally
        ? 0
        : rightStickyColumns;
    }
    if (props.stickyTopRows || props.stickyBottomRows) {
      // 预测上部分固定列高度总和
      const predictedTopRangeHeight = props.rows
        .slice(0, topStickyRows)
        .reduce((acc, column) => {
          return acc + (column.height || CellMatrix.DEFAULT_ROW_HEIGHT);
        }, 0);
      // 预测下部分固定列高度总和
      let predictedBottomRangeHeight = 0;
      if (bottomStickyRows > 0) {
        predictedBottomRangeHeight = props.rows
          .slice(-bottomStickyRows)
          .reduce((prev, column) => {
            return prev + (column.height || CellMatrix.DEFAULT_ROW_HEIGHT);
          }, 0);
      }
      // 判断是否需要禁用垂直固定
      const shouldDisableStickyVertically =
        predictedTopRangeHeight + predictedBottomRangeHeight >
        (verticalStickyBreakpoint * heightOfScrollableElement) / 100;
      // 如果需要禁用垂直固定，则上部分和下部分固定列数都为0
      topStickyRows = shouldDisableStickyVertically ? 0 : topStickyRows;
      bottomStickyRows = shouldDisableStickyVertically ? 0 : bottomStickyRows;
    }
  }
  return {
    ...state,
    leftStickyColumns,
    topStickyRows,
    rightStickyColumns,
    bottomStickyRows,
  };
}
