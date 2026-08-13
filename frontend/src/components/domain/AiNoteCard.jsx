import React, { useState } from 'react';
import { Sparkles, Copy, RefreshCw, Check, Info } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

export function AiNoteCard({
  title = 'AI-Assisted Investigation Note Draft',
  note = '',
  onRegenerate,
  onCopy,
  editable = true,
  className = '',
}) {
  const [content, setContent] = useState(note);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    if (onCopy) onCopy(content);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className={cn(
        'border-l-4 border-l-[#0F766E] border-t border-r border-b border-[#E2E5EA] bg-[#F7F8FA]/60 shadow-sm',
        className
      )}
    >
      <div className="p-5">
        {/* Header with AI Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E5EA]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0F766E]/10 rounded-md text-[#0F766E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E]">
                <span>AI-Assisted</span>
                <span>•</span>
                <span>Review Required</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRegenerate && (
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRegenerate}>
                Regenerate Draft
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy Note'}
            </Button>
          </div>
        </div>

        {/* Editable Text Area */}
        <div className="mt-4">
          {editable ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              className="w-full bg-white border border-[#E2E5EA] rounded-md p-3 text-xs font-mono text-[#111827] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all resize-y"
              placeholder="AI Note content will appear here..."
            />
          ) : (
            <div className="bg-white border border-[#E2E5EA] rounded-md p-3 text-xs font-mono text-[#111827] leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>

        {/* Mandatory Compliance Disclaimer */}
        <div className="mt-3 flex items-start gap-2 text-[11px] text-[#6B7280] bg-slate-100/80 p-2.5 rounded-md border border-slate-200">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <p>
            <strong>Mandatory Operational Notice:</strong> AI-generated summaries provide automated analytical drafting assistance only. Compliance officers must independently verify underlying data prior to submitting official SARs or approving transactions.
          </p>
        </div>
      </div>
    </Card>
  );
}
