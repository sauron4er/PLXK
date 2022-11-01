import React from "react";
import { ComponentPreview, Previews } from "@react-buddy/ide-toolbox";
import { PaletteTree } from "./palette";
import reclamations from "boards/templates/boards/reclamations/reclamations";

const ComponentPreviews = () => {
  return (
    <Previews palette={<PaletteTree />}>
      <ComponentPreview path="/reclamations">
        <reclamations />
      </ComponentPreview>
    </Previews>
  );
};

export default ComponentPreviews;