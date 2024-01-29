import * as React from "react";
import { PaneContentChild, Range } from "../../core";
import { PartialArea } from "./PartialArea";
import { isRangeIntersects } from "../Functions/isRangeIntersectsWith";

/**
 * 选中的范围
 * @param state - 组件状态
 * @param calculatedRange - 计算过的范围
 * @returns 选中的范围的组件
 */
export const SelectedRanges: React.FC<PaneContentChild> = ({
  state,
  calculatedRange,
}) => {
  return (
    <>
      {state.selectedRanges.map(
        (range: Range, i: number) =>
          !(
            state.focusedLocation &&
            range.contains(state.focusedLocation) &&
            range.columns.length === 1 &&
            range.rows.length === 1
          ) &&
          calculatedRange &&
          isRangeIntersects(calculatedRange, range) && (
            <PartialArea
              key={i}
              pane={calculatedRange}
              range={range}
              className="rg-partial-area-selected-range"
              style={{}}
            />
          )
      )}
    </>
  );
};
