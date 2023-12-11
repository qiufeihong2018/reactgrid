/**
 * 检测当前环境是否为浏览器环境并是否是Firefox浏览器
 * @returns 返回布尔值，为true表示当前环境是浏览器环境且是Firefox浏览器，否则返回false
 */
export function isBrowserFirefox(): boolean {
    if (typeof window !== 'undefined') { // 为了满足Circle CI编译器的条件而添加的判断
        return navigator.userAgent.includes('Firefox');
    }
    return false;
}
