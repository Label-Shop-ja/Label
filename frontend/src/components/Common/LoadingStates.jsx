import { motion } from 'framer-motion';

// Diferentes tipos de spinners modernos
export const SpinnerDots = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colors = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-green-400',
    red: 'bg-red-400'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizes[size]} ${colors[color]} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

export const SpinnerRing = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colors = {
    blue: 'border-blue-400',
    purple: 'border-purple-400',
    green: 'border-green-400',
    red: 'border-red-400'
  };

  return (
    <div className="relative">
      <div className={`${sizes[size]} border-4 border-gray-200/20 rounded-full`}></div>
      <div className={`absolute top-0 left-0 ${sizes[size]} border-4 border-transparent ${colors[color]} border-t-current border-r-current rounded-full animate-spin`}></div>
    </div>
  );
};

export const SpinnerPulse = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colors = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-green-400',
    red: 'bg-red-400'
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]} rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};