import * as React from 'react';
import { PaneContentChild } from '../Model/InternalModel';

/**
 * 填充句柄范围选择组件
 * 
 * @param state - 组件状态
 * @param calculatedRange - 计算范围
 */
export const FillHandleRangeSelection: React.FC<PaneContentChild> = ({ state, calculatedRange }) => {
    return <>
        {state.currentBehavior.renderPanePart(state, calculatedRange)}
    </>
}