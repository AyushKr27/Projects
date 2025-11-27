import React, { useMemo } from 'react';

export default function Message({ role = 'bot', text = '', meta = null }) {
  const time = useMemo(() => {
    const t = meta?.ts || Date.now();
    return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [meta]);

  const avatar = role === 'user' ? '🧑' : role === 'bot' ? '🤖' : '💬';
  const cls = role === 'user' ? 'msg user' : role === 'bot' ? 'msg bot' : 'msg system';

  const copyText = () => {
    navigator.clipboard.writeText(text);
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = '✅ Copied!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1200);
  };

  const react = (emoji) => {
    console.log(`Reaction: ${emoji} on message: ${text.slice(0, 30)}...`);
  };

  return (
    <div className={cls}>
      {role !== 'system' && <div className="avatar">{avatar}</div>}
      <div className="bubble">
        <div className="text">{text}</div>

        <div className="meta-right">{time}</div>

        {meta && (
          <div className="meta-block">
            <small>
              Intent: {meta.intent?.label ?? '-'} • Mood: {meta.emotion?.label ?? '-'} ({(meta.emotion?.score ?? 0).toFixed(2)})
            </small>
          </div>
        )}

        <div className="actions-row">
          <button className="action-btn" onClick={copyText}>📋 Copy</button>
          <button className="action-btn" onClick={() => react('👍')}>👍</button>
          <button className="action-btn" onClick={() => react('❤️')}>❤️</button>
        </div>
      </div>
    </div>
  );
}
