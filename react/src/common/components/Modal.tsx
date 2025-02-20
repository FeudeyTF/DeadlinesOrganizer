import React, { useEffect, useCallback } from "react";
import { Button } from "./Button";
import { classes } from "../functions";
import { DefaultProps } from "../types";

export type ModalProps = {
  onClose?: () => void;
  title: string;
  isOpen: boolean;
} & DefaultProps;

export function Modal(props: ModalProps) {
  const { onClose, title, children, className, isOpen } = props;

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (onClose) {
          onClose();
        }
      }
    },
    [isOpen, onClose]
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (onClose) {
        onClose();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  return (
    <div
      className={classes(["modal", isOpen && "active", className])}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className="modal-content">
        {title && (
          <h2 className="title" id="modal-title">
            {title}
            <Button className="close" color="bad" onClick={onClose} icon="times"/>
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
