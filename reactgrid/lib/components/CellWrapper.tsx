import React, { FC, useEffect } from "react";
import { useCellContext } from "./CellContext";
import HiddenFocusTarget from "./HiddenFocusTarget";
import { ColumnResizeBadge } from "./ColumnResizeBadge";
import { useReactGridStore } from "../utils/reactGridStore";
import { useReactGridId } from "./ReactGridIdProvider";
import { GridLookup } from "../types/PublicModel";

type CellWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  targetInputRef?: React.RefObject<HTMLInputElement | HTMLElement>;
  onStringValueRequsted: () => string;
  onStringValueReceived: (v: string) => void;
  children?: React.ReactNode;
};

const CellWrapper: FC<CellWrapperProps> = ({
  children,
  targetInputRef,
  onStringValueRequsted,
  onStringValueReceived,
  ...wrapperDivAttributes
}) => {
  const { className: customClassName, style: customStyle } = wrapperDivAttributes;
  const ctx = useCellContext();
  const id = useReactGridId();

  const enableColumnSelectionOnFirstRow = useReactGridStore(id, (store) => store.enableColumnSelectionOnFirstRow);
  const enableRowSelectionOnFirstColumn = useReactGridStore(id, (store) => store.enableRowSelectionOnFirstColumn);

  const disableTouchAction =
    ctx.isFocused ||
    (ctx.realRowIndex === 0 && enableColumnSelectionOnFirstRow) || // if column selection is enabled on first row
    (ctx.realColumnIndex === 0 && enableRowSelectionOnFirstColumn); // if row selection is enabled on first column

  const gridLookup = useReactGridStore(id, (store) => store.gridLookup);
  const setGridLookup = useReactGridStore(id, (store) => store.setGridLookup);

  useEffect(() => {
    const newGridLookup: GridLookup = gridLookup;

    newGridLookup.set(`${ctx.realRowIndex} ${ctx.realColumnIndex}`, {
      rowIndex: ctx.realRowIndex,
      colIndex: ctx.realColumnIndex,
      onStringValueRequsted,
      onStringValueReceived,
    });

    setGridLookup(newGridLookup);
  });

  return (
    <div
      {...wrapperDivAttributes}
      className={`rgCellContainer rgRowIdx-${ctx.realRowIndex} rgColIdx-${ctx.realColumnIndex} ${
        customClassName ?? ""
      }`}
      style={{
        padding: ".2rem",
        textAlign: "center",
        position: "relative",
        outline: "none",
        overflow: "hidden",
        touchAction: disableTouchAction ? "none" : "auto",
        ...customStyle,
        ...ctx.containerStyle,
      }}
    >
      {ctx.realRowIndex === 0 && <ColumnResizeBadge />}
      {children}
      <HiddenFocusTarget colIdx={ctx.realColumnIndex} rowIdx={ctx.realRowIndex} />
    </div>
  );
};

export default CellWrapper;
