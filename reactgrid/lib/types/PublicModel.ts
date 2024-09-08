/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Behavior, BehaviorId } from "./Behavior";
import { IndexedLocation, NestedStylesPartial } from "./InternalModel";
import { RGTheme } from "./RGTheme";

export type Row = {
  rowIndex: number;
  initialRowIndex?: number;
  height: string | number;
  reorderable?: boolean;
};

export type Column = {
  colIndex: number;
  initialColIndex?: number;
  width: string | number;
  minWidth?: string | number;
  resizable?: boolean;
  reorderable?: boolean;
};

/**
 * Represents a single cell in the grid created by the cellMatrixBuilder.
 */
export type Cell = {
  /** User defined row IDx, must exist in the `rows` array! */
  rowIndex: number;
  /** User defined column IDx, must exist in the `columns` array! */
  colIndex: number;
  /** Cell's template - typically the name of the React component. Should start from the uppercase letter. */
  // Type `any` is required to use React.ComponentType here
  Template: React.ComponentType<any>;
  /** Props passed to the cell's template. Types and structure is inherited from Template prop, but instead of JSX properties it's an object. */
  props?: React.ComponentPropsWithRef<Cell["Template"]>;
  /** Represents how many rows should the cell occupy. */
  rowSpan?: number;
  /** Represents how many columns should the cell occupy. */
  colSpan?: number;
  /** Marks a cell as focusable or not */
  isFocusable?: boolean;
  /** Marks a cell as selectable or not */
  isSelectable?: boolean;
};

export interface GridLookupCallbacks {
  rowIndex: number;
  colIndex: number;
  onStringValueRequsted: () => string;
  onStringValueReceived: (v: string) => void;
}

export type GridLookup<RowIdxType extends number = number, ColIdxType extends number = number> = Map<
  `${RowIdxType} ${ColIdxType}`,
  GridLookupCallbacks
>;

/**
 * Represents a map of cells indexed by row and column indices.
 */
export type CellMap<RowIdxType extends number = number, ColIdxType extends number = number> = Map<
  `${RowIdxType} ${ColIdxType}`,
  Cell | SpanMember
>;

export type SpanMember = {
  originRowIndex: number;
  originColIndex: number;
};

export type Position = {
  x: number;
  y: number;
};

export type Range = {
  start: {
    rowIndex: number;
    columnIndex: number;
  };
  end: {
    rowIndex: number;
    columnIndex: number;
  };
};

export type CellContextType = {
  /** Numerical cell's row index representation in relation to whole grid (incl. sticky). */
  realRowIndex: number;
  /** Numerical cell's column index representation in relation to whole grid (incl. sticky). */
  realColumnIndex: number;

  /** Represents how many rows should the cell occupy. */
  rowSpan?: number;
  /** Represents how many columns should the cell occupy. */
  colSpan?: number;

  /** Internal: provides cell container's style  */
  containerStyle: React.CSSProperties;

  isFocused: boolean;
};

export type NumericalRange = {
  startRowIdx: number;
  endRowIdx: number;
  startColIdx: number;
  endColIdx: number;
};

export type StyledRange = {
  styles: React.CSSProperties;
  range: Range;
};

export type StyledRangesCSS = {
  [selector: string]: React.CSSProperties;
}[];

export interface ReactGridProps {
  id?: string;

  styles?: NestedStylesPartial<RGTheme>;

  styledRanges?: StyledRange[];

  rows?: Row[];
  columns?: Column[];

  cells: Cell[];

  onAreaSelected?: (selectedArea: NumericalRange) => void;
  onCellFocused?: (cellLocation: IndexedLocation) => void;

  stickyTopRows?: number;
  stickyRightColumns?: number;
  stickyBottomRows?: number;
  stickyLeftColumns?: number;

  enableColumnSelectionOnFirstRow?: boolean;

  enableRowSelectionOnFirstColumn?: boolean;

  behaviors?: Partial<Record<BehaviorId, Behavior>>;

  initialFocusLocation?: IndexedLocation;
  initialSelectedRange?: Range;

  onFocusLocationChanging?: ({ location }: { location: IndexedLocation }) => boolean;
  onFocusLocationChanged?: ({ location }: { location: IndexedLocation }) => void;
  onFillHandle?: (selectedArea: NumericalRange, fillRange: NumericalRange, gridLookup: GridLookup) => void;
  onCut?: (event: React.ClipboardEvent<HTMLDivElement>, cellsRange: NumericalRange, gridLookup: GridLookup) => void;
  onCopy?: (event: React.ClipboardEvent<HTMLDivElement>, cellsRange: NumericalRange, gridLookup: GridLookup) => void;
  onPaste?: (event: React.ClipboardEvent<HTMLDivElement>, cellsRange: NumericalRange, gridLookup: GridLookup) => void;
  onColumnReorder?: (selectedColIndexes: number[], destinationColIdx: number) => void;
  onRowReorder?: (selectedRowIndexes: number[], destinationRowIdx: number) => void;
  onResizeColumn?: (width: number, columnIdx: number[]) => void;
}
