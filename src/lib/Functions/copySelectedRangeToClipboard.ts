import { State } from '../Model/State';
import { getActiveSelectedRange } from './getActiveSelectedRange';
import { getDataToCopy } from './getDataToCopy';

/**
 * 将选中范围复制到剪贴板
 * @param state 应用状态对象
 * @param removeValues 是否移除值的复制，默认为 false
 */
export function copySelectedRangeToClipboard(state: State, removeValues = false): void {
    // 获取选中范围
    const activeSelectedRange = getActiveSelectedRange(state);
    if (!activeSelectedRange) {
        return;
    }

    // 获取需要复制的数据
    const { div } = getDataToCopy(state, activeSelectedRange, removeValues);

    // 在文档的主体中附加 div
    document.body.appendChild(div);
    div.focus();

    // 选中所有内容
    document.execCommand('selectAll', false, undefined);

    // 复制选中内容
    document.execCommand('copy');

    // 从文档的主体中删除 div
    document.body.removeChild(div);

    // 隐藏聚焦元素聚焦
    state.hiddenFocusElement?.focus();
}
