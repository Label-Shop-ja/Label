import { useTranslation } from '../../hooks/useTranslation';

/**
 * Botón con soporte completo de internacionalización
 */
const TranslatedButton = ({ 
  translationKey, 
  namespace = 'common', 
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  ...props 
}) => {
  const { t } = useTranslation(namespace);

  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${disabled ? disabledClasses : ''} 
        ${className}
      `}
      {...props}
    >
      {t(translationKey)}
    </button>
  );
};

export default TranslatedButton;