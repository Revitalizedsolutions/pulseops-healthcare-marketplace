import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'needs_documents' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs = {
    approved: {
      icon: CheckCircle,
      text: 'Approved',
      className: 'bg-sage-100 text-sage-800 border-sage-200',
    },
    pending: {
      icon: Clock,
      text: 'Pending Review',
      className: 'bg-accent-100 text-accent-800 border-accent-200',
    },
    needs_documents: {
      icon: AlertTriangle,
      text: 'Needs Documents',
      className: 'bg-healthcare-warning/10 text-healthcare-warning border-healthcare-warning/20',
    },
    rejected: {
      icon: XCircle,
      text: 'Rejected',
      className: 'bg-healthcare-error/10 text-healthcare-error border-healthcare-error/20',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}>
      <Icon className={`mr-1.5 ${iconSizes[size]}`} />
      {config.text}
    </span>
  );
}
