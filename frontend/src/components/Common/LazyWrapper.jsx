import { Suspense } from 'react';
import Loader from './Loader';

/**
 * Wrapper para componentes lazy con loading
 */
const LazyWrapper = ({ children, fallback = <Loader /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyWrapper;