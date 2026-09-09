const COOKIE = "rhs_session";

function json(data, status=200, extra={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=UTF-8", "cache-control":"no-store", ...extra}
  });
}

function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

async function makeSession(email, secret) {
  const payload = btoa(JSON.stringify({email, iat:Date.now()})).replaceAll("=","");
  return `${payload}.${await sign(payload, secret)}`;
}

async function validSession(request, secret) {
  if (!secret) return false;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [payload, sig] = match[1].split(".");
  if (!payload || !sig) return false;
  const expected = await sign(payload, secret);
  if (sig.length !== expected.length) return false;
  let ok = true;
  for (let i=0;i<expected.length;i++) if (sig.charCodeAt(i)!==expected.charCodeAt(i)) ok=false;
  if (!ok) return false;
  try {
    const data = JSON.parse(atob(payload));
    return data.iat && Date.now()-data.iat < 24*60*60*1000;
  } catch { return false; }
}

function safeRedirect() { return new Response(null,{status:302,headers:{location:"/admin/"}}); }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    if (url.pathname === "/api/admin/login" && method === "POST") {
      try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        const admins = [
          [String(env.ADMIN1_EMAIL||"").toLowerCase(), String(env.ADMIN1_PASSWORD||"")],
          [String(env.ADMIN2_EMAIL||"").toLowerCase(), String(env.ADMIN2_PASSWORD||"")]
        ];
        const match = admins.some(([e,p]) => e && p && e===email && p===password);
        if (!match) return json({ok:false,error:"Login ou senha inválidos."},401);
        if (!env.ADMIN_SESSION_SECRET) return json({ok:false,error:"ADMIN_SESSION_SECRET não configurado."},500);
        const session = await makeSession(email, env.ADMIN_SESSION_SECRET);
        return json({ok:true,email},200,{"set-cookie":`${COOKIE}=${session}; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict`});
      } catch { return json({ok:false,error:"Requisição inválida."},400); }
    }

    if (url.pathname === "/api/admin/logout" && method === "POST") {
      return json({ok:true},200,{"set-cookie":`${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`});
    }

    if (url.pathname === "/api/admin/session" && method === "GET") {
      return json({ok:await validSession(request, env.ADMIN_SESSION_SECRET)});
    }

    if (url.pathname === "/api/community/resolve" && method === "GET") {
      const raw = url.searchParams.get("url") || "";
      let target;
      try { target = new URL(raw); } catch { return json({ok:false,error:"Link inválido."},400); }
      const allowed = ["whatsapp.com","chat.whatsapp.com","whatsapp.net"];
      if (target.protocol !== "https:" || !allowed.some(d => target.hostname === d || target.hostname.endsWith("."+d))) {
        return json({ok:false,error:"Por segurança, a busca automática aceita apenas links HTTPS públicos do WhatsApp."},400);
      }
      try {
        const r = await fetch(target.toString(), {headers:{"user-agent":"Mozilla/5.0 ALIANCE-RHS/2.0"}, redirect:"manual"});
        const html = await r.text();
        const pick = (re) => { const m=html.match(re); return m ? m[1].replaceAll("&quot;",'\"').replaceAll("&#39;", "'").replaceAll("&amp;", "&") : ""; };
        const name = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i) || pick(/<title[^>]*>([^<]*)<\/title>/i) || "Comunidade WhatsApp";
        const image = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/i);
        return json({ok:true,name,image});
      } catch { return json({ok:false,error:"Não foi possível obter a prévia pública desse link."},502); }
    }

    if (url.pathname.startsWith("/api/admin/")) {
      if (!(await validSession(request, env.ADMIN_SESSION_SECRET))) return json({ok:false,error:"Não autorizado."},401);
      if (url.pathname === "/api/admin/history" && method === "GET") {
        // O histórico persistente exige D1/KV. A versão base registra no navegador do painel.
        return json({ok:true, retentionHours:24, message:"Ative D1/KV para histórico persistente entre dispositivos."});
      }
      return json({ok:true});
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("ALIANCE R.H.S",{headers:{"content-type":"text/plain; charset=UTF-8"}});
  }
};
