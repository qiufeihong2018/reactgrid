import React, { useRef, useLayoutEffect, useState } from "react";
import { Location } from "../../core";
import { State } from "../Model/State";
import { FillHandleBehavior } from "../Behaviors/FillHandleBehavior";

interface FillHandleProps {
  state: State; // 当前状态
  location: Location; // 当前位置
}

export const FillHandle: React.FC<FillHandleProps> = ({ state, location }) => {
  const targetRef = useRef<HTMLDivElement>(null); // 创建一个ref，用于指向HTMLDivElement元素
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // 使用state保存元素的尺寸信息

  useLayoutEffect(() => {
    if (targetRef.current) {
      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight,
      }); // 设置元素的尺寸
    }
  }, []);

  return (
    <div
      className="rg-touch-fill-handle"
      ref={targetRef}
      style={{
        top: location.row.bottom - dimensions.width / 2, // 设置元素的top位置
        left: location.column.right - dimensions.height / 2, // 设置元素的left位置
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") {
          // 如果事件不是由鼠标触发的
          state.update((state) => ({
            ...state,
            currentBehavior: new FillHandleBehavior(), // 更新当前状态中的currentBehavior为FillHandleBehavior实例
          }));
        }
      }}
    >
      <div className="rg-fill-handle" />
    </div>
  );
};
