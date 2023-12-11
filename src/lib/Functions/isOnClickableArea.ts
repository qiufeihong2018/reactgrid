import { State } from '../Model/State';
import { PointerEvent } from '../Model/domEventsTypes';

/**
 * 判断事件发生的位置是否在可点击的区域内
 * @param event - 鼠标事件对象
 * @param state - 状态对象
 * @returns 如果位置在可点击区域内，返回true；否则，返回false
 */
export function isOnClickableArea(event: PointerEvent, state: State): boolean {
    if (!state.reactGridElement) {
        throw new Error(`"state.reactGridElement"字段在调用"getBoundingClientRect()"之前应该被初始化`);
    }
    const { left, right } = state.reactGridElement.getBoundingClientRect();
    const scrollableContentX = event.clientX - left;
    const rightPaneWidth = state.cellMatrix.ranges.stickyRightRange.width;
    if (scrollableContentX >= state.cellMatrix.width - rightPaneWidth && !(event.clientX >= right - rightPaneWidth)) {
        return false;
    }
    return true;
}
