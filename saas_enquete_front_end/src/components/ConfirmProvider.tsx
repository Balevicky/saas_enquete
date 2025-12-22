import React, { createContext, useContext, useState, ReactNode } from "react";

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextProps {
  confirm: (message: ReactNode, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextProps | undefined>(
  undefined
);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx.confirm;
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<{
    show: boolean;
    message: ReactNode;
    resolve?: (value: boolean) => void;
    options?: ConfirmOptions;
  }>({ show: false, message: null });

  const confirm = (message: ReactNode, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ show: true, message, resolve, options });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ ...state, show: false, resolve: undefined });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ ...state, show: false, resolve: undefined });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.show && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {state.options?.title || "Confirmation"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCancel}
                  />
                </div>
                <div className="modal-body">{state.message}</div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCancel}>
                    {state.options?.cancelText || "Annuler"}
                  </button>
                  <button className="btn btn-danger" onClick={handleConfirm}>
                    {state.options?.confirmText || "Confirmer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </ConfirmContext.Provider>
  );
};
