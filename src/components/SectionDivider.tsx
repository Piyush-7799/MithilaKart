import React from "react";
import { MithilaLotus, MithilaFish, MithilaSun } from "./MithilaMotif";

interface SectionDividerProps {
  className?: string;
  motif?: "lotus" | "fish" | "sun" | "diamond";
  label?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  className = "",
  motif = "lotus",
  label,
}) => {
  return (
    <div
      className={`mithila-section-divider ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="divider-flourish-left">
        <span className="flourish-line" />
        <span className="flourish-dot flourish-dot-outer" />
        <span className="flourish-dot flourish-dot-inner" />
      </div>

      <div className="divider-motif-center">
        {motif === "lotus" && (
          <MithilaLotus size={28} color="#059669" secondaryColor="#d97706" />
        )}
        {motif === "fish" && (
          <MithilaFish size={32} color="#047857" secondaryColor="#c2410c" />
        )}
        {motif === "sun" && (
          <MithilaSun size={32} color="#059669" secondaryColor="#d97706" />
        )}
        {motif === "diamond" && (
          <div className="divider-diamond-cluster">
            <span className="diamond-side" />
            <span className="diamond-main" />
            <span className="diamond-side" />
          </div>
        )}
        {label && <span className="divider-label">{label}</span>}
      </div>

      <div className="divider-flourish-right">
        <span className="flourish-dot flourish-dot-inner" />
        <span className="flourish-dot flourish-dot-outer" />
        <span className="flourish-line" />
      </div>
    </div>
  );
};
