import React, { StrictMode, useState } from "react";
import { Column, ReactGrid, Row } from "../lib/main";
import { StoryDefault } from "@ladle/react";
import { ErrorBoundary } from "../lib/components/ErrorBoundary";
import { generateCells, peopleArr, rgStyles } from "./utils/examplesConfig";
import { handleCopy } from "./utils/handleCopy";
import { handleCut } from "./utils/handleCut";
import { handlePaste } from "./utils/handlePaste";

export const CutCopyPasteExample = () => {
  const [rows, setRows] = useState<Row[]>([
    { rowIndex: 0, height: 30, reorderable: false },
    { rowIndex: 1, height: 30 },
    { rowIndex: 2, height: 30 },
    { rowIndex: 3, height: 30 },
    { rowIndex: 4, height: 30 },
  ]);

  const [columns, setColumns] = useState<Column[]>([
    { colIndex: 0, width: 100 },
    { colIndex: 1, width: 50 },
    { colIndex: 2, width: 200 },
    { colIndex: 3, width: 100 },
  ]);

  const [people, setPeople] = useState(peopleArr);

  const updatePerson = (id, key, newValue) => {
    setPeople((prev) => {
      return prev.map((p) => (p._id !== id ? p : { ...p, [key]: newValue }));
    });
  };

  const cells = generateCells(rows, columns, people, updatePerson);

  return (
    <div>
      <ReactGrid
        id="cut-copy-paste-example"
        styles={rgStyles}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        initialFocusLocation={{ rowIndex: 2, colIndex: 1 }}
        rows={rows}
        columns={columns}
        cells={cells}
      />
    </div>
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
