import * as React from 'react';

interface HintProps {
    linePosition: number; // 提示线的位置
    left: number; // 左侧距离
    offset: number; // 偏移量
}

// TODO 这些组件属性应该由行为直接计算(只保留整数)
export const ResizeHint: React.FC<HintProps> = ({ left, linePosition, offset }) => {
    return (
        <>
            {linePosition !== -1 && (
                <div
                    className={`rg-column-resize-hint`}
                    style={{
                        left: linePosition - offset,
                    }}
                >
                    <span style={{ whiteSpace: 'nowrap' }}>Width: {Math.floor(linePosition - left - offset)}px</span>
                </div>
            )
            }
        </>
    )
}