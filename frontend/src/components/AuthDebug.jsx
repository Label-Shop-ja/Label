import { useSelector } from 'react-redux';

const AuthDebug = () => {
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth);
  
  // Solo mostrar en desarrollo
  if (import.meta.env.VITE_APP_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div>
          <span className="font-semibold">Authenticated:</span> 
          <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {isAuthenticated ? ' ✅' : ' ❌'}
          </span>
        </div>
        <div>
          <span className="font-semibold">User:</span> {user?.fullName || 'None'}
        </div>
        <div>
          <span className="font-semibold">Token:</span> 
          <span className={accessToken ? 'text-green-400' : 'text-red-400'}>
            {accessToken ? ' Present ✅' : ' None ❌'}
          </span>
        </div>
        <div className="pt-2 border-t border-gray-600">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Clear & Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;