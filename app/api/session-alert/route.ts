import { NextRequest, NextResponse } from "next/server";
import { Client, Messaging, Users, ID } from "node-appwrite";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.enclaveprojects.dev/v1";
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "incloud-enclaveprojects";
const PROVIDER_ID = "resend-smtp";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getServerClient() {
  const key = process.env.APPWRITE_API_KEY;
  if (!key) return null;
  return new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT)
    .setKey(key);
}

function buildEmailHtml(
  name: string,
  type: "login" | "register",
  device: string,
  time: string
) {
  const heading =
    type === "register"
      ? "Welcome to InCloud!"
      : "New sign-in to your account";
  const intro =
    type === "register"
      ? `Hi ${escapeHtml(name)}, your InCloud account has been created successfully.`
      : `Hi ${escapeHtml(name)}, we detected a new sign-in to your InCloud account.`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0b0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#111827;border-radius:16px;border:1px solid #1e293b;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:32px 28px;">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">☁️ InCloud</h1>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#f1f5f9;">${heading}</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;line-height:1.6;">${intro}</p>
      <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;">Activity</td>
            <td style="padding:6px 0;font-size:13px;color:#e2e8f0;text-align:right;">${type === "register" ? "Account created" : "Sign-in"}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;">Time</td>
            <td style="padding:6px 0;font-size:13px;color:#e2e8f0;text-align:right;">${time}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;">Device</td>
            <td style="padding:6px 0;font-size:13px;color:#e2e8f0;text-align:right;">${escapeHtml(device)}</td>
          </tr>
        </table>
      </div>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
        If this wasn't you, please change your password immediately and contact support.
      </p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #1e293b;">
      <p style="margin:0;font-size:11px;color:#475569;text-align:center;">
        InCloud — Private Cloud Storage &bull; This is an automated security alert
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const client = getServerClient();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Email alerts not configured" },
        { status: 200 } // don't break client flow
      );
    }

    const body = await req.json();
    const { userId, name, email, type } = body as {
      userId: string;
      name: string;
      email: string;
      type: "login" | "register";
    };

    if (!userId || !email || !type) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // Verify the user actually exists in Appwrite
    const users = new Users(client);
    try {
      await users.get(userId);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid user" }, { status: 403 });
    }

    const device = req.headers.get("user-agent")?.slice(0, 120) || "Unknown device";
    const time = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const subject =
      type === "register"
        ? "Welcome to InCloud — Account Created"
        : "InCloud — New Sign-in Alert";

    const html = buildEmailHtml(name || email.split("@")[0], type, device, time);

    const messaging = new Messaging(client);
    await messaging.createEmail(
      ID.unique(),
      subject,
      html,
      [],           // topics
      [userId],     // users
      [],           // targets
      [],           // cc
      [],           // bcc
      undefined,    // attachments
      false,        // draft
      true,         // html
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[session-alert]", err);
    // Return 200 so the auth flow isn't blocked
    return NextResponse.json({ ok: false, error: "Email send failed" }, { status: 200 });
  }
}
