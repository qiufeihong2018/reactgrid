import { FC, useEffect, useRef, useState } from "react";
import CellWrapper from "../components/CellWrapper";
import { useCellContext } from "../components/CellContext";
import { useDoubleTouch } from "../hooks/useDoubleTouch";
import { isAlphaNumericWithoutModifiers } from "../utils/keyCodeCheckings";

interface TextCellProps {
  text: string;
  onTextChanged: (newText: string) => void;
  style?: React.CSSProperties;
}

export const TextCell: FC<TextCellProps> = ({ text: initialText, onTextChanged }) => {
  const ctx = useCellContext();
  const targetInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setEditMode] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialText || "");
  const { handleDoubleTouch } = useDoubleTouch(ctx, setEditMode);

  useEffect(() => {
    setCurrentValue(initialText);
  }, [initialText]);

  return (
    <CellWrapper
      onStringValueRequsted={() => initialText}
      onStringValueReceived={(v) => onTextChanged(v)}
      onTouchEnd={handleDoubleTouch}
      style={{ padding: ".2rem", textAlign: "center", outline: "none", minHeight: 0 }}
      onDoubleClick={() => {
        if (ctx.isFocused) {
          setEditMode(true);
        }
      }}
      onKeyDown={(e) => {
        if (!isEditMode && isAlphaNumericWithoutModifiers(e)) {
          setCurrentValue("");
          setEditMode(true);
        } else if (!isEditMode && e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          setCurrentValue(initialText || "");
          setEditMode(true);
        } else if (!isEditMode && e.key === "Backspace") {
          onTextChanged("");
        }
      }}
    >
      {isEditMode ? (
        <input
          value={currentValue}
          style={inputStyle}
          onChange={(e) => setCurrentValue(e.currentTarget.value)}
          onBlur={(e) => {
            onTextChanged(e.currentTarget.value);
            setEditMode(false);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            const controlKeys = ["Escape", "Enter", "Tab"];
            if (!controlKeys.includes(e.key)) {
              e.stopPropagation();
            }
            if (e.key === "Escape") {
              setEditMode(false);
            } else if (e.key === "Enter") {
              e.preventDefault();
              onTextChanged(e.currentTarget.value);
              setEditMode(false);
            }
          }}
          autoFocus
          ref={targetInputRef}
        />
      ) : (
        initialText
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
