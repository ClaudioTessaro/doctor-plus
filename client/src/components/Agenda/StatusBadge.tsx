interface StatusBadgeProps {
  status: 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'REALIZADA';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'AGENDADA':
        return {
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          text: 'Agendada',
          icon: '📅'
        };
      case 'CONFIRMADA':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          text: 'Confirmada',
          icon: '✅'
        };
      case 'CANCELADA':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          text: 'Cancelada',
          icon: '❌'
        };
      case 'REALIZADA':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          text: 'Realizada',
          icon: '✔️'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          text: status,
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center space-x-1 ${sizeClasses} rounded-full border font-medium ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
}