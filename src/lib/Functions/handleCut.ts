export const handleCut = (): void => {
  // When context menus are cut, add cut-ant-line-box and render rg-partial-area-cut-range asynchronously
  setTimeout(() => {
    const selectedElement = document.querySelector<HTMLElement>(".rg-partial-area-cut-range");
    if (selectedElement) {
      selectedElement.classList.add("cut-ant-line-box");
      setTimeout(() => {
        selectedElement.classList.remove("cut-ant-line-box");
      }, 60000);
    }
  }, 0);
};
