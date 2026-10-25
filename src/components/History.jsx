import React, { useState } from 'react';
import { History as HistoryIcon, Trash2, ArrowUpRight, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function History({ history, onSelectHistory, onClearHistory }) {
  const [copiedId, setCopiedId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = (e, item) => {
    e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(item.result.toString()).then(() => {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 1800);
      });
    }
  };

  const formatTimestamp = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`history-panel-container ${isCollapsed ? 'is-collapsed' : ''}`} role="region" aria-label="Calculation History">
      <div
        className="history-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }
        }}
        aria-expanded={!isCollapsed}
        aria-controls="history-list-section"
      >
        <div className="history-title-wrapper">
          <HistoryIcon size={18} className="history-icon" />
          <h2 className="history-title">History</h2>
          <span className="history-count-badge" aria-label={`${history.length} saved calculations`}>
            {history.length}/10
          </span>
        </div>

        <div className="history-header-actions" onClick={(e) => e.stopPropagation()}>
          {history.length > 0 && (
            <button
              type="button"
              className="history-clear-btn"
              onClick={onClearHistory}
              aria-label="Clear all calculation history"
              title="Clear history"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            className="history-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand history' : 'Collapse history'}
            title={isCollapsed ? 'Expand history' : 'Collapse history'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div id="history-list-section" className="history-list-wrapper">
        {history.length === 0 ? (
          <div className="history-empty-state">
            <div className="empty-icon-wrap" aria-hidden="true">
              <HistoryIcon size={26} />
            </div>
            <p className="empty-text">No calculations yet</p>
            <span className="empty-subtext">
              Speak or enter an expression to build your calculation history
            </span>
          </div>
        ) : (
          <ul className="history-list" role="list">
            {history.map((item) => (
              <li
                key={item.id}
                className="history-item"
                onClick={() => onSelectHistory(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectHistory(item);
                  }
                }}
                aria-label={`Expression: ${item.expression}, Result: ${item.result}. Click to reload.`}
              >
                <div className="history-item-details">
                  <div className="history-item-expr-row">
                    <span className="history-expr">{item.expression}</span>
                    <span className="history-time">{formatTimestamp(item.timestamp)}</span>
                  </div>
                  <div className="history-item-result-row">
                    <span className="history-equals">=</span>
                    <span className="history-result">{item.result}</span>
                  </div>
                </div>

                <div className="history-item-actions">
                  <button
                    type="button"
                    className="history-action-btn"
                    onClick={(e) => handleCopy(e, item)}
                    aria-label={`Copy result ${item.result}`}
                    title="Copy result"
                  >
                    {copiedId === item.id ? (
                      <Check size={14} className="copied-icon" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    type="button"
                    className="history-action-btn reload-btn"
                    onClick={() => onSelectHistory(item)}
                    aria-label="Reload into calculator"
                    title="Load into display"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}
    </div>
  );
}
