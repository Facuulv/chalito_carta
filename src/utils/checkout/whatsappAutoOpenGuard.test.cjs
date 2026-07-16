const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('whatsappAutoOpenGuard expone mensajes por motivo', () => {
  const source = fs.readFileSync(
    path.join(__dirname, 'whatsappAutoOpenGuard.js'),
    'utf8'
  );
  assert.match(source, /feature_desactivada/);
  assert.match(source, /pago_pendiente/);
  assert.match(source, /sin_numero/);
  assert.match(source, /markWhatsAppAutoOpened/);
  assert.match(source, /resolveWhatsAppClienteMessage/);
});
