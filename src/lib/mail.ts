import { readFile } from "fs/promises"
import path from "path"
import nodemailer from "nodemailer"

type SendMailAttachment = {
  filename: string
  content: Buffer
  cid?: string
}

type SendMailParams = {
  to: string
  subject: string
  text: string
  html: string
  attachments?: SendMailAttachment[]
}

type EmailAction = {
  href: string
  label: string
}

type BrandedEmailParams = {
  preheader: string
  eyebrow: string
  title: string
  intro: string
  body: string[]
  action?: EmailAction
  footerNote?: string
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null
let cachedLogoAttachment: SendMailAttachment | null | undefined

function getMailConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || "0")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM
  const secure =
    process.env.SMTP_SECURE === "true" || Boolean(port && port === 465)

  return {
    host,
    port,
    user,
    pass,
    from,
    secure,
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function isMailConfigured() {
  const config = getMailConfig()

  return Boolean(
    config.host &&
      config.port &&
      config.from &&
      config.user &&
      config.pass
  )
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter
  }

  const config = getMailConfig()

  if (!config.host || !config.port) {
    throw new Error("SMTP no configurado")
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? {
            user: config.user,
            pass: config.pass,
          }
        : undefined,
  })

  return cachedTransporter
}

async function getInlineLogoAttachment() {
  if (cachedLogoAttachment !== undefined) {
    return cachedLogoAttachment
  }

  try {
    const logoPath = path.join(
      process.cwd(),
      "public",
      "images",
      "iconolilcake.png"
    )
    const content = await readFile(logoPath)

    cachedLogoAttachment = {
      filename: "iconolilcake.png",
      content,
      cid: "lilcake-logo",
    }
  } catch {
    cachedLogoAttachment = null
  }

  return cachedLogoAttachment
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: SendMailParams) {
  const config = getMailConfig()

  if (!isMailConfigured()) {
    console.info("[mail-preview]", {
      to,
      subject,
      text,
    })

    return { delivered: false as const, mode: "preview" as const }
  }

  await getTransporter().sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
    attachments,
  })

  return { delivered: true as const, mode: "smtp" as const }
}

export async function sendBrandedMail(
  params: SendMailParams & {
    branded: BrandedEmailParams
  }
) {
  const logoAttachment = await getInlineLogoAttachment()
  const attachments = logoAttachment
    ? [...params.attachments ?? [], logoAttachment]
    : params.attachments

  return sendMail({
    ...params,
    attachments,
  })
}

export function buildBrandedEmailHtml({
  preheader,
  eyebrow,
  title,
  intro,
  body,
  action,
  footerNote,
}: BrandedEmailParams) {
  const safeTitle = escapeHtml(title)
  const safeIntro = escapeHtml(intro)
  const safeEyebrow = escapeHtml(eyebrow)
  const safePreheader = escapeHtml(preheader)
  const paragraphs = body
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #d5d7e1;">${escapeHtml(paragraph)}</p>`
    )
    .join("")

  const actionHtml = action
    ? `
      <div style="margin: 32px 0 24px;">
        <a
          href="${escapeHtml(action.href)}"
          style="
            display: inline-block;
            padding: 14px 28px;
            border-radius: 999px;
            background: linear-gradient(135deg, #6c3ce1 0%, #e91e8c 100%);
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            letter-spacing: 0.02em;
            box-shadow: 0 10px 30px rgba(108, 60, 225, 0.35);
          "
        >
          ${escapeHtml(action.label)}
        </a>
      </div>
      <p style="margin: 0 0 8px; font-size: 12px; color: #8f95b2;">
        Si el boton no funciona, copia y pega este enlace en tu navegador:
      </p>
      <p style="margin: 0; word-break: break-word; font-size: 12px; line-height: 1.6; color: #b7bfd8;">
        <a href="${escapeHtml(action.href)}" style="color: #9ddfff; text-decoration: underline;">
          ${escapeHtml(action.href)}
        </a>
      </p>
    `
    : ""

  const footerHtml = footerNote
    ? `<p style="margin: 24px 0 0; font-size: 12px; line-height: 1.7; color: #8f95b2;">${escapeHtml(footerNote)}</p>`
    : ""

  return `
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
      ${safePreheader}
    </div>
    <div style="margin: 0; padding: 32px 16px; background: #09090f;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        <tr>
          <td align="center">
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              style="
                max-width: 640px;
                border-collapse: collapse;
                border-radius: 28px;
                overflow: hidden;
                background:
                  radial-gradient(circle at top left, rgba(108, 60, 225, 0.28), transparent 35%),
                  radial-gradient(circle at top right, rgba(233, 30, 140, 0.22), transparent 28%),
                  linear-gradient(180deg, #191a2d 0%, #11121f 100%);
                border: 1px solid rgba(255, 255, 255, 0.06);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
              "
            >
              <tr>
                <td style="padding: 32px 32px 8px;">
                  <div style="display: inline-flex; align-items: center; gap: 14px;">
                    <div
                      style="
                        width: 56px;
                        height: 56px;
                        border-radius: 18px;
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        overflow: hidden;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                      "
                    >
                      <img
                        src="cid:lilcake-logo"
                        alt="LilCake"
                        width="56"
                        height="56"
                        style="display: block; width: 56px; height: 56px; object-fit: cover;"
                      />
                    </div>
                    <div>
                      <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #9ddfff;">
                        ${safeEyebrow}
                      </p>
                      <p style="margin: 0; font-size: 24px; font-weight: 800; color: #f5f5f7;">
                        LilCake
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 32px 0;">
                  <h1 style="margin: 0 0 14px; font-size: 30px; line-height: 1.15; color: #ffffff; font-weight: 800;">
                    ${safeTitle}
                  </h1>
                  <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #f3f4fb;">
                    ${safeIntro}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 32px 32px;">
                  <div
                    style="
                      border-radius: 22px;
                      background: rgba(255, 255, 255, 0.04);
                      border: 1px solid rgba(255, 255, 255, 0.06);
                      padding: 24px;
                    "
                  >
                    ${paragraphs}
                    ${actionHtml}
                    ${footerHtml}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}
