import { ClipboardEvent } from '../Model/domEventsTypes';
import { State } from '../Model/State';
import { getDataToCopy } from './getDataToCopy';
import { getActiveSelectedRange } from './getActiveSelectedRange';
import { isBrowserSafari } from './safari';

/**
 * 处理复制操作
 * @param event - 复制事件
 * @param state - 状态
 * @param removeValues - 是否删除值，默认为false
 * @returns 更新后的状态
 */
export function handleCopy(event: ClipboardEvent, state: State, removeValues = false): State {
    const activeSelectedRange = getActiveSelectedRange(state); // 获取活动选择范围
    if (!activeSelectedRange) { // 如果选择范围不存在，则返回原始状态
        return state;
    }
    const { div } = getDataToCopy(state, activeSelectedRange, removeValues); // 获取要复制的数据和目标div
    copyDataCommands(event, state, div); // 复制数据
    return { ...state, copyRange: activeSelectedRange }; // 返回更新后的状态，更新复制的范围
}

/**
 * 复制数据命令
 * @param event - 剪贴板事件对象
 * @param state - 状态对象
 * @param div - HTMLDivElement对象
 */
export function copyDataCommands(event: ClipboardEvent, state: State, div: HTMLDivElement): void {
    if (isBrowserSafari()) {
        event.clipboardData.setData('text/html', div.innerHTML);
    } else {
        document.body.appendChild(div);
        div.focus();
        document.execCommand('selectAll', false);
        document.execCommand('copy');
        document.body.removeChild(div);
    }

    state.hiddenFocusElement?.focus({ preventScroll: true });
    event.preventDefault();
}