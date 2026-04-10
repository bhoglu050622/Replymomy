export function mutualMatchHtml(name: string, matchName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  body { background: #0A0A0A; color: #F5F0E8; font-family: 'Cormorant Garamond', Georgia, serif; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 0 auto; padding: 60px 40px; }
  .label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; }
  h1 { font-size: 48px; font-weight: 400; color: #F5F0E8; margin: 16px 0; line-height: 1.1; }
  h1 em { color: #C9A84C; font-style: italic; }
  p { font-size: 18px; line-height: 1.7; color: rgba(245,240,232,0.7); margin: 24px 0; }
  a.btn { display: inline-block; background: #C9A84C; color: #0A0A0A; text-decoration: none; padding: 14px 40px; border-radius: 100px; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 32px; }
  .footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(201,168,76,0.15); font-size: 12px; color: rgba(245,240,232,0.3); letter-spacing: 0.08em; }
</style>
</head>
<body>
<div class="container">
  <div class="label">It happened</div>
  <h1>It&rsquo;s<br><em>mutual.</em></h1>
  <p>You and ${matchName} both said yes, ${name}.</p>
  <p>Say something. She&rsquo;s waiting.</p>
  <a href="https://replymommy.com/chat" class="btn">Open Chat →</a>
  <div class="footer">
    ReplyMommy · <a href="https://replymommy.com" style="color: rgba(201,168,76,0.5);">replymommy.com</a>
  </div>
</div>
</body>
</html>`;
}
