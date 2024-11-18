import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Switch } from './ui/switch';
import { cn } from '../lib/utils';
import useTerminalStore from '../store/terminalStore';
import '../styles/terminal.css';

export const TerminalConsole: React.FC = () => {
  const {
    isVisible,
    messages,
    verbosity,
    settings,
    position,
    size,
    toggleVisibility,
    clearMessages,
    updateVerbosity,
    updateSettings,
    updatePosition,
    updateSize,
    saveLogs
  } = useTerminalStore();

  const terminalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (settings.autoScroll && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages, settings.autoScroll]);

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.top-panel')) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    
    updatePosition({
      x: Math.max(0, Math.min(newX, window.innerWidth - size.width)),
      y: Math.max(0, Math.min(newY, window.innerHeight - size.height))
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width, height: size.height });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    const newWidth = Math.max(400, startSize.width + deltaX);
    const newHeight = Math.max(300, startSize.height + deltaY);
    
    updateSize({
      width: Math.min(newWidth, window.innerWidth - position.x),
      height: Math.min(newHeight, window.innerHeight - position.y)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', isDragging ? handleDragMove : handleResizeMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', isDragging ? handleDragMove : handleResizeMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'ERROR' && settings.vibrateOnErrors) {
      const terminal = terminalRef.current;
      if (terminal) {
        terminal.classList.add('shake');
        setTimeout(() => terminal.classList.remove('shake'), 500);
      }
    }
  }, [messages, settings.vibrateOnErrors]);

  if (!isVisible) return null;

  const filteredMessages = messages.filter(
    msg => verbosity[msg.type.toLowerCase() as keyof typeof verbosity]
  );

  return (
    <div
      ref={terminalRef}
      className={cn(
        'terminal',
        settings.vibrateOnErrors && 'can-shake'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      <div className="frame">
        <div className="top-panel" onMouseDown={handleDragStart}>
          <div className="status-lights">
            {Object.entries(verbosity).map(([type, isEnabled]) => (
              <div
                key={type}
                className={cn('light', type, isEnabled && 'active')}
                title={`${type.charAt(0).toUpperCase() + type.slice(1)} Messages`}
              />
            ))}
          </div>
          <div className="title">Terminal Console</div>
          <button className="hide-button" onClick={toggleVisibility}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="screen">
          <div className="screen-content" ref={contentRef}>
            {filteredMessages.map(message => (
              <div
                key={message.id}
                className={cn('message', message.type.toLowerCase())}
              >
                <span className="timestamp">
                  [{message.timestamp.toLocaleTimeString()}]
                </span>
                <span className="type">{message.type}</span>
                <span className="text">{message.text}</span>
              </div>
            ))}
          </div>

          <div className="footer">
            <div className="control-buttons">
              <button onClick={clearMessages}>Clear Console</button>
              <button onClick={saveLogs}>Save Logs</button>
            </div>

            <div className="verbosity-toggles">
              {Object.entries(verbosity).map(([type, isEnabled]) => (
                <label key={type} className="toggle">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={checked => updateVerbosity(type as keyof typeof verbosity, checked)}
                  />
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </label>
              ))}
            </div>

            <div className="settings-toggles">
              <label className="toggle">
                <Switch
                  checked={settings.keepTopmost}
                  onCheckedChange={checked => updateSettings('keepTopmost', checked)}
                />
                <span>Always on Top</span>
              </label>
              <label className="toggle">
                <Switch
                  checked={settings.autoScroll}
                  onCheckedChange={checked => updateSettings('autoScroll', checked)}
                />
                <span>Auto-scroll</span>
              </label>
              <label className="toggle">
                <Switch
                  checked={settings.vibrateOnErrors}
                  onCheckedChange={checked => updateSettings('vibrateOnErrors', checked)}
                />
                <span>Error Shake</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
};