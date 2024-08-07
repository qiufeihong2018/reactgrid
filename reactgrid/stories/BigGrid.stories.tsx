import React from "react";
import { StoryDefault } from "@ladle/react";
import { StrictMode, useState } from "react";
import { ReactGrid } from "../lib/components/ReactGrid";
import { ErrorBoundary } from "../lib/components/ErrorBoundary";
import { TextCell } from "../lib/cellTemplates/TextCell";
import { cellMatrixBuilder } from "../lib/utils/cellMatrixBuilder";
import { NumberCell } from "../lib/cellTemplates/NumberCell";
import { Column, Row } from "../lib/types/PublicModel";
import { handleFill } from "./utils/handleFill";
import { handleCut } from "./utils/handleCut";
import { handlePaste } from "./utils/handlePaste";
import { handleCopy } from "./utils/handleCopy";
import { handleColumnReorder } from "./utils/handleColumnReorder";
import { handleResizeColumn } from "./utils/handleResizeColumn";
import { handleRowReorder } from "./utils/handleRowReorder";

interface CellData {
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: React.ComponentType<any>;

  rowSpan?: number;
  colSpan?: number;
  format?: Intl.NumberFormat;

  isFocusable?: boolean;
  isSelectable?: boolean;
}

const styledRanges = [
  {
    range: { start: { rowIndex: 0, columnIndex: 5 }, end: { rowIndex: 14, columnIndex: 12 } },
    styles: { background: "red", color: "yellow" },
  },
  {
    range: { start: { rowIndex: 7, columnIndex: 10 }, end: { rowIndex: 10, columnIndex: 14 } },
    styles: { background: "green", color: "purple" },
  },
];

const ROW_COUNT = 20;
const COLUMN_COUNT = 25;

const testStyles = {};

const myNumberFormat = new Intl.NumberFormat("pl", {
  style: "currency",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  currency: "PLN",
});

const generateCellData = (i: number, j: number): CellData | null => {
  if (i === 1 && j === 4) return null;
  if (i === 1 && j === 24) return null;
  if (i === 3 && j === 4) return null;
  if (i === 4 && j === 3) return null;
  if (i === 4 && j === 4) return null;
  if (i === 5 && j === 6) return null;
  if (i === 5 && j === 7) return null;
  if (i === 6 && j === 4) return null;
  if (i === 6 && j === 7) return null;
  if (i === 6 && j === 8) return null;
  if (i === 19 && j === 1) return null;
  if (i === 1 && j === 24) return null;
  // if (i === 5 && j === 8) return null;

  if (i === 0) return { value: `Col ${j}`, template: TextCell, isFocusable: false };
  if (i === 5 && j === 3) return { value: 100, template: NumberCell, format: myNumberFormat };
  if (i === 1 && j === 3)
    return {
      value: "Lorem ipsum dolor sit amet",
      template: TextCell,
      colSpan: 2,
    };
  if (i === 1 && j === 23)
    return {
      value: "Lorem ipsum dolor sit amet",
      template: TextCell,
      colSpan: 2,
    };
  if (i === 3 && j === 3) return { value: "Lorem ipsum dolor sit amet", template: TextCell, colSpan: 2, rowSpan: 2 };
  if (i === 5 && j === 4)
    return {
      value: "Reiciendis illum, nihil, ab officiis explicabo!",
      template: TextCell,
      rowSpan: 2,
    };
  if (i === 5 && j === 5)
    return {
      value: "Excepturi in adipisci omnis illo eveniet obcaecati!",
      template: TextCell,
      colSpan: 3,
    };
  if (i === 6 && j === 6) return { value: "Doloremque, sit!", template: TextCell, colSpan: 3 };
  if (i === 18 && j === 1) return { value: "Doloremque, sit!", template: TextCell, rowSpan: 2 };
  // if (i === 4 && j === 8) return {  value: "Doloremque, sit!", template: TextCell, rowSpan: 2 };

  if (i > 0 && j === 0) {
    return {
      value:
        `[${i.toString()}:${j.toString()}]` +
        [
          "Lorem ipsum dolor sit amet",
          "Reiciendis illum, nihil, ab officiis explicabo!",
          "Excepturi in adipisci omnis illo eveniet obcaecati!",
          "Doloremque, sit!",
        ][Math.floor(Math.random() * 4)],
      template: TextCell,
      isFocusable: false,
    };
  }

  return {
    value:
      `[${i.toString()}:${j.toString()}]` +
      [
        "Lorem ipsum dolor sit amet",
        "Reiciendis illum, nihil, ab officiis explicabo!",
        "Excepturi in adipisci omnis illo eveniet obcaecati!",
        "Doloremque, sit!",
      ][Math.floor(Math.random() * 4)],
    template: TextCell,
  };
};

export const BigGrid = () => {
  const [columns, setColumns] = useState<Array<Column>>(
    Array.from({ length: COLUMN_COUNT }).map((_, j) => ({
      width: 150,
      reorderable: true,
      resizable: true,
    }))
  );
  const [rows, setRows] = useState<Array<Row>>(
    Array.from({ length: ROW_COUNT }).map((_, j) => {
      if (j === 0) return { height: "100px", reorderable: true };

      return { height: "max-content", reorderable: true };
    })
  );

  const [gridData, setGridData] = useState<(CellData | null)[][]>(
    Array.from({ length: ROW_COUNT }).map((_, i) => {
      return Array.from({ length: COLUMN_COUNT }).map((_, j) => generateCellData(i, j));
    })
  );

  const cells = cellMatrixBuilder(({ setCell }) => {
    gridData.forEach((row, rowIdx) => {
      row.forEach((cell, columnIx) => {
        if (cell === null) return;

        setCell(
          rowIdx,
          columnIx,
          cell.template,
          {
            value: cell.value,
            onValueChanged: (data) => {
              setGridData((prev) => {
                const next = [...prev];
                if (next[rowIdx][columnIx] !== null) {
                  next[rowIdx][columnIx].value = data;
                }
                return next;
              });
            },
            ...(cell.format && { format: cell.format }),
          },
          {
            ...(cell?.isFocusable === false && { isFocusable: cell.isFocusable }),
            ...(cell?.isSelectable === false && { isSelectable: cell.isSelectable }),
            ...(cell?.rowSpan && { rowSpan: cell.rowSpan }),
            ...(cell?.colSpan && { colSpan: cell.colSpan }),
          }
        );
      });
    });
  });

  const [toggleRanges, setToggleRanges] = useState(false);

  return (
    <>
      <div className="rgScrollableContainer" style={{ height: "100%", width: "100%", overflow: "auto" }}>
        <ReactGrid
          id="big-grid"
          rows={rows}
          columns={columns}
          cells={cells}
          stickyTopRows={5}
          stickyLeftColumns={3}
          stickyRightColumns={3}
          stickyBottomRows={4}
          styles={testStyles}
          styledRanges={toggleRanges ? styledRanges : []}
          onResizeColumn={(width, columnIdx) => handleResizeColumn(width, columnIdx, cells, setColumns)}
          onRowReorder={(selectedRowIndexes, destinationRowIdx) =>
            handleRowReorder(selectedRowIndexes, destinationRowIdx, setRows, setGridData)
          }
          onColumnReorder={(selectedColIndexes, destinationColIdx) =>
            handleColumnReorder(selectedColIndexes, destinationColIdx, setColumns, setGridData)
          }
          enableColumnSelectionOnFirstRow
          enableRowSelectionOnFirstColumn
          onAreaSelected={(selectedArea) => {}}
          onFillHandle={(selectedArea, fillRange) => handleFill(selectedArea, fillRange, setGridData)}
          onCut={(selectedArea) => handleCut(gridData, selectedArea, setGridData)}
          onPaste={(selectedArea, pastedData) => handlePaste(selectedArea, pastedData, setGridData)}
          onCopy={(selectedArea) => handleCopy(gridData, selectedArea)}
          onCellFocused={(cellLocation) => {}}
        />
        <button onClick={() => setToggleRanges((prev) => !prev)}>toggle ranges</button>
      </div>
    </>
  );
};

export default {
  decorators: [
    (Component) => (
      <StrictMode>
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      </StrictMode>
    ),
  ],
} satisfies StoryDefault;
