import React, { PropsWithChildren } from "react";
import { noOp } from "../utils/noOp";

export interface ModalProps {
  onCancel?: () => {};
  onConfirm?: () => {};
  title?: string;
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
            <p>{children}</p>
            <footer>
              <a
                href="#cancel"
                role="button"
                className="secondary"
                onClick={handleCancel}
              >
                Cancel
              </a>
              <a href="#confirm" role="button" onClick={handleConfirm}>
                Confirm
              </a>
            </footer>
          </article>
        </dialog>
      </>
    );
  };

  return { Modal, open };
};
