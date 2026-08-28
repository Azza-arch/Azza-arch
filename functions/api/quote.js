function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function line(label, value) {
  return '<b>' + escapeHtml(label) + ':</b> ' + escapeHtml(value || '-');
}

async function handlePost(context) {
  const env = context.env || {};

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ ok: false, error: 'Telegram is not configured yet.' }, 500);
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch (error) {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const honeypot = clean(payload.website, 120);
  if (honeypot) {
    return json({ ok: true });
  }

  const name = clean(payload.name, 100);
  const business = clean(payload.business, 120);
  const type = clean(payload.type, 80);
  const budget = clean(payload.budget, 80);
  const details = clean(payload.details, 1600);
  const page = clean(payload.page, 220);

  const missing = [];
  if (!name) missing.push('name');
  if (!type) missing.push('project type');
  if (!budget) missing.push('budget');
  if (!details) missing.push('details');

  if (missing.length) {
    return json({ ok: false, error: 'Missing ' + missing.join(', ') + '.' }, 400);
  }

  const message = [
    '<b>New HaziqBuilds enquiry</b>',
    '',
    line('Name', name),
    line('Business / organisation', business),
    line('Project type', type),
    line('Budget', budget),
    '',
    '<b>Project details:</b>',
    escapeHtml(details),
    '',
    line('Page', page || context.request.url)
  ].join('\n');

  const telegramResponse = await fetch(
    'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }
  );

  if (!telegramResponse.ok) {
    return json({ ok: false, error: 'Telegram delivery failed.' }, 502);
  }

  return json({ ok: true });
}

export function onRequest(context) {
  if (context.request.method === 'POST') {
    return handlePost(context);
  }

  return new Response(JSON.stringify({ ok: false, error: 'Method not allowed.' }), {
    status: 405,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'allow': 'POST'
    }
  });
}
