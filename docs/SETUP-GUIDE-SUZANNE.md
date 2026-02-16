# Guía de Configuración - Senda Chat
## Para Suzanne Rubinstein

---

## 📌 RESUMEN EJECUTIVO

Para que Senda Chat funcione al 100% necesitas:

1. **WhatsApp Business API** (~$15-50 USD/mes) - Para mensajes bidireccionales
2. **Twilio SMS** (~$0.05 USD/mensaje) - Para notificaciones a voluntarios
3. **Dominio sendachat.com** - Ya lo tienes (configurar DNS)
4. **Hosting** - Vercel funciona perfecto (gratis o $20/mes Pro)

---

## 📱 PARTE 1: WhatsApp Business API

### Opción A: Twilio (Recomendada - Lo que tenemos ahora)

**Estado actual:** Estamos usando el SANDBOX de Twilio (gratis pero limitado).

**Para producción necesitas:**

1. **Crear cuenta de WhatsApp Business** (gratuito)
   - Ve a: https://business.whatsapp.com
   - Registra tu número de teléfono
   - Verifica tu negocio con documentos

2. **Conectar Twilio con WhatsApp Business**
   - Entra a tu cuenta de Twilio: https://console.twilio.com
   - Ve a: Messaging → Try it Out → Send a WhatsApp Message
   - Sigue los pasos para "Request to Enable" tu número

3. **Costo estimado:**
   - Twilio: $0.005-0.05 USD por mensaje (depende del país)
   - WhatsApp: $0.05-0.15 USD por conversación de 24 horas
   - **Total mensual estimado (500 conversaciones):** ~$50-100 USD

### Opción B: Meta Business Suite Directo

**Más barato pero más complejo de implementar.**

---

## 💬 PARTE 2: SMS (Notificaciones a Voluntarios)

### Configuración de Twilio SMS

1. **Ya tienes cuenta de Twilio**, solo necesitas:
   - Comprar un número de teléfono mexicano (~$1 USD/mes)
   - Entra a: https://console.twilio.com → Phone Numbers → Buy a Number
   - Busca un número +52 (México)

2. **Agregar el número a Senda Chat:**
   - En Vercel, ve a tu proyecto → Settings → Environment Variables
   - Agrega: `TWILIO_PHONE_NUMBER` = `+52XXXXXXXXXX` (tu número)

3. **Costo de SMS en México:**
   - $0.0625 USD por SMS enviado
   - **Para 50 voluntarios × 10 SMS/mes:** ~$31 USD/mes

### Variables de entorno necesarias:
```
TWILIO_ACCOUNT_SID=AC47826da07075fc707fedf599b7ffd255  (ya lo tienes)
TWILIO_AUTH_TOKEN=xxxxx (ya lo tienes)
TWILIO_PHONE_NUMBER=+52XXXXXXXXXX (necesitas comprar)
TWILIO_WHATSAPP_NUMBER=whatsapp:+521XXXXXXXXXX (para producción)
```

---

## 🌐 PARTE 3: Dominio sendachat.com

### Si ya tienes el dominio:

1. **Averigua dónde lo compraste** (GoDaddy, Namecheap, Google Domains, etc.)

2. **Configura los DNS para Vercel:**
   - Entra a tu registrador de dominio
   - Ve a la sección de DNS
   - Agrega estos registros:

   | Tipo | Nombre | Valor |
   |------|--------|-------|
   | A | @ | 76.76.21.21 |
   | CNAME | www | cname.vercel-dns.com |

3. **Conecta en Vercel:**
   - Ve a: https://vercel.com/sambjslabs-4400s-projects/senda-chat
   - Settings → Domains
   - Agrega: `sendachat.com` y `www.sendachat.com`

4. **Espera 24-48 horas** para que los DNS se propaguen

### Si NO tienes el dominio:

- Cómpralo en Namecheap (~$12 USD/año): https://www.namecheap.com
- O en Google Domains (~$12 USD/año): https://domains.google.com

---

## 🖥️ PARTE 4: Hosting (Vercel)

### Estado actual: ✅ Ya funciona en Vercel gratuito

**URL actual:** https://senda-chat.vercel.app

### ¿Necesitas cambiar de hosting?

**NO.** Vercel es excelente para esto. Razones:

- ✅ Gratis hasta 100GB de transferencia
- ✅ SSL automático (HTTPS)
- ✅ Deploys automáticos
- ✅ Buen rendimiento global
- ✅ Fácil de mantener

### ¿Cuándo necesitarías Vercel Pro ($20/mes)?

- Si tienes más de 1,000 usuarios diarios
- Si necesitas cron jobs automáticos (mensajes de espera cada 90 seg)
- Si necesitas analytics avanzados

### Alternativas si prefieres otro hosting:

1. **Railway** (~$5-20/mes) - Similar a Vercel
2. **DigitalOcean App Platform** (~$12/mes)
3. **Servidor propio** (NO recomendado - requiere mantenimiento)

---

## 📋 LISTA DE TAREAS PARA TI

### Inmediato (esta semana):

- [ ] 1. Comprar número mexicano en Twilio para SMS (~$1 USD)
- [ ] 2. Ejecutar la migración de base de datos (te envío el SQL)
- [ ] 3. Agregar `TWILIO_PHONE_NUMBER` en Vercel

### Próximas 2 semanas:

- [ ] 4. Registrar negocio en WhatsApp Business
- [ ] 5. Solicitar activación de número en Twilio WhatsApp
- [ ] 6. Configurar DNS de sendachat.com

### Opcional (mejoras):

- [ ] 7. Upgrade a Vercel Pro si necesitas cron jobs
- [ ] 8. Configurar servicio externo de cron (cron-job.org - gratis)

---

## 💰 COSTO TOTAL ESTIMADO

| Concepto | Costo Mensual |
|----------|---------------|
| Vercel (gratis o Pro) | $0 - $20 USD |
| Twilio WhatsApp | ~$50-100 USD |
| Twilio SMS | ~$30 USD |
| Dominio (anual/12) | ~$1 USD |
| **TOTAL** | **$80-150 USD/mes** |

*Nota: Esto es para ~500 conversaciones y 50 voluntarios activos. El costo escala con el uso.*

---

## 🆘 MIGRACIÓN DE BASE DE DATOS

**Necesitas ejecutar este SQL en Supabase:**

1. Ve a: https://supabase.com/dashboard/project/efnkpazpexivnpvpgitf
2. Click en "SQL Editor" (icono de base de datos)
3. Copia y pega este código:

```sql
-- Migration: Conversation Flow
ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS conversation_state TEXT DEFAULT 'new' 
  CHECK (conversation_state IN ('new', 'awaiting_filter', 'awaiting_crisis_level', 'waiting_for_volunteer', 'assigned', 'closed', 'pending_delete'));

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS crisis_level INTEGER CHECK (crisis_level >= 1 AND crisis_level <= 5);

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS last_auto_message_at TIMESTAMPTZ;

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS auto_message_count INTEGER DEFAULT 0;

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS filter_passed BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_conversations_state ON whatsapp_conversations(conversation_state);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON whatsapp_conversations(assigned_to);

UPDATE whatsapp_conversations 
SET conversation_state = 'waiting_for_volunteer', filter_passed = TRUE
WHERE conversation_state = 'new' OR conversation_state IS NULL;
```

4. Click en "Run"

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Puedo usar el mismo número de WhatsApp personal?**
R: No recomendado. WhatsApp Business necesita un número dedicado.

**P: ¿Qué pasa si Vercel se cae?**
R: Vercel tiene 99.99% uptime. Es muy raro que falle.

**P: ¿Necesito un programador para mantener esto?**
R: Para el día a día, no. Los editores de contenido te permiten cambiar todo sin código. Para nuevas funciones, sí necesitarías ayuda técnica.

**P: ¿Los datos están seguros?**
R: Sí. Supabase y Vercel tienen seguridad de nivel empresarial. Las conversaciones se borran automáticamente al cerrar.

---

## 📞 SOPORTE

Si tienes dudas con algún paso, escríbeme por Telegram y te ayudo.

— Sam 🤖
