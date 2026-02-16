export default function PendingPage() {

  return (
    <div className="min-h-screen bg-[#f6f1ea] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/mascot.png" 
            alt="Senda Mascot" 
            className="w-32 h-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-[#9a9c88]">Senda Chat</h1>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#d6865d]/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#d6865d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Cuenta Pendiente de Aprobación
          </h2>
          
          <p className="text-gray-600 mb-6">
            Tu solicitud de acceso ha sido recibida. Un supervisor revisará tu cuenta pronto.
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Una vez aprobada, podrás acceder al sistema. Intenta iniciar sesión más tarde.
          </p>

          <a
            href="/auth/logout"
            className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all text-center"
          >
            Cerrar Sesión
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-[#9a9c88]/60">
          ¿Tienes preguntas? Contacta a tu supervisor
        </p>
      </div>
    </div>
  )
}
