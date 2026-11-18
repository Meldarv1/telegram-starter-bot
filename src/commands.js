
import { InlineKeyboard } from "grammy"

const CANAL = "@lavitrinaonline"

async function verificarSuscripcion(ctx) {
  try {
    const miembro = await ctx.api.getChatMember(
      CANAL,
      ctx.from.id
    )

    return (
      ["creator", "administrator", "member"].includes(miembro.status) ||
      (miembro.status === "restricted" && miembro.is_member)
    )
  } catch (error) {
    console.error("Error verificando suscripción:", error)
    return null
  }
}

function tecladoSuscripcion() {
  return new InlineKeyboard()
    .url("📢 Unirme al canal", "https://t.me/lavitrinaonline")
    .row()
    .text("✅ Ya me uní", "comprobar_suscripcion")
}

function tecladoPrincipal() {
  return new InlineKeyboard()
    .text("🔎 Buscar subtítulos", "buscar")
    .row()
    .text("ℹ️ Ayuda", "ayuda")
}

async function mostrarAcceso(ctx) {
  const suscrito = await verificarSuscripcion(ctx)

  if (suscrito === null) {
    await ctx.reply(
      "⚠️ No he podido comprobar tu suscripción. Inténtalo más tarde."
    )
    return
  }

  if (!suscrito) {
    await ctx.reply(
      "👋 ¡Bienvenido a Vitrina de Subtítulos!\n\n" +
      "Para utilizar nuestro buscador gratuito, primero debes unirte a nuestro canal:",
      { reply_markup: tecladoSuscripcion() }
    )
    return
  }

  await ctx.reply(
    "🎬 ¡Bienvenido a Vitrina de Subtítulos!\n\n" +
    "Encuentra subtítulos de tus películas y series favoritas.\n\n" +
    "Selecciona una opción:",
    { reply_markup: tecladoPrincipal() }
  )
}

export function registerCommands(bot) {

  bot.command("start", async (ctx) => {
    await mostrarAcceso(ctx)
  })

  bot.command("help", async (ctx) => {
    const suscrito = await verificarSuscripcion(ctx)

    if (!suscrito) {
      await mostrarAcceso(ctx)
      return
    }

    await ctx.reply(
      "📖 AYUDA - VITRINA DE SUBTÍTULOS\n\n" +
      "🔎 Busca películas y series.\n" +
      "🌍 Selecciona el idioma del subtítulo.\n" +
      "📂 Elige entre las versiones disponibles.\n" +
      "📥 Recibe tu archivo de subtítulos.\n\n" +
      "Todos los subtítulos disponibles se ofrecerán gratuitamente."
    )
  })

  bot.callbackQuery("comprobar_suscripcion", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.deleteMessage().catch(() => {})
    await mostrarAcceso(ctx)
  })

  bot.callbackQuery("buscar", async (ctx) => {
    await ctx.answerCallbackQuery()

    const suscrito = await verificarSuscripcion(ctx)

    if (!suscrito) {
      await mostrarAcceso(ctx)
      return
    }

    await ctx.reply(
      "🔎 BUSCADOR DE SUBTÍTULOS\n\n" +
      "Escribe el nombre de la película o serie que buscas.\n\n" +
      "Ejemplo: Breaking Bad S02E05\n\n" +
      "🚧 Estamos preparando la conexión con las fuentes de subtítulos."
    )
  })

  bot.callbackQuery("ayuda", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply(
      "🎬 Vitrina de Subtítulos\n\n" +
      "Busca subtítulos de películas y series, elige el idioma y descarga el archivo disponible."
    )
  })

  bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return

    const suscrito = await verificarSuscripcion(ctx)

    if (!suscrito) {
      await mostrarAcceso(ctx)
      return
    }

    await ctx.reply(
      "🔎 He recibido tu búsqueda: " + ctx.message.text +
      "\n\nEl buscador de fuentes externas todavía está en preparación. Pronto podrás elegir el idioma y descargar tus subtítulos."
    )
  })
}
