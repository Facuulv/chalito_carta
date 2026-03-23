"use client";

import { TriangleAlert } from "lucide-react";
import { getItemName } from "@/utils/cart/cartItem";

export default function CheckoutRemoveItemModal({
  itemToDelete,
  modalBounce,
  onBackdropClick,
  onCancel,
  onConfirm,
}) {
  if (!itemToDelete) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/45"
        onClick={onBackdropClick}
        aria-hidden
      />
      <div className="modal-slide-down relative z-10 flex justify-center">
        <div
          className={`w-full max-w-sm rounded-lg bg-white p-4 shadow-lg ${
            modalBounce ? "modal-bounce" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex justify-center">
            <TriangleAlert size={40} className="text-red-500" strokeWidth={2} />
          </div>
          <p
            className="text-center"
            style={{
              fontFamily:
                'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              color: "#21243d",
              fontSize: "1.2em",
              lineHeight: 1.4,
            }}
          >
            El producto <strong>{getItemName(itemToDelete)}</strong> se removerá de
            su pedido. ¿Estás seguro?
          </p>
          <p
            className="mt-2 text-center"
            style={{
              fontFamily:
                'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              color: "#94a3b8",
              fontSize: "0.9em",
              lineHeight: 1.4,
            }}
          >
            Esta acción no puede deshacerse.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-36 rounded-lg bg-white transition hover:brightness-95"
              style={{
                fontSize: "16px",
                height: "35px",
                fontWeight: 500,
                lineHeight: 1,
                boxSizing: "border-box",
                border: "1px solid #ff7c7c",
                color: "#ff7c7c",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-36 rounded-lg text-white transition hover:brightness-110"
              style={{
                fontSize: "16px",
                height: "35px",
                fontWeight: 500,
                lineHeight: 1,
                boxSizing: "border-box",
                backgroundColor: "#ff7c7c",
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
