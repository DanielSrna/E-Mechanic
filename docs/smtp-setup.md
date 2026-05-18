# Configuración de Email (SMTP)

## ¿Por qué SMTP?

Cuando cierras una orden, el sistema genera automáticamente un PDF con la factura y lo envía por email al cliente. Para que esto funcione, necesitas configurar un servidor SMTP.

## Opción 1: Gmail (recomendado para empezar)

1. Activa la verificación en 2 pasos en tu cuenta de Google
2. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Genera una "contraseña de aplicación" para "Correo"
4. Copia la contraseña de 16 caracteres

Configura en tu `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-taller@gmail.com
SMTP_PASS=la-contraseña-de-16-caracteres
```

> **Límite Gmail:** 500 emails/día en cuentas gratuitas.

## Opción 2: Mailtrap (desarrollo/testing)

[Mailtrap](https://mailtrap.io) es un servicio que simula un servidor SMTP. Los emails NO se envían realmente, sino que quedan en una bandeja de entrada para que los revises.

1. Crea cuenta gratis en mailtrap.io
2. Ve a Email Testing → Inboxes → My Inbox
3. Copia las credenciales SMTP

Configura en tu `.env`:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=tu-usuario-mailtrap
SMTP_PASS=tu-password-mailtrap
```

## Opción 3: SendGrid (producción, hasta 100 emails/día gratis)

1. Crea cuenta en [sendgrid.com](https://sendgrid.com)
2. Settings → API Keys → Create API Key
3. La API key es tu `SMTP_PASS`, el usuario siempre es `apikey`

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.tu-api-key-aqui
```

## Opción 4: Outlook/Hotmail

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=tu-taller@outlook.com
SMTP_PASS=tu-contraseña
```

## Sin SMTP configurado

Si no configuras SMTP, el sistema funciona normalmente pero:
- Las facturas se generan y se guardan en la BD
- **No se envían emails** a los clientes
- El estado de la factura queda como `generated` en vez de `sent`
