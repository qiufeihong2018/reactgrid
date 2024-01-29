import * as React from "react";
import {
  Pane,
  isBrowserFirefox,
  shouldRenderTopSticky,
  shouldRenderMiddleRange,
  shouldRenderLeftSticky,
  shouldRenderCenterRange,
  columnsSlicer,
  rowsSlicer,
  Range,
  PaneContent,
  PaneShadow,
  CellRendererProps,
} from "../../core";
import {
  shouldRenderBottomSticky,
  shouldRenderRightSticky,
} from "../Functions/paneRendererPredicates";
import { useReactGridState } from "./StateProvider";

export interface PanesProps {
  cellRenderer: React.FC<CellRendererProps>;
}

export const PanesRenderer: React.FC<PanesProps> = ({ cellRenderer }) => {
  const state = useReactGridState();
  // 给定state中的cellMatrix
  const cellMatrix = state.cellMatrix;
  // 判断是否需要渲染顶部sticky
  const renderTopSticky = shouldRenderTopSticky(state);
  // 判断是否需要渲染中间范围
  const renderMiddleRange = shouldRenderMiddleRange(state);
  // 判断是否需要渲染左侧sticky
  const renderLeftSticky = shouldRenderLeftSticky(state);
  // 判断是否需要渲染中心范围
  const renderCenterRange = shouldRenderCenterRange(state);
  // 判断是否需要渲染底部sticky
  const renderBottomSticky = shouldRenderBottomSticky(state);
  // 判断是否需要渲染右侧sticky
  const renderRightSticky = shouldRenderRightSticky(state);

  // 如果不需要渲染顶部sticky、中间范围、左侧sticky和中心范围，则返回null
  if (
    !renderTopSticky &&
    !renderMiddleRange &&
    !renderLeftSticky &&
    !renderCenterRange
  ) {
    return null;
  }

  // 初始化可见滚动范围
  let visibleScrollableRange: Range | undefined = undefined;
  // 获取state中的visibleRange，并将其转为Range类型
  const visibleRange = state.visibleRange as Range;
  // 如果需要渲染中间范围，则将滚动范围与visibleRange取差集，得到visibleScrollableRange
  if (renderMiddleRange) {
    visibleScrollableRange = cellMatrix.scrollableRange.slice(
      visibleRange,
      "rows"
    );
  }

  // 根据cellMatrix中的ranges计算marginTop、marginLeft、marginRight和marginBottom的值
  const marginTop = cellMatrix.ranges.stickyTopRange.height
    ? -cellMatrix.ranges.stickyBottomRange.height
    : 0;
  const marginLeft = cellMatrix.ranges.stickyLeftRange.width
    ? -cellMatrix.ranges.stickyRightRange.width
    : 0;
  const marginRight = cellMatrix.ranges.stickyRightRange.width
    ? -cellMatrix.ranges.stickyLeftRange.width
    : 0;
  const marginBottom = cellMatrix.ranges.stickyBottomRange.height
    ? -cellMatrix.ranges.stickyTopRange.height
    : 0;

  // 如果scrollableRange中的rows或columns的长度不为0，则根据ranges计算visibleScrollable范围下的marginTop、marginLeft、marginBottom和marginRight的值
  const marginTopOnScrollable =
    cellMatrix.scrollableRange.rows.length !== 0
      ? cellMatrix.ranges.stickyTopRange.height
      : 0;
  const marginLeftOnScrollable =
    cellMatrix.scrollableRange.columns.length !== 0
      ? cellMatrix.ranges.stickyLeftRange.width
      : 0;
  const marginBottomOnScrollable =
    cellMatrix.scrollableRange.rows.length !== 0
      ? cellMatrix.ranges.stickyBottomRange.height
      : 0;
  const marginRightOnScrollable =
    cellMatrix.scrollableRange.columns.length !== 0
      ? cellMatrix.ranges.stickyRightRange.width
      : 0;
  return (
    <>
      <Pane
        renderChildren={renderMiddleRange && renderCenterRange}
        className={"rg-pane-center-middle"}
        style={{
          position: "relative",
          width: `calc(100% - ${
            cellMatrix.ranges.stickyLeftRange.width +
            cellMatrix.ranges.stickyRightRange.width
          }px)`,
          height: cellMatrix.scrollableRange.height,
          marginLeft,
          marginRight,
          marginTop,
          marginBottom,
          order: 4,
        }}
      >
        <PaneContent
          state={state}
          range={columnsSlicer(visibleScrollableRange as Range)(visibleRange)}
          borders={{
            bottom: !renderBottomSticky,
            right: !renderRightSticky,
            left: !renderLeftSticky,
            top: !renderTopSticky,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <PaneShadow
        renderCondition={renderLeftSticky}
        className={"shadow-left"}
        zIndex={2}
        style={{
          width: cellMatrix.ranges.stickyLeftRange.width,
          height: cellMatrix.height,
          marginTop: -cellMatrix.height,
          order: 9,
        }}
      />
      <PaneShadow
        renderCondition={renderRightSticky}
        className={"shadow-right"}
        zIndex={2}
        style={{
          width: cellMatrix.ranges.stickyRightRange.width,
          height: cellMatrix.height,
          marginLeft: -cellMatrix.ranges.stickyRightRange.width,
          marginTop:
            renderTopSticky || renderBottomSticky ? -cellMatrix.height : 0,
          order: renderTopSticky || renderBottomSticky ? 12 : 8,
        }}
      />
      <PaneShadow
        renderCondition={renderTopSticky}
        className={"shadow-top"}
        zIndex={1}
        style={{
          width: state.props?.enableFullWidthHeader
            ? `calc(100%)`
            : cellMatrix.width,
          height: cellMatrix.ranges.stickyTopRange.height,
          marginTop: -cellMatrix.height,
          order: 10,
        }}
      />
      <PaneShadow
        renderCondition={renderBottomSticky}
        className={"shadow-bottom"}
        zIndex={1}
        style={{
          width: state.props?.enableFullWidthHeader
            ? `calc(100%)`
            : cellMatrix.width,
          height: cellMatrix.ranges.stickyBottomRange.height,
          marginTop: -cellMatrix.ranges.stickyBottomRange.height,
          order: 11,
        }}
      />
      <Pane
        renderChildren={renderCenterRange && renderBottomSticky}
        className={"rg-pane-bottom"}
        style={{
          width: `calc(100% - ${
            cellMatrix.ranges.stickyLeftRange.width +
            cellMatrix.ranges.stickyRightRange.width
          }px)`,
          height: cellMatrix.ranges.stickyBottomRange.height,
          marginLeft,
          marginRight,
          marginTop: marginTopOnScrollable,
          order: 7,
        }}
      >
        <PaneContent
          state={state}
          range={columnsSlicer(cellMatrix.ranges.stickyBottomRange)(
            visibleRange
          )}
          borders={{
            top: true,
            bottom: true,
            right: !renderRightSticky,
            left: !renderLeftSticky,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <Pane
        renderChildren={
          (renderMiddleRange && renderRightSticky) || !visibleScrollableRange
        }
        className={"rg-pane-right"}
        style={{
          height: cellMatrix.scrollableRange.height,
          width:
            cellMatrix.width -
            cellMatrix.ranges.stickyLeftRange.width -
            cellMatrix.scrollableRange.width,
          marginTop,
          marginBottom,
          marginLeft: marginLeftOnScrollable,
          order: 5,
        }}
      >
        <PaneContent
          state={state}
          range={rowsSlicer(cellMatrix.ranges.stickyRightRange)(
            visibleScrollableRange || cellMatrix.ranges.stickyLeftRange
          )}
          borders={{
            left: true,
            top: !renderTopSticky,
            bottom: !renderBottomSticky,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <Pane
        renderChildren={renderTopSticky && renderCenterRange}
        className={"rg-pane-top"}
        style={{
          width: `calc(100% - ${
            cellMatrix.ranges.stickyLeftRange.width +
            cellMatrix.ranges.stickyRightRange.width
          }px)`,
          height: cellMatrix.ranges.stickyTopRange.height,
          marginBottom: marginBottomOnScrollable,
          marginLeft,
          marginRight,
          order: 1,
          //   ...(isBrowserFirefox() && { zIndex: 1 }),
          zIndex: (state.props?.zIndexBase ?? 0) + 1,
        }}
      >
        <PaneContent
          state={state}
          range={columnsSlicer(cellMatrix.ranges.stickyTopRange)(visibleRange)}
          borders={{
            top: true,
            right: !renderRightSticky,
            left: !renderLeftSticky,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <Pane
        renderChildren={
          (renderMiddleRange && renderLeftSticky) || !visibleScrollableRange
        }
        className={"rg-pane-left"}
        style={{
          height: cellMatrix.scrollableRange.height,
          width:
            cellMatrix.width -
            cellMatrix.scrollableRange.width -
            cellMatrix.ranges.stickyRightRange.width,
          marginRight: marginRightOnScrollable,
          marginBottom,
          marginTop,
          order: 3,
          //   ...(isBrowserFirefox() && { zIndex: 1 }),
          zIndex: (state.props?.zIndexBase ?? 0) + 1,
        }}
      >
        <PaneContent
          state={state}
          range={rowsSlicer(cellMatrix.ranges.stickyLeftRange)(
            visibleScrollableRange || cellMatrix.ranges.stickyLeftRange
          )}
          borders={{
            bottom: !renderBottomSticky,
            top: !renderTopSticky,
            left: true,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <Pane
        renderChildren={renderBottomSticky && renderRightSticky}
        className={
          "rg-pane-bottom rg-pane-right rg-pane-shadow shadow-bottom-right-corner"
        }
        style={{
          height: cellMatrix.ranges.stickyBottomRange.height,
          width:
            cellMatrix.width -
            cellMatrix.ranges.stickyLeftRange.width -
            cellMatrix.scrollableRange.width,
          marginTop: marginTopOnScrollable,
          marginLeft: marginLeftOnScrollable,
          order: 8,
          //   ...(isBrowserFirefox() && { zIndex: 1 }),
          zIndex: (state.props?.zIndexBase ?? 0) + 1,
        }}
      >
        <PaneContent
          state={state}
          range={rowsSlicer(cellMatrix.ranges.stickyRightRange)(
            cellMatrix.ranges.stickyBottomRange
          )}
          borders={{
            top: true,
            left: true,
            right: true,
            bottom: true,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <Pane
        renderChildren={renderBottomSticky && renderLeftSticky}
        className={
          "rg-pane-bottom rg-pane-left rg-pane-shadow shadow-bottom-left-corner"
        }
        style={{
          height: cellMatrix.ranges.stickyBottomRange.height,
          width:
            cellMatrix.width -
            cellMatrix.ranges.stickyRightRange.width -
            cellMatrix.scrollableRange.width,
          marginRight: marginRightOnScrollable,
          marginTop: marginTopOnScrollable,
          order: 6,
          //   ...(isBrowserFirefox() && { zIndex: 2 }),
          zIndex: (state.props?.zIndexBase ?? 0) + 2,
        }}
      >
        <PaneContent
          state={state}
          range={rowsSlicer(cellMatrix.ranges.stickyLeftRange)(
            cellMatrix.ranges.stickyBottomRange
          )}
          borders={{
            top: true,
            left: true,
            right: true,
            bottom: true,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <Pane
        renderChildren={renderTopSticky && renderRightSticky}
        className={
          "rg-pane-top rg-pane-right rg-pane-shadow shadow-top-right-corner"
        }
        style={{
          height: cellMatrix.ranges.stickyTopRange.height,
          width:
            cellMatrix.width -
            cellMatrix.scrollableRange.width -
            cellMatrix.ranges.stickyLeftRange.width,
          marginLeft: marginLeftOnScrollable,
          marginBottom: marginBottomOnScrollable,
          order: 2,
          //   ...(isBrowserFirefox() && { zIndex: 2 })
          zIndex: (state.props?.zIndexBase ?? 0) + 2,
        }}
      >
        <PaneContent
          state={state}
          range={rowsSlicer(cellMatrix.ranges.stickyRightRange)(
            cellMatrix.ranges.stickyTopRange
          )}
          borders={{
            top: true,
            left: true,
            right: true,
            bottom: true,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
      <Pane
        renderChildren={renderTopSticky && renderLeftSticky}
        className={
          "rg-pane-top rg-pane-left rg-pane-shadow shadow-top-left-corner"
        }
        style={{
          height: cellMatrix.ranges.stickyTopRange.height,
          width:
            cellMatrix.width -
            cellMatrix.scrollableRange.width -
            cellMatrix.ranges.stickyRightRange.width,
          marginRight: marginRightOnScrollable,
          marginBottom: marginBottomOnScrollable,
          order: 0,
          //   ...(isBrowserFirefox() && { zIndex: 3 }),
          zIndex: (state.props?.zIndexBase ?? 0) + 3,
        }}
      >
        <PaneContent
          state={state}
          range={rowsSlicer(cellMatrix.ranges.stickyLeftRange)(
            cellMatrix.ranges.stickyTopRange
          )}
          borders={{
            top: true,
            left: true,
            right: true,
            bottom: true,
          }}
          cellRenderer={cellRenderer}
        />
      </Pane>
    </>
  );
};
