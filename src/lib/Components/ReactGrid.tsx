import * as React from "react";
import { CellRenderer, ReactGridProps } from "../../core";
import {
  GridRenderer,
  LegacyBrowserGridRenderer,
  StateModifier,
  CellEditorRenderer,
  handleStateUpdate,
} from "../../core";
import { PointerEventsController } from "../Model/PointerEventsController";
import { EventHandlers } from "../Model/EventHandlers";
import { getDerivedStateFromProps } from "../Functions/getDerivedStateFromProps";
import { PanesRenderer } from "./PanesRenderer";
import { DefaultBehavior } from "../Behaviors/DefaultBehavior";
import { CellMatrixBuilder } from "../Model/CellMatrixBuilder";
import { defaultStateFields, State } from "../Model/State";
import { Line } from "./Line";
import { Shadow } from "./Shadow";
import { ContextMenu } from "./ContextMenu";
import { componentDidUpdate } from "../Functions/componentDidUpdate";
import { StateProvider } from "./StateProvider";

export class ReactGrid extends React.Component<ReactGridProps, State> {
  private updateState = (state: State) => this.setState(state);
  private stateUpdater = (modifier: StateModifier) =>
    handleStateUpdate(
      modifier(this.state) as State,
      this.state,
      this.props,
      this.updateState
    );
  private pointerEventsController = new PointerEventsController(
    this.stateUpdater
  );
  private eventHandlers = new EventHandlers(
    this.stateUpdater,
    this.pointerEventsController
  );
  private cellMatrixBuilder = new CellMatrixBuilder();
  state: State = {
    update: this.stateUpdater,
    ...defaultStateFields,
    currentBehavior: new DefaultBehavior(),
    cellMatrix: this.cellMatrixBuilder
      .setProps(this.props)
      .fillRowsAndCols()
      .setRangesToRenderLookup()
      .fillSticky()
      .fillScrollableRange()
      .setEdgeLocations()
      .getCellMatrix(),
  };
  
  /**
   * 从属性和状态中派生新的状态。
   * 
   * @param props - 组件的属性。
   * @param state - 组件的状态。
   * @returns 新的状态，或者null表示不更新状态。
   */
  static getDerivedStateFromProps(
      props: ReactGridProps,
      state: State
    ): State | null {
    try {
      return getDerivedStateFromProps(props, state);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  componentDidUpdate(prevProps: ReactGridProps, prevState: State): void {
    if (!prevState.reactGridElement && this.state.reactGridElement) {
      this.state.scrollableElement?.addEventListener(
        "scroll",
        this.eventHandlers.scrollHandler
      );
    }
    componentDidUpdate(prevProps, prevState, this.state);
  }

  componentDidMount(): void {
    window.addEventListener("resize", this.eventHandlers.windowResizeHandler);
  }

  componentWillUnmount(): void {
    window.removeEventListener(
      "resize",
      this.eventHandlers.windowResizeHandler
    );
    this.state.scrollableElement?.removeEventListener(
      "scroll",
      this.eventHandlers.scrollHandler
    );
    this.setState({
      contextMenuPosition: { top: -1, left: -1 }
    });
  }

  render(): React.ReactNode {
    const { state, eventHandlers } = this;

    if (state.legacyBrowserMode) {
      return (
        <StateProvider state={state}>
          <LegacyBrowserGridRenderer eventHandlers={eventHandlers} />
        </StateProvider>
      );
    }

    return (
      <StateProvider state={state}>
        <GridRenderer eventHandlers={eventHandlers}>
          <PanesRenderer cellRenderer={CellRenderer} />

          <Line />

          <Shadow />

          <ContextMenu />

          {state.currentlyEditedCell && <CellEditorRenderer />}
        </GridRenderer>
      </StateProvider>
    );
  }
}
