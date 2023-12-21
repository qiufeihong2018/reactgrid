import React from "react";
import {
  Location,
  Compatible,
  Cell,
  Range,
  GridRow,
  GridColumn,
  getCompatibleCellAndTemplate,
  CellMatrix,
  tryAppendChangeHavingGroupId,
  isMacOs,
} from "../../core";
import { PointerEvent } from "../Model/domEventsTypes";
import { State } from "../Model/State";
import { Behavior } from "../Model/Behavior";
import { getActiveSelectedRange } from "../Functions/getActiveSelectedRange";
import { PartialArea } from "../Components/PartialArea";
import { isRangeIntersects } from "../Functions/isRangeIntersectsWith";
import { newLocation } from "../Functions/newLocation";

type Direction = "" | "left" | "right" | "up" | "down";

export class FillHandleBehavior extends Behavior {
  private fillDirection: Direction = "";
  private fillRange?: Range;

  /**
   * 当指针进入事件发生时的处理函数
   * @param event - PointerEvent对象，表示指针事件的信息
   * @param location - 位置信息，表示事件发生的位置
   * @param state - 状态信息，表示当前的状态
   * @returns 返回新的状态信息
   */
  handlePointerEnter(
    event: PointerEvent,
    location: Location,
    state: State
  ): State {
    const selectedRange = getActiveSelectedRange(state); // 获取当前选中的范围
    this.fillDirection = this.getFillDirection(selectedRange, location); // 获取填充方向
    this.fillRange = this.getFillRange(
      state.cellMatrix, // 状态的矩阵
      selectedRange, // 当前选中的范围
      location, // 事件发生的位置
      this.fillDirection // 填充方向
    ); // 获取填充范围
    return { ...state }; // 返回新的状态信息
  }

  handlePointerUp(
    event: PointerEvent,
    location: Location,
    state: State
  ): State {
    const activeSelectedRange = getActiveSelectedRange(state);
    const cellMatrix = state.cellMatrix;
    if (!activeSelectedRange || this.fillRange === undefined) {
      return state;
    }
    const isKeyPressed = isMacOs() ? event.altKey : event.ctrlKey;
    this.fillRange = state.cellMatrix.validateRange(this.fillRange);
    const getCompatibleCell = (location: Location) =>
      getCompatibleCellAndTemplate(state, location);

    /**
     * 填充单元格的预测值
     * @param selectedCells
     * @param cellsToFill 需要填充的单元格数组
     * @returns 填充后的单元格数组
     */
    const fillCellsWithPredictedValues = (
      selectedCells: Compatible<Cell>[],
      cellsToFill: Compatible<Cell>[]
    ): Compatible<Cell>[] => {
      // 根据选中的单元格的值生成一个数字数组
      const numbers = selectedCells.map((cell) => cell.value);

      // 根据数字数组和对应的索引数组找到回归函数的参数
      const parameters = this.findRegressionFunction(
        numbers,
        Array.from({ length: numbers.length }, (_, index) => index + 1)
      );

      // 检查回归函数的参数是否是NaN
      const areParametersNaNs = isNaN(parameters.a) && isNaN(parameters.b);

      // 根据回归函数的参数和选中的单元格生成需要填充的单元格数组
      return cellsToFill.map((cell, i) => {
        // 根据索引和回归函数的参数计算x的值
        const x = this.calculateXForRegressionFunction(
          i + numbers.length + 1,
          parameters.a,
          parameters.b
        );
        // 获取选中的单元格
        const selectedCell = selectedCells[i % selectedCells.length];
        // 根据条件选择需要填充的单元格的属性
        return {
          ...cell,
          text:
            areParametersNaNs || isKeyPressed
              ? selectedCell.text
              : x.toString(),
          groupId: selectedCell.groupId,
          value: areParametersNaNs || isKeyPressed ? selectedCell.value : x,
        };
      });
    };

    /**
     * 垂直方向填充
     *
     * @param state - 当前状态
     * @param activeSelectedRange - 激活的选中范围
     * @param direction - 填充方向，可选值为 "up" 或 "down"
     * @returns 填充后的状态
     */
    const fillVertically = (
      state: State,
      activeSelectedRange: Range,
      direction: "up" | "down"
    ): State => {
      activeSelectedRange.columns.forEach((column) => {
        let selectedCells = activeSelectedRange.rows.map(
          (row) => getCompatibleCell(newLocation(row, column)).cell
        );
        selectedCells =
          direction === "up" ? selectedCells.reverse() : selectedCells;
        if (this.fillRange) {
          let cellsToFill = this.fillRange.rows.map(
            (row) => getCompatibleCell(newLocation(row, column)).cell
          );
          cellsToFill = fillCellsWithPredictedValues(
            selectedCells,
            cellsToFill
          );
          cellsToFill =
            direction === "up" ? cellsToFill.reverse() : cellsToFill;
          state = this.fillColumn(state, column, cellsToFill);
        }
      });
      return state;
    };

    /**
     * 水平填充函数
     *
     * @param state - 当前状态
     * @param activeSelectedRange - 被选中的范围
     * @param direction - 填充方向，可选值为"left"或"right"
     * @returns 填充后的状态
     */
    const fillHorizontally = (
      state: State,
      activeSelectedRange: Range,
      direction: "left" | "right"
    ): State => {
      activeSelectedRange.rows.forEach((row) => {
        let selectedCells = activeSelectedRange.columns.map(
          (column) => getCompatibleCell(newLocation(row, column)).cell
        );
        selectedCells =
          direction === "left" ? selectedCells.reverse() : selectedCells;

        if (this.fillRange) {
          let cellsToFill = this.fillRange.columns.map(
            (column) => getCompatibleCell(newLocation(row, column)).cell
          );
          cellsToFill = fillCellsWithPredictedValues(
            selectedCells,
            cellsToFill
          );
          cellsToFill =
            direction === "left" ? cellsToFill.reverse() : cellsToFill;

          // 使用cellsToFill填充指定行
          state = this.fillRow(state, row, cellsToFill);
        }
      });

      return state;
    };
    switch (this.fillDirection) {
      case "right": {
        const newRange = cellMatrix.getRange(
          activeSelectedRange.first,
          newLocation(activeSelectedRange.last.row, location.column)
        );

        state = fillHorizontally(state, activeSelectedRange, "right");

        if (
          state?.props?.onSelectionChanging &&
          !state.props.onSelectionChanging([newRange])
        ) {
          return state;
        }

        state = {
          ...state,
          selectedRanges: [newRange],
          selectedIds: [
            ...activeSelectedRange.columns.map((col) => col.columnId),
            ...this.fillRange.columns.map((col) => col.columnId),
          ],
        };

        state.props?.onSelectionChanged &&
          state.props.onSelectionChanged(state.selectedRanges);

        break;
      }
      case "left": {
        const newRange = cellMatrix.getRange(
          activeSelectedRange.last,
          newLocation(activeSelectedRange.first.row, location.column)
        );

        state = fillHorizontally(state, activeSelectedRange, "left");

        if (
          state?.props?.onSelectionChanging &&
          !state.props.onSelectionChanging([newRange])
        ) {
          return state;
        }

        state = {
          ...state,
          selectedRanges: [newRange],
          selectedIds: [
            ...activeSelectedRange.columns.map((col) => col.columnId),
            ...this.fillRange.columns.map((col) => col.columnId),
          ],
        };

        state.props?.onSelectionChanged &&
          state.props.onSelectionChanged(state.selectedRanges);

        break;
      }
      case "up": {
        const newRange = cellMatrix.getRange(activeSelectedRange.last, {
          row: location.row,
          column: activeSelectedRange.first.column,
        });

        state = fillVertically(state, activeSelectedRange, "up");

        if (
          state?.props?.onSelectionChanging &&
          !state.props.onSelectionChanging([newRange])
        ) {
          return state;
        }

        state = {
          ...state,
          selectedRanges: [newRange],
          selectedIds: [
            ...activeSelectedRange.rows.map((row) => row.rowId),
            ...this.fillRange.rows.map((row) => row.rowId),
          ],
        };

        state.props?.onSelectionChanged &&
          state.props.onSelectionChanged(state.selectedRanges);

        break;
      }
      case "down": {
        const newRange = cellMatrix.getRange(
          activeSelectedRange.first,
          newLocation(location.row, activeSelectedRange.last.column)
        );

        state = fillVertically(state, activeSelectedRange, "down");

        if (
          state?.props?.onSelectionChanging &&
          !state.props.onSelectionChanging([newRange])
        ) {
          return state;
        }

        state = {
          ...state,
          selectedRanges: [newRange],
          selectedIds: [
            ...activeSelectedRange.rows.map((row) => row.rowId),
            ...this.fillRange.rows.map((row) => row.rowId),
          ],
        };

        state.props?.onSelectionChanged &&
          state.props.onSelectionChanged(state.selectedRanges);

        break;
      }
    }

    return state;
  }

  /**
   * 计算回归函数中的x值
   * @param y {number} y值
   * @param a {number} a值
   * @param b {number} b值
   * @returns {number} 计算得到的x值
   */
  calculateXForRegressionFunction(y: number, a: number, b: number): number {
    return Math.round(((y - a) / b) * 1e5) / 1e5;
  }

  /**
   * 寻找回归函数
   * @param valuesX X轴数值数组
   * @param valuesY Y轴数值数组
   * @returns { a: number; b: number } - 回归函数的斜率和截距
   */
  findRegressionFunction(
    valuesX: number[],
    valuesY: number[]
  ): { a: number; b: number } {
    const sumX = this.sumArray(valuesX); // X轴数值之和
    const sumY = this.sumArray(valuesY); // Y轴数值之和
    const sumXY = this.sumArray(this.multipleArrays(valuesX, valuesY)); // X轴数值与Y轴数值的乘积之和
    const sumPowX = this.sumArray(this.powerArray(valuesX, 2)); // X轴数值的平方之和
    const n = valuesX.length; // 数值数组的长度
    const upValue = Math.fround(n * sumXY - sumX * sumY); // 上升值
    const downValue = Math.fround(n * sumPowX - Math.pow(sumX, 2)); // 下降值
    const b = upValue / downValue; // 回归函数的斜率
    const a = sumY / n - b * (sumX / n); // 回归函数的截距
    return { a, b }; // 返回斜率和截距
  }
  sumArray(arr: number[]): number {
    return arr.reduce((a, b) => a + b);
  }

  /**
   * 多个数组相乘
   * @param first 第一个数组
   * @param second 第二个数组
   * @returns 乘法结果数组
   */
  multipleArrays(first: number[], second: number[]): number[] {
    const result = [];
    const stopCondition =
      first.length <= second.length ? first.length : second.length;
    for (let i = 0; i < stopCondition; ++i) {
      result.push(first[i] * second[i]);
    }
    return result;
  }

  powerArray(arr: number[], power: number): number[] {
    return arr.map((x) => Math.pow(x, power));
  }

  /**
   * 渲染部分面板
   * @param state - 状态对象
   * @param pane - 范围对象
   * @returns React节点
   */
  renderPanePart(state: State, pane: Range): React.ReactNode {
    return (
      this.fillDirection &&
      this.fillRange &&
      isRangeIntersects(pane, this.fillRange) && (
        <PartialArea
          range={state.cellMatrix.validateRange(this.fillRange)}
          className="rg-partial-area-part"
          pane={pane}
          style={{
            backgroundColor: "",
            borderTop:
              this.fillDirection === "down" ? "0px solid transparent" : "",
            borderBottom:
              this.fillDirection === "up" ? "0px solid transparent" : "",
            borderLeft:
              this.fillDirection === "right" ? "0px solid transparent" : "",
            borderRight:
              this.fillDirection === "left" ? "0px solid transparent" : "",
          }}
        />
      )
    );
  }
  /**
   * 获取填充方向
   *
   * @param selectedRange 选中范围
   * @param pointerLocation 指针位置
   * @returns 填充方向
   */
  private getFillDirection(selectedRange: Range, pointerLocation: Location) {
    // active selection
    const differences: { direction: Direction; value: number }[] = [];
    differences.push({ direction: "", value: 0 });
    differences.push({
      direction: "up",
      value:
        pointerLocation.row.idx < selectedRange.first.row.idx
          ? selectedRange.first.row.idx - pointerLocation.row.idx
          : 0,
    });
    differences.push({
      direction: "down",
      value:
        pointerLocation.row.idx > selectedRange.last.row.idx
          ? pointerLocation.row.idx - selectedRange.last.row.idx
          : 0,
    });
    differences.push({
      direction: "left",
      value:
        pointerLocation.column.idx < selectedRange.first.column.idx
          ? selectedRange.first.column.idx - pointerLocation.column.idx
          : 0,
    });
    differences.push({
      direction: "right",
      value:
        pointerLocation.column.idx > selectedRange.last.column.idx
          ? pointerLocation.column.idx - selectedRange.last.column.idx
          : 0,
    });
    return differences.reduce((prev, current) =>
      prev.value >= current.value ? prev : current
    ).direction;
  }

  /**
   * 根据指定的填充方向获取要填充的范围
   * @param cellMatrix - 单元格矩阵对象
   * @param selectedRange - 选中的范围
   * @param location - 当前单元格的位置
   * @param fillDirection - 填充方向
   * @returns 要填充的单元格范围
   */
  private getFillRange(
    cellMatrix: CellMatrix,
    selectedRange: Range,
    location: Location,
    fillDirection: Direction
  ) {
    switch (fillDirection) {
      case "right":
        return cellMatrix.getRange(
          cellMatrix.getLocation(
            selectedRange.first.row.idx,
            cellMatrix.last.column.idx < selectedRange.last.column.idx + 1
              ? cellMatrix.last.column.idx
              : selectedRange.last.column.idx + 1
          ),
          newLocation(selectedRange.last.row, location.column)
        );
      case "left":
        return cellMatrix.getRange(
          newLocation(selectedRange.first.row, location.column),
          cellMatrix.getLocation(
            selectedRange.last.row.idx,
            cellMatrix.first.column.idx > selectedRange.first.column.idx - 1
              ? cellMatrix.first.column.idx
              : selectedRange.first.column.idx - 1
          )
        );
      case "up":
        return cellMatrix.getRange(
          newLocation(location.row, selectedRange.first.column),
          cellMatrix.getLocation(
            cellMatrix.first.row.idx > selectedRange.first.row.idx - 1
              ? cellMatrix.first.row.idx
              : selectedRange.first.row.idx - 1,
            selectedRange.last.column.idx
          )
        );
      case "down":
        return cellMatrix.getRange(
          cellMatrix.getLocation(
            cellMatrix.last.row.idx < selectedRange.last.row.idx + 1
              ? cellMatrix.last.row.idx
              : selectedRange.last.row.idx + 1,
            selectedRange.first.column.idx
          ),
          newLocation(location.row, selectedRange.last.column)
        );
    }
    return undefined;
  }

  /**
   * 在给定的行中填充单元格值
   * @param state - 状态对象
   * @param row - 行对象
   * @param values - 要填充的单元格值数组
   * @returns 更新后的状态对象
   */
  private fillRow(
    state: State,
    row: GridRow,
    values: Compatible<Cell>[]
  ): State {
    this.fillRange?.columns.forEach((col, i) => {
      state = tryAppendChangeHavingGroupId(
        state,
        newLocation(row, col),
        values[i]
      ) as State;
    });
    return state;
  }
  /**
   * 在指定列中填充数据，并返回填充后的状态
   * @param state - 当前状态
   * @param column - 列对象
   * @param values - 填充的值数组
   * @returns 填充后的状态
   */
  private fillColumn(
    state: State,
    column: GridColumn,
    values: Compatible<Cell>[]
  ): State {
    this.fillRange?.rows.forEach((row, i) => {
      state = tryAppendChangeHavingGroupId(
        state,
        newLocation(row, column),
        values[i]
      ) as State;
    });
    return state;
  }
}
