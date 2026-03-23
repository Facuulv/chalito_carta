"use client";

export default function CustomerSection({
  nombre,
  setNombre,
  telefono,
  setTelefono,
  email,
  setEmail,
  fieldErrors,
  clearFieldError,
}) {
  return (
    <section className="space-y-3">
      <h2 className="-mx-4 w-[calc(100%+2rem)] rounded-none border border-neutral-200 bg-[#f8f8f8] px-3 py-1.5 text-center text-sm font-semibold text-slate-800">
        Datos del cliente
      </h2>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
            Nombre y apellido
          </span>
          <input
            id="checkout-nombre"
            type="text"
            value={nombre}
            onChange={(e) => {
              const raw = e.target.value;
              // Solo letras (con tildes/ñ), espacios y apóstrofe
              const cleaned = raw.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+/g, "");
              setNombre(cleaned);
              clearFieldError("nombre");
            }}
            required
            placeholder="Introduzca nombre y apellido"
            className={`h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 ${
              fieldErrors.nombre
                ? "ring-2 ring-red-500 focus:ring-red-500"
                : "focus:ring-neutral-300/40"
            }`}
          />
          {fieldErrors.nombre && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.nombre}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
            Teléfono
          </span>
          <input
            id="checkout-telefono"
            type="tel"
            inputMode="numeric"
            pattern="\d*"
            value={telefono}
            onChange={(e) => {
              const raw = e.target.value;
              // Solo dígitos para teléfono
              const digitsOnly = raw.replace(/\D/g, "");
              setTelefono(digitsOnly);
              clearFieldError("telefono");
            }}
            required
            placeholder="Introduzca un numero de teléfono"
            className={`h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 ${
              fieldErrors.telefono
                ? "ring-2 ring-red-500 focus:ring-red-500"
                : "focus:ring-neutral-300/40"
            }`}
          />
          {fieldErrors.telefono && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.telefono}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
            Email (opcional)
          </span>
          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            placeholder="Introduzca un email"
            className={`h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 ${
              fieldErrors.email
                ? "ring-2 ring-red-500 focus:ring-red-500"
                : "focus:ring-neutral-300/40"
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </label>
      </div>
    </section>
  );
}
