type ScrollableElement = HTMLElement | ReturnType<typeof getTopScrollableElement> | undefined;

/**
 * 获取可滚动的父元素
 * @param element - 给定元素
 * @param includeHidden - 是否包括隐藏的父元素
 * @returns ScrollableElement - 可滚动的父元素
 */
export function getScrollableParent(element: HTMLElement, includeHidden: boolean): ScrollableElement {
    let style = getComputedStyle(element);

    // 排除静态定位的父元素
    const excludeStaticParent = style.position === 'absolute';

    // 匹配滚动和隐藏的父元素
    const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

    // 如果元素的position为fixed，则返回document.documentElement
    if (style.position === 'fixed') return document.documentElement;

    // 遍历父元素，直到父元素被消耗完
    for (let parent = element; ((parent as HTMLElement | null) = parent.parentElement);) {
        style = getComputedStyle(parent);

        // 排除静态定位的父元素
        if (excludeStaticParent && style.position === 'static')
            continue;

        // 如果父元素的overflow和overflowY属性匹配，则返回父元素
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX))
            return parent;
    }

    // 如果没有找到可滚动的父元素，则返回顶部可滚动的元素
    return getTopScrollableElement();
}

export function getScrollOfScrollableElement(element: ScrollableElement): { scrollLeft: number, scrollTop: number } {
    const scrollLeft = element !== undefined ? ((element as HTMLElement).scrollLeft ?? getTopScrollableElement().scrollX) - ((element as HTMLElement).clientLeft || 0) : 0;
    const scrollTop = element !== undefined ? ((element as HTMLElement).scrollTop ?? getTopScrollableElement().scrollY) - ((element as HTMLElement).clientTop || 0) : 0;
    return { scrollLeft, scrollTop };
}

export function getTopScrollableElement(): Window & typeof globalThis {
    return window;
}
