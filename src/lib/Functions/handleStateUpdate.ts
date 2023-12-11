import { ReactGridProps } from '../Model/PublicModel';
import { State } from '../Model/State';

/**
 * 处理状态更新
 * @param newState 新状态
 * @param state 当前状态
 * @param props 元素属性
 * @param setState 设置状态
 */
export function handleStateUpdate<TState extends State = State>(newState: TState, state: TState, props: ReactGridProps, setState: (state: TState) => void): void {
    const changes = [...newState.queuedCellChanges];
    if (changes.length > 0) {
        if (props.onCellsChanged) {
            props.onCellsChanged([...changes]);
        }
        changes.forEach(() => newState.queuedCellChanges.pop());
    }
    if (newState !== state) {
        setState(newState);
    }
}
