import React, { FC, useEffect, useRef, useState } from "react";
import { useCellContext } from "../components/CellContext";
import CellWrapper from "../components/CellWrapper";
import { useDoubleTouch } from "../hooks/useDoubleTouch";
import { inNumericKey } from "../utils/keyCodeCheckings";

interface NumberCellProps {
  value: number;
  onValueChanged: (newValue: number) => void;
  validator?: (value: number) => boolean;
  errorMessage?: string;
  hideZero?: boolean;
  format?: Intl.NumberFormat;
  style?: React.CSSProperties;
}

export const NumberCell: FC<NumberCellProps> = ({ value: initialValue, validator, errorMessage, hideZero, format }) => {
  const ctx = useCellContext();
  const targetInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setEditMode] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue || 0);
  const { handleDoubleTouch } = useDoubleTouch(ctx, setEditMode);

  const isValid = validator ? validator(Number(initialValue)) : true;

  const cellIndexes = { rowIndex: ctx.realRowIndex, colIndex: ctx.realColumnIndex };

  let textToDisplay = currentValue.toString();

  if (hideZero && currentValue === 0) {
    textToDisplay = "";
  } else if (format) {
    textToDisplay = format.format(currentValue);
  } else if (!isValid && errorMessage) {
    textToDisplay = errorMessage;
  }

  useEffect(() => {
    if (targetInputRef.current) targetInputRef.current?.setSelectionRange(textToDisplay.length, textToDisplay.length);
  }, [isEditMode, textToDisplay]);

  return (
    <CellWrapper
      onTouchEnd={handleDoubleTouch}
      onDoubleClick={() => {
        setEditMode(true);
      }}
      onKeyDown={(e) => {
        if (!isEditMode && inNumericKey(e.keyCode)) {
          setCurrentValue(0);
          setEditMode(true);
        } else if (!isEditMode && e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          setCurrentValue(initialValue || 0);
          setEditMode(true);
        } else if (!isEditMode && e.key === "Backspace") {
          ctx.onCellChanged(cellIndexes, 0);
        }
      }}
      targetInputRef={targetInputRef}
    >
      {isEditMode ? (
        <input
          value={currentValue}
          onChange={(e) => setCurrentValue(Number(e.currentTarget.value))}
          onBlur={(e) => {
            ctx.onCellChanged(cellIndexes, Number(e.currentTarget.value));
            setEditMode(false);
          }}
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditMode(false);
            } else if (e.key === "Enter") {
              e.preventDefault();
              ctx.onCellChanged(cellIndexes, Number(e.currentTarget.value));
              setEditMode(false);
            }
          }}
          autoFocus
          ref={targetInputRef}
        />
      ) : (
        initialValue
      )}
    </CellWrapper>
  );
};

const inputStyle: React.CSSProperties = {
  resize: "none",
  overflowY: "hidden",
  boxSizing: "border-box",
  textAlign: "center",
  width: "100%",
  height: "100%",
  background: "transparent",
  border: "none",
  padding: 0,
  outline: "none",
  color: "inherit",
  fontSize: "inherit",
  fontFamily: "inherit",
};
