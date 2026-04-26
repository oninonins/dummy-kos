import { loginAction } from "@/app/actions/authActions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau login sebagai Admin KosSolution
          </p>
        </div>
        <form className="mt-8 space-y-6" action={loginAction}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-xl border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[#FF6B6B] focus:outline-none focus:ring-[#FF6B6B] sm:text-sm"
                placeholder="Alamat Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-xl border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[#FF6B6B] focus:outline-none focus:ring-[#FF6B6B] sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl border border-transparent bg-[#FF6B6B] py-3 px-4 text-sm font-bold text-white hover:bg-[#FF4757] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 transition-colors"
            >
              Masuk Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
