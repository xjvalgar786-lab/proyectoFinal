module.exports = {
  exito: (datos, mensaje = 'Operación correcta') => ({
    ok: true,
    datos,
    mensaje
  }),
  error: (datos, mensaje = 'Error') => ({
    ok: false,
    datos: null,
    mensaje
  })
};