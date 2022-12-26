import React from "react";
import { useModal } from "../hooks/useModal";

export const CreateReportButton = () => {
  const { Modal, open } = useModal();

  return (
    <>
      <span role="button" onClick={open}>
        Create report
      </span>

      <Modal title="Create report" />
    </>
  );
};
