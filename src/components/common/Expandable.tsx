import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandButton } from './ExpandButton';
import clsx from 'clsx';

interface ExpandableProps {
  children: ReactNode;
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonClassName?: string;
  initialExpanded?: boolean;
}

export const Expandable: React.FC<ExpandableProps> = ({
  children,
  className = '',
  buttonSize = 'md',
  buttonClassName = '',
  initialExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <div className={clsx('relative', className)}>
      <div className="flex justify-center">
        <ExpandButton 
          expanded={expanded}
          onClick={() => setExpanded(prev => !prev)}
          size={buttonSize}
          className={buttonClassName}
        />
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};