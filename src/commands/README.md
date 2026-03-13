// ============================================
//   📌 ÍNDICE DE COMANDOS
//   Este archivo re-exporta todos los comandos
//   en el formato correcto para el loader
// ============================================

// Este directorio es escaneado por src/index.js
// Cada archivo puede exportar UN objeto {data, execute}
// o un ARRAY de objetos {data, execute}

// El loader en index.js solo carga archivos .js
// y espera { data, execute } en module.exports

// Para archivos que exportan arrays (controls.js, music.js),
// el loader necesita manejar ambos casos.
// Ver src/index.js — el loader ya maneja esto.
