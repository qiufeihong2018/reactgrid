import * as React from "react";
import { PaneContentChild, Range } from "../../core";
import { CellSelectionBehavior } from "../Behaviors/CellSelectionBehavior";
import { FillHandle } from "./FillHandle";

/**
 * 填充柄渲染器组件
 */
export const FillHandleRenderer: React.FC<PaneContentChild> = ({
  state,
  calculatedRange,
}) => {
  return (
    <>
      {
        // 检查是否选中了活动选区范围，并且计算得到的范围是Range类型，并且计算范围包含活动选区范围的最后一个单元格
        state.selectedRanges[state.activeSelectedRangeIdx] &&
          calculatedRange instanceof Range &&
          calculatedRange.contains(
            state.selectedRanges[state.activeSelectedRangeIdx].last
          ) &&
          // 检查是否启用了填充柄、当前没有编辑的单元格，并且当前行为不是CellSelectionBehavior
          state.enableFillHandle &&
          !state.currentlyEditedCell &&
          !(state.currentBehavior instanceof CellSelectionBehavior) && (
            // 渲染填充柄组件
            <FillHandle
              state={state}
              location={state.selectedRanges[state.activeSelectedRangeIdx].last}
            />
          )
      }
    </>
  );
};
