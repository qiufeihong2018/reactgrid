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

export const NumberCell: FC<NumberCellProps> = ({
  value: initialValue,
  onValueChanged,
  validator,
  errorMessage,
  hideZero,
  format,
}) => {
  const ctx = useCellContext();
  const targetInputRef = useRef<HTMLTextAreaElement>(null);
  const [isEditMode, setEditMode] = useState(false);

  const { handleDoubleTouch } = useDoubleTouch(ctx, setEditMode);

  const isValid = validator ? validator(Number(initialValue)) : true;

  let textToDisplay = initialValue.toString();

  if (hideZero && initialValue === 0) {
    textToDisplay = "";
  } else if (format) {
    textToDisplay = format.format(initialValue);
  } else if (!isValid && errorMessage) {
    textToDisplay = errorMessage;
  }

  useEffect(() => {
    if (initialValue) targetInputRef.current?.setSelectionRange(textToDisplay.length, textToDisplay.length);
  }, [isEditMode, textToDisplay]);

  return (
    <CellWrapper
      onTouchEnd={handleDoubleTouch}
      style={{ padding: ".2rem", textAlign: "center", outline: "none" }}
      onDoubleClick={() => {
        setEditMode(true);
        ctx.requestFocus();
      }}
      onKeyDown={(e) => {
        if (!isEditMode && (inNumericKey(e.keyCode) || e.key === "Enter")) {
          setEditMode(true);
        }
        if (!isEditMode && e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          ctx.requestFocus();
        }
      }}
      targetInputRef={targetInputRef}
    >
      {isEditMode ? (
        <textarea
          defaultValue={initialValue.toString()}
          onBlur={(e) => {
            onValueChanged(Number(e.currentTarget.value));
            setEditMode(false);
          }}
          style={{
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
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") {
              setEditMode(false);
            } else if (e.key === "Enter") {
              e.preventDefault();
              onValueChanged(Number(e.currentTarget.value));
              setEditMode(false);
              ctx.requestFocus("Bottom");
            }
          }}
          autoFocus
          ref={targetInputRef}
        />
      ) : (
        textToDisplay
      )}
    </CellWrapper>
  );
};
