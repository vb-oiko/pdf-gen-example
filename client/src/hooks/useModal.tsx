import React, { PropsWithChildren } from "react";
import { noOp } from "../utils/noOp";

export interface ModalProps {
  onCancel?: () => {};
  onConfirm?: () => {};
  title?: string;
  form?: string;
  confirmText?: string;
}

export const useModal = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const open = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
    children,
    onCancel = noOp,
    onConfirm = noOp,
    title,
    form,
    confirmText = "Confirm",
  }) => {
    const handleCancel = React.useCallback(() => {
      onCancel();
      setIsModalOpen(false);
    }, []);

    const handleConfirm = React.useCallback(() => {
      onConfirm();
      setIsModalOpen(false);
    }, []);

    return (
      <>
        <dialog open={isModalOpen}>
          <article>
            <a
              href="#close"
              aria-label="Close"
              className="close"
              data-target="modal-example"
              onClick={handleCancel}
            ></a>
            {title ? <h3>{title}</h3> : null}
            {children}
            <footer>
              <a
                href="#cancel"
                role="button"
                className="secondary"
                onClick={handleCancel}
              >
                Cancel
              </a>

              <button
                style={{
                  display: "inline-block",
                  width: "initial",
                  marginLeft: "10px",
                }}
                onClick={handleConfirm}
                role="button"
                form={form}
                type="submit"
              >
                {confirmText}
              </button>
            </footer>
          </article>
        </dialog>
      </>
    );
  };

  return { Modal, open };
};
