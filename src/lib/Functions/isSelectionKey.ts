import { isMacOs } from './operatingSystem';
import { PointerEvent, KeyboardEvent } from '../Model/domEventsTypes';

/**
 * 判断事件是否为选择键事件
 * @param event - 触发事件
 * @returns 如果是选择键事件返回true，否则返回false
 */
export function isSelectionKey(event: PointerEvent | KeyboardEvent): boolean {
    return (!isMacOs() && event.ctrlKey) || event.metaKey;
}