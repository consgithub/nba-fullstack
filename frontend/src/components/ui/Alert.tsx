import React, { useState, useEffect } from 'react';
import '../../styles/Alert.css';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  duration = 0, // 0 means it won't auto-dismiss
  onClose 
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  if (!visible) return null;
  
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <span className={`alert-icon icon-${type}`}>
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '⚠'}
          {type === 'info' && 'ℹ'}
        </span>
        <p className="alert-message">{message}</p>
      </div>
      <button className="alert-close" onClick={handleClose}>
        &times;
      </button>
    </div>
  );
};

export default Alert;