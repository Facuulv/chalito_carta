"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Home, Info, Instagram, MapPin, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Sidebar({ isOpen, onClose }) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const canUsePortal = typeof document !== "undefined";

  const handleCloseAll = () => {
    setShowInfoModal(false);
    setShowLocationModal(false);
    onClose();
  };

  return (
    <>
      <aside
        className={`absolute left-0 top-0 z-40 h-full w-64 bg-sky-50 shadow-xl will-change-transform transition-transform duration-[400ms] ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <nav className="space-y-1.5 py-3">
          <Link
            href="/"
            onClick={handleCloseAll}
            className="flex w-full items-center gap-3 px-4 py-2 text-[14px] font-semibold text-slate-800 transition hover:bg-sky-100 active:scale-[0.99]"
          >
            <Home size={20} />
            <span>Inicio</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] font-semibold text-slate-800 transition hover:bg-sky-100 active:scale-[0.99]"
          >
            <Info size={20} />
            <span>Información</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] font-semibold text-slate-800 transition hover:bg-sky-100 active:scale-[0.99]"
          >
            <MapPin size={20} />
            <span>Ubicación</span>
          </button>

          <Link
            href="https://www.instagram.com/elchalito1"
            target="_blank"
            rel="noreferrer"
            onClick={handleCloseAll}
            className="flex w-full items-center gap-3 px-4 py-2 text-[14px] font-semibold text-slate-800 transition hover:bg-sky-100 active:scale-[0.99]"
          >
            <Instagram size={20} />
            <span>Instagram</span>
          </Link>
        </nav>
      </aside>

      {canUsePortal && showInfoModal && createPortal(
        <div
          className="fixed left-1/2 top-0 z-[100] flex min-h-screen w-full max-w-[480px] -translate-x-1/2 items-center justify-center bg-black/45 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowInfoModal(false)}
        >
          <div className="modal-slide-down relative w-full max-w-sm rounded-lg bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="rounded-md p-1 text-red-500 transition hover:bg-neutral-100"
                aria-label="Cerrar información"
              >
                <X size={18} />
              </button>
            </div>

            <div className="-mt-1 text-center">
              <div className="mb-1 flex justify-center">
                <Info size={32} className="text-blue-900" />
              </div>
              <h3 className="text-2xl font-medium text-slate-800">Información</h3>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1.5">
              <FaWhatsapp className="text-[15px] text-green-600" />
              <a
                href="https://wa.me/542302633818"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 transition-colors duration-200 hover:text-blue-400"
              >
                +54 2302 633818
              </a>
            </div>

            <div className="my-3 border-t border-neutral-200" />

            <div className="space-y-2.5 text-center text-[13px] text-slate-600">
              <p>
                <span className="font-semibold">Miércoles:</span> de 10:00AM a 13:00PM y de 18:00PM a 23:00PM.
              </p>
              <p>
                <span className="font-semibold">Jueves:</span> de 10:00AM a 13:00PM y de 18:00PM a 23:00PM.
              </p>
              <p>
                <span className="font-semibold">Viernes:</span> de 10:00AM a 13:00PM y de 17:00PM a 23:30PM.
              </p>
              <p>
                <span className="font-semibold">Sábado:</span> de 17:00PM a 23:30PM.
              </p>
              <p>
                <span className="font-semibold">Domingo:</span> de 17:00PM a 23:30PM.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {canUsePortal && showLocationModal && createPortal(
        <div
          className="fixed left-1/2 top-0 z-[100] flex min-h-screen w-full max-w-[480px] -translate-x-1/2 items-center justify-center bg-black/45 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowLocationModal(false)}
        >
          <div className="modal-slide-down relative w-full max-w-sm rounded-lg bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="rounded-md p-1 text-red-500 transition hover:bg-neutral-100"
                aria-label="Cerrar ubicación"
              >
                <X size={18} />
              </button>
            </div>

            <div className="-mt-1 text-center">
              <div className="mb-1 flex justify-center">
                <MapPin size={32} className="text-blue-900" />
              </div>
              <h3 className="text-2xl font-medium text-slate-800">Ubicación</h3>
              <p className="mt-3 text-sm text-slate-500">El Chalito</p>
            </div>

            <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.3790397739785!2d-63.75983451143895!3d-35.66766784378232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c37d34abfa2fcf%3A0x9c4ed9a3f8d37d13!2sEL%20CHALITO!5e0!3m2!1ses-419!2sar!4v1772033927447!5m2!1ses-419!2sar"
                className="h-72 w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="mt-3 flex justify-center">
              <a
                href="https://maps.app.goo.gl/gZArjnYEQwvMxnAn6"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 transition-colors duration-200 hover:text-blue-400"
              >
                <ExternalLink size={14} />
                <span>Abrir en Google Maps</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
