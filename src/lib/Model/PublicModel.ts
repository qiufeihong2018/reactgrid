/**
 * This is the public API for ReactGrid
 * PLEASE ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE IN THIS FILE
 * THANKS!
 *
 * Michael Matejko
 */

import {
  TextCell,
  HeaderCell,
  CheckboxCell,
  DateCell,
  EmailCell,
  ChevronCell,
  NumberCell,
  TimeCell,
  DropdownCell,
} from "./../CellTemplates";

import { Range } from "./Range";

/**
 * `SelectionMode` is a marker for currect selection mode
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/7-selection-mode/
 */
export type SelectionMode = "row" | "column" | "range";

/**
 * `ReactGrid`'s component props
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/1-reactgrid-props/
 */
export interface ReactGridProps {
  /**
   * 列表对象数组
   */
  readonly columns: Column[];

  /**
   * 行列表对象数组
   */
  readonly rows: Row<Cell>[];

  /**
   * 可用的自定义单元格模板对象
   */
  readonly customCellTemplates?: CellTemplates;

  /**
   * 焦点位置（由外部应用程序持续管理）
   */
  readonly focusLocation?: CellLocation;

  /**
   * 初始焦点位置
   */
  readonly initialFocusLocation?: CellLocation;

  /**
   * 高亮位置数组
   */
  readonly highlights?: Highlight[];

  /**
   * 顶部粘性行数量
   */
  readonly stickyTopRows?: number;

  /**
   * 底部粘性行数量
   */
  readonly stickyBottomRows?: number;

  /**
   * 左侧粘性列数量
   */
  readonly stickyLeftColumns?: number;

  /**
   * 右侧粘性列数量
   */
  readonly stickyRightColumns?: number;

  /**
   * 设置 `true` 来启用单元格填充柄功能（默认为 `false`）
   */
  readonly enableFillHandle?: boolean;

  /**
   * 设置 `true` 来启用范围选择功能（默认为 `false`）
   */
  readonly enableRangeSelection?: boolean;

  /**
   * 设置 `true` 来启用行选择功能（默认为 `false`）
   */
  readonly enableRowSelection?: boolean;

  /**
   * 设置 `true` 来启用列选择功能（默认为 `false`）
   */
  readonly enableColumnSelection?: boolean;
  /**
   * 包含ReactGrid使用的文本标签的对象
   */
  readonly labels?: TextLabels;
  /**
   * 设置为`true`以启用全宽标题（默认为`false`，该功能为实验性功能）
   */
  readonly enableFullWidthHeader?: boolean;
  /**
   * 设置为`true`以启用groupId元素渲染（默认为`false`）
   */
  readonly enableGroupIdRender?: boolean;
  /**
   * 设置为`true`以禁用虚拟滚动（默认为`false`）
   */
  readonly disableVirtualScrolling?: boolean;
  /**
   * ReactGrid可滚动父元素宽度的百分比（%）。当粘性窗格的大小总和超过给定的断点值时，禁用粘性功能。（默认为`50`）
   */
  readonly horizontalStickyBreakpoint?: number;
  /**
   * ReactGrid可滚动父元素高度的百分比（%）。当粘性窗格的大小总和超过给定的断点值时，禁用粘性功能。（默认为`50`）
   */
  readonly verticalStickyBreakpoint?: number;
  /**
   * 定义ReactGrid使用的基底z-index。
   * 在内部使用：zIndexBase + <值> (例如zIndexBase + 1)
   *
   * 为什么这样？：Chrome更新v.117破坏了粘性行/列特性，
   * 由于我们不确定内部发生了什么变化导致了这个问题，
   * 我们决定使用z-index来修复它，这看起来是最简单的方法。
   */
  readonly zIndexBase?: number;

  /**
   * 当按下`Enter`键时，将焦点移动到下一列（默认为`false`）
   */
  readonly moveRightOnEnter?: boolean;

  /**
   * 列最小宽度（默认为`40`），以像素为单位
   * 用于限制列可以调整到的最小宽度。
   */
  readonly minColumnWidth?: number;

  /**
   * 当单元格（例如属性`value`）被改变时被调用。
   *
   * @param {CellChange[]} cellChanges 单元格改变数组
   * @returns {void}
   */
  readonly onCellsChanged?: (cellChanges: CellChange[]) => void;

  /**
   * 焦点位置已更改
   *
   * @param {CellLocation} location 新焦点位置
   * @returns {void}
   */
  readonly onFocusLocationChanged?: (location: CellLocation) => void;
  /**
   * 当尝试改变焦点位置时被调用。
   * 可以阻止位置改变。
   *
   * @param {CellLocation} location 新的焦点位置
   * @returns {boolean} 返回 `false` 来阻止位置改变
   */
  readonly onFocusLocationChanging?: (location: CellLocation) => boolean;
  /**
   * 当选择发生改变时被调用。
   *
   * @param {Range[]} selectedRanges 选中单元格位置的数组
   * @returns {void}
   */
  readonly onSelectionChanged?: (selectedRanges: Range[]) => void;

  /**
   * 当尝试更改选择时被调用。
   * 您可以阻止选择更改。
   *
   * @param {Range[]} selectedRanges 选中单元格位置的数组
   * @returns {boolean} 返回 `false` 来阻止选择更改
   */
  readonly onSelectionChanging?: (selectedRanges: Range[]) => boolean;
  /**
   * 当列大小调整操作完成时调用
   *
   * @param {Id} columnId 调整大小的列的 `Id`
   * @param {number} width 新列的宽度
   * @param {Id[]} selectedColIds 选中的列的 `Id` 数组
   * @returns {void}
   */
  readonly onColumnResized?: (
    columnId: Id,
    width: number,
    selectedColIds: Id[]
  ) => void;

  /**
   * 当行重新排序操作完成时调用
   *
   * @param {Id} targetRowId 行的 `Id`，表示操作已完成的目标行
   * @param {Id[]} rowIds 重新排序的行的 `Id` 数组
   * @param {DropPosition} dropPosition 表示行相对于其原始位置被放置的位置
   * @returns {void}
   */
  readonly onRowsReordered?: (
    targetRowId: Id,
    rowIds: Id[],
    dropPosition: DropPosition
  ) => void;

  /**
   * 当列重新排序操作完成时调用
   *
   * @param {Id} targetRowId 列的 `Id`，表示操作已完成的目标列
   * @param {Id[]} columnIds 重新排序的列的 `Id` 数组
   * @param {DropPosition} dropPosition 表示行相对于其原始位置被放置的位置
   * @returns {void}
   */
  readonly onColumnsReordered?: (
    targetColumnId: Id,
    columnIds: Id[],
    dropPosition: DropPosition
  ) => void;
  /**
   * 当用户在网格中打开上下文菜单时调用，用于自定义菜单选项
   *
   * @param {Id[]} selectedRowIds 选定列的`Id`数组
   * @param {Id[]} selectedColIds 选定行的`Id`数组
   * @param {SelectionMode} selectionMode 当前的选中模式
   * @param {MenuOption[]} menuOptions 内置的菜单选项数组，例如复制、剪切和粘贴
   * @param {Array<CellLocation[]>} selectedRanges 返回选定单元格位置的数组
   * @returns {MenuOption[]} 返回上下文菜单选项的数组
   */
  readonly onContextMenu?: (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[],
    selectedRanges: Array<CellLocation[]>
  ) => MenuOption[];

  /**
   * 是否允许更改特定列的顺序
   *
   * @param {Id} targetColumnId 目标列的`Id`
   * @param {Id[]} columnIds 正在重新排序的列的`Id`数组
   * @param {DropPosition} dropPosition 相对于原始位置的滴下位置
   * @returns {boolean} 返回`true`以允许在特定列上滴下列
   */
  readonly canReorderColumns?: (
    targetColumnId: Id,
    columnIds: Id[],
    dropPosition: DropPosition
  ) => boolean;

  /**
   * 是否允许更改特定行的顺序
   * @param {Id} targetRowId 目标行的`Id`
   * @param {Id[]} rowIds 正在重新排序的行的`Id`数组
   * @param {DropPosition} dropPosition 相对于原始位置的滴下位置
   * @returns {boolean} 返回`true`以允许在特定行上滴下行
   */
  readonly canReorderRows?: (
    targetRowId: Id,
    rowIds: Id[],
    dropPosition: DropPosition
  ) => boolean;
}

/**
 * Describes set of text labels used by ReactGrids internal i18n module.
 * Each text label has its own default value.
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/90-textlabels/
 */
export interface TextLabels {
  /**
   * Label of text header when browser isn't supported,
   * by default: `Please update to a modern browser.`
   */
  legacyBrowserHeader?: string;
  /**
   * Label of text paragraph when browser isn't supported,
   * by default: `Your current browser cannot run our content, please make sure you browser is fully updated
   * or try adifferent browser. We highly recommend using the most recent release of Google Chrome, Microsoft Edge,
   * Firefox, Safari, and Opera browser`
   */
  legacyBrowserText?: string;
  /**
   * Label of copy action displayed inside context menu (just PRO),
   * by default: `Copy`
   */
  copyLabel?: string;
  /**
   * Label of cut action displayed inside context menu (just PRO),
   * by default: `Cut`
   */
  cutLabel?: string;
  /**
   * Label of paste action displayed inside context menu (just PRO),
   * by default: `Paste`
   */
  pasteLabel?: string;
  /**
   * Alert label in use (e.g. MacOS) if access to the clipboard is denied (just PRO),
   * by default: `Use ⌘ + c for copy, ⌘ + x for cut and ⌘ + v for paste.`
   */
  actionNotSupported?: string;
  /**
   *  Alert label in use (e.g. Firefox) if access to the clipboard is denied (just PRO),
   * by default: ` Use ctrl + c for copy, ctrl + x for cut and ctrl + v for paste.`
   */
  appleMobileDeviceContextMenuPasteAlert?: string;
  /**
   * Alert label in use (e.g. Firefox) if access to the clipboard is denied (just PRO),
   * by default: `This action is not supported in this browser.`
   */
  otherBrowsersContextMenuPasteAlert?: string;
}

/**
 * Describes your custom cell templates as key-value object
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/6a-cell-templates/
 */
export interface CellTemplates {
  [key: string]: CellTemplate;
}

/**
 * Describes cell location inside the grid. Could describe e.g. focus.
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/6-cell-location/
 */
export interface CellLocation {
  /** Row id of cell location */
  readonly rowId: Id;
  /** Column id of cell location */
  readonly columnId: Id;
}

/**
 * Highlight is an element to mark any cell inside the grid
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/9-highlight/
 */
export interface Highlight {
  /**  Row id of the cell to highlight */
  readonly rowId: Id;
  /** Column id of the cell to highlight */
  readonly columnId: Id;
  /** Optional border color */
  readonly borderColor?: string;
  /** Optional CSS classname of the highlighted cell */
  readonly className?: string;
}

/**
 * Union of basic cells usually used for consuming changes and marking cells array inside the data row
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/6-default-cells/
 */
export type DefaultCellTypes =
  | CheckboxCell
  | DateCell
  | EmailCell
  | ChevronCell
  | HeaderCell
  | NumberCell
  | TextCell
  | TimeCell
  | DropdownCell;

/**
 * `CellChange` type is used by `onCellsChanged`. It represents mutually exclusive changes on a single cell.
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/2-cell-change/
 */
export type CellChange<TCell extends Cell = DefaultCellTypes & Cell> =
  TCell extends Cell
    ? {
        /** Row's `Id` where the change ocurred */
        readonly rowId: Id;
        /** Column's `Id` where the change ocurred */
        readonly columnId: Id;
        /** Extracted cell type of `TCell` (e.g. `text`, `chevron` and so on) */
        readonly type: TCell["type"];
        /** Previous content of the cell */
        readonly previousCell: TCell;
        /** New content of the cell */
        readonly newCell: TCell;
      }
    : never;

/**
 * This interface is used for the communication between ReactGrid and a cell
 *
 * How to create new cell template:
 * @see https://reactgrid.com/docs/3.1/5-create-your-own-cell-template/
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/5-cell-template/
 */
export interface CellTemplate<TCell extends Cell = Cell> {
  /**
   * Validates and converts `uncertainCell` to compatible cell type
   *
   * @param {Uncertain<TCell>} uncertainCell Cell with all optional fields of its base (`TCell`)
   * @returns {Compatible<TCell>} Compatible cell of its base (`TCell`)
   */
  getCompatibleCell(uncertainCell: Uncertain<TCell>): Compatible<TCell>;

  /**
   * Returns `true` if the cell is focusable
   *
   * @param {Compatible<TCell>} cell Current cell as `Compatible` cell
   * @returns {boolean} `true` if cell should be focusable, by default returns `true`
   */
  isFocusable?(cell: Compatible<TCell>): boolean;

  /**
   * Updates cell based on new props. If not implemented, cell will be read-only
   *
   * @param {Compatible<TCell>} cell Current cell
   * @param {UncertainCompatible<TCell>} cellToMerge Incoming cell
   * @returns {Compatible<TCell>} Merged cell as `Compatible` cell
   */
  update?(
    cell: Compatible<TCell>,
    cellToMerge: UncertainCompatible<TCell>
  ): Compatible<TCell>;

  /**
   * Handles keydown event on cell template and double click (opening cell in edit mode)
   * Default: cell => { cell, enableEditMode: false }
   *
   * @param {Compatible<TCell>} cell Incoming `Compatible` cell
   * @param {number} keyCode Represents the key pressed on the keyboard, or 1 for a pointer event (double click).
   * @param {boolean} ctrl Is `ctrl` pressed when event is called ()
   * @param {boolean} shift Is `shift` pressed when event is called
   * @param {boolean} alt Is `alt` pressed when event is called
   * @param {string} [key] Represents the value of the key pressed by the user. Optional for backwards compatibility.
   * @returns {{ cell: Compatible<TCell>; enableEditMode: boolean }} Cell data and edit mode either affected by the event or not
   */
  handleKeyDown?(
    cell: Compatible<TCell>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    key?: string
  ): { cell: Compatible<TCell>; enableEditMode: boolean };

  /**
   * Handles compositionEnd event on cell template (opening cell in edit mode)
   *
   * @param {Compatible<TCell>} cell Incoming `Compatible` cell
   * @param {string} eventData The characters generated by the input method that raised the event
   * @returns {{ cell: Compatible<TCell>; enableEditMode: boolean }} Cell data and edit mode either affected by the event or not
   */
  handleCompositionEnd?(
    cell: Compatible<TCell>,
    eventData: string
  ): { cell: Compatible<TCell>; enableEditMode: boolean };

  /**
   * Returns custom styles based on cell data applied to the cells `div` element
   * Default: _ => cell.style | {}
   *
   * @param {Compatible<TCell>} cell Incoming `Compatible` cell
   * @param {boolean} isInEditMode Flag is set to `true`, if cell is rendered in edit mode
   * @returns {CellStyle} Custom cell styling properties
   */
  getStyle?(cell: Compatible<TCell>, isInEditMode: boolean): CellStyle;

  /**
   *  Returns CSS classes based on cell data applied to the cells `div` element
   *
   * @param {Compatible<TCell>} cell Incoming `Compatible` cell
   * @param {boolean} isInEditMode Flag is set to `true`, if cell is rendered in edit mode
   * @returns {string} Cells CSS class names
   */
  getClassName?(cell: Compatible<TCell>, isInEditMode: boolean): string;

  /**
   * Renders the cell content
   *
   * @param {Compatible<TCell>} cell Incoming `Compatible` cell
   * @param {boolean} isInEditMode Flag is set to `true`, if cell is rendered in edit mode
   * @param {(cell: Compatible<TCell>, commit: boolean) => void} onCellChanged Callback used for commiting changes on a cell. For example: typing on html `input` element
   * @returns {React.ReactNode} Content of a cell
   */
  render(
    cell: Compatible<TCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<TCell>, commit: boolean) => void
  ): React.ReactNode;
}

/**
 * `Id` is a common type to identify many ReactGrids objects
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/4-id/
 */
export type Id = number | string;

/**
 * Indicates where row/column was dropped relatively to its origin and target object
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/5-drop-position/
 */
export type DropPosition = "before" | "on" | "after";

/**
 * Represents column in the grid
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/3-column/
 */
export interface Column {
  /** Unique `Id` in all columns array */
  readonly columnId: Id;
  /** Width of each grid column (in default set to `150px`) */
  readonly width?: number;
  /** Allow column to change its position in grid,
   * default: `false` (row reorder implementation is on the developers side)
   */
  readonly reorderable?: boolean;
  /** Allow column to change is width in grid,
   * default: `false` (row resize implementation is on the developers side)
   */
  readonly resizable?: boolean;
}

/**
 * This interface styles single cells border
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/7-cell-style/
 */
export interface BorderProps {
  /** Color of border - e.g. `#eee`/`red` */
  readonly color?: string;
  /** Style of border - e.g. `dotted`/`solid` */
  readonly style?: string;
  /** Width of border - e.g. `2px` */
  readonly width?: string;
}

/**
 * This interface styles single cell and prevents passing unwanted CSS properties that could break down grid rendering
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/7-cell-style/
 */
export interface CellStyle {
  /** CSS `color` property */
  readonly color?: string;
  /** CSS `background` property */
  readonly background?: string;
  /** CSS `overflow` property */
  readonly overflow?: string;
  /** CSS `padding-left` property */
  readonly paddingLeft?: string;
  /** Object that contains all cell's borders properties */
  readonly border?: {
    readonly left?: BorderProps;
    readonly top?: BorderProps;
    readonly right?: BorderProps;
    readonly bottom?: BorderProps;
  };
}

/**
 * Defines quantity of rows and columns to span.
 * At this moment span feature is available only for `HeaderCell`.
 *
 * @see https://reactgrid.com/docs/3.1/2-implementing-core-features/9e-cell-span/
 */
export interface Span {
  /** Specifies the number of columns a cell should span */
  colspan?: number;
  /** Specifies the number of rows a cell should span */
  rowspan?: number;
}

/**
 * A base for built-in cell types (e.g. `HeaderCell`) and your own
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/4-cell/
 */
export interface Cell {
  /** Name of cell type, must be unique */
  type: string;
  /** Marks cell as non editable (by default: `false`) */
  nonEditable?: boolean;
  /** `Id` of group to which this cell belongs to */
  groupId?: Id;
  /** Allowed style properties contained in `CellStyle` interface */
  style?: CellStyle;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Cell type marker - every field of `TCell` is optional.
 * Cell of this type will have only one essential field provided by `Cell` interface - `type`.
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/2-uncertain-cell/
 */
export type Uncertain<TCell extends Cell> = Partial<TCell> & Cell;

/**
 * Cell type marker - extended & exchangeable cell (compatible with different types)
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/1-compatible-cell/
 */
export type Compatible<TCell extends Cell> = TCell & {
  /** Text value of a cell */
  text: string;
  /**  Numeric value of a cell, if there is no numeric value representation use `NaN` */
  value: number;
};

/**
 * `UncertainCompatible` is a cell type that is compatible with other cell types
 * that can be instances of various cell types (e.g. `DataCell` and `TimeCell`).
 *
 * @see https://reactgrid.com/docs/3.1/7-api/1-types/3-uncertain-compatible-cell/
 */
export type UncertainCompatible<TCell extends Cell> = Uncertain<TCell> & {
  /** Text value of a cell */
  text: string;
  /** Numeric value of a cell, if there is no numeric value representation use `NaN` */
  value: number;
};

/**
 * `Row` contains essential information about the grid row.
 * `cells` field allows you to declare an array of objects that extends `Cell` base interface.
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/2-row/
 */
export interface Row<TCell extends Cell = DefaultCellTypes> {
  /** Unique `Id` in all rows array */
  readonly rowId: Id;
  /** Array of `Cell` objects */
  readonly cells: TCell[];
  /** Height of each grid row (in default set to `25` in px) */
  readonly height?: number;
  /**
   * Property that allows row to change is position in grid,
   * default: `false` (row reorder implementation is on the developer's side)
   */
  readonly reorderable?: boolean;
}

/**
 * Menu option element displayed in context menu
 *
 * @see https://reactgrid.com/docs/3.1/7-api/0-interfaces/8-menuoption/
 */
export interface MenuOption {
  /** Text that identifies each menu option */
  id: string;
  /** Text label displayed as its title */
  label: string;
  /**
   * Function that is called when an option is clicked
   *
   * @param {Id[]} selectedRowIds `Id`s of selected rows.
   * @param {Id[]} selectedColIds `Id`s of selected columns.
   * @param {SelectionMode} selectionMode Current selection mode.
   * @param {Array<CellLocation[]>} selectedRanges Returns array of selected cell locations
   * @returns {void}
   */
  handler: (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    selectedRanges: Array<CellLocation[]>
  ) => void;
}
