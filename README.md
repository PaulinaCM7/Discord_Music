# 🎵 Discord Music Bot

Un bot de música completo para Discord con soporte de **Spotify** y **YouTube**, con una interfaz visual hermosa y controles interactivos.

---

## ✨ Características

| Función | Descripción |
|---------|-------------|
| 🎵 **YouTube** | Reproduce canciones y playlists de YouTube |
| 🟢 **Spotify** | Soporta canciones, álbumes y playlists de Spotify |
| 📋 **Queue** | Sistema de cola con paginación |
| 🔂 **Loop** | Bucle de canción o de toda la cola |
| 🔀 **Shuffle** | Mezcla aleatoria de la cola |
| ⏮️⏭️ **Navegación** | Saltar adelante y atrás entre canciones |
| 🎛️ **Botones** | Controles interactivos en los embeds |
| 🔊 **Volumen** | Control de volumen ajustable |
| 🗑️ **Gestión** | Eliminar, mover y limpiar la cola |

---

## 🚀 Instalación

### Requisitos previos

- **Node.js** v18 o superior — [descargar](https://nodejs.org)
- **yt-dlp** instalado en el sistema:
  ```bash
  # Windows (winget)
  winget install yt-dlp

  # macOS (homebrew)
  brew install yt-dlp

  # Linux
  pip install yt-dlp
  # o
  sudo apt install yt-dlp
  ```
- **FFmpeg** instalado:
  ```bash
  # Windows (winget)
  winget install ffmpeg

  # macOS
  brew install ffmpeg

  # Linux
  sudo apt install ffmpeg
  ```

### Pasos de instalación

**1. Clonar / descargar el proyecto**
```bash
cd discord-music-bot
npm install
```

**2. Crear el bot de Discord**
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a **Bot** → Crea un bot
4. Copia el **Token**
5. En **Privileged Gateway Intents**, activa:
   - ✅ `Server Members Intent`
   - ✅ `Message Content Intent`
6. En **OAuth2 → URL Generator**, selecciona:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Read Message History`

**3. Configurar Spotify (opcional pero recomendado)**
1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una app
3. Copia `Client ID` y `Client Secret`

**4. Configurar variables de entorno**
```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
```

**5. Iniciar el bot**
```bash
npm start

# O en modo desarrollo (auto-reinicio)
npm run dev
```

---

## 🎮 Comandos

| Comando | Descripción |
|---------|-------------|
| `/play [búsqueda/URL]` | 🎵 Reproduce una canción o playlist |
| `/queue [página]` | 📋 Muestra la cola de reproducción |
| `/skip` | ⏭️ Salta la canción actual |
| `/previous` | ⏮️ Regresa a la canción anterior |
| `/pause` | ⏸️ Pausa o reanuda la reproducción |
| `/stop` | ⏹️ Detiene la música y vacía la cola |
| `/loop [modo]` | 🔂 Configura el modo de bucle |
| `/shuffle` | 🔀 Mezcla la cola aleatoriamente |
| `/volume [1-150]` | 🔊 Ajusta el volumen |
| `/nowplaying` | 🎵 Muestra la canción actual |
| `/remove [posición]` | 🗑️ Elimina una canción de la cola |
| `/clear` | 🧹 Limpia toda la cola |
| `/move [desde] [hasta]` | 🔃 Mueve una canción en la cola |

### URLs soportadas

```
# YouTube
https://www.youtube.com/watch?v=...
https://www.youtube.com/playlist?list=...
https://youtu.be/...

# Spotify
https://open.spotify.com/track/...
https://open.spotify.com/album/...
https://open.spotify.com/playlist/...

# Búsqueda directa
/play nombre de la canción
/play artista - canción
```

---

## 🎛️ Botones del Player

Cuando se reproduce una canción, aparece un panel de control con estos botones:

```
[ ⏮️ Anterior ] [ ⏸️ Pausar ] [ ⏭️ Saltar ] [ ⏹️ Detener ]
[ 🔂 Loop OFF ] [ 🔁 Cola Loop ] [ 🔀 Aleatorio ] [ 📋 Ver Cola ]
```

---

## 📁 Estructura del proyecto

```
discord-music-bot/
├── src/
│   ├── index.js                    # Punto de entrada
│   ├── commands/
│   │   ├── play.js                 # Comando /play
│   │   ├── queue.js                # Comando /queue
│   │   ├── controls.js             # Comandos skip, previous, stop, pause
│   │   └── music.js                # Comandos loop, shuffle, volume, etc.
│   ├── handlers/
│   │   ├── clientEvents.js         # Manejo de botones e interacciones
│   │   └── distubeEvents.js        # Eventos de DisTube
│   └── utils/
│       ├── embeds.js               # Creador de embeds visuales
│       └── deployCommands.js       # Deploy de slash commands
├── .env                            # Variables de entorno (NO subir a git)
├── .env.example                    # Plantilla de variables
├── package.json
└── README.md
```

---

## 🔧 Solución de problemas

**❌ Error: `yt-dlp not found`**
→ Instala yt-dlp: `pip install yt-dlp`

**❌ Error al conectar a voz**
→ Verifica que el bot tenga permisos `Connect` y `Speak` en el canal

**❌ Spotify no funciona**
→ Verifica las credenciales en `.env`. Spotify requiere `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET`

**❌ `ffmpeg not found`**
→ Instala FFmpeg y asegúrate de que esté en el PATH del sistema

**❌ Commands not appearing**
→ Espera hasta 1 hora para que Discord los propague. Los commands globales pueden tardar.

---

## 📝 Notas importantes

- ⚠️ **Nunca** compartas tu `.env` ni el token del bot
- El bot descarga/streama audio directamente, no almacena archivos
- Para playlists muy grandes (>200 canciones), puede tardar unos segundos en cargar
- El volumen máximo es 150% (puede distorsionarse por encima de 100%)

---

## 📄 Licencia

MIT — Úsalo, modifícalo y distribúyelo libremente.
