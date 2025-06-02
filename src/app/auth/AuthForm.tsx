"use client";
// Formulário de autenticação usando react-hook-form e Firebase
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FaUserGraduate } from "react-icons/fa";

type AuthFormFields = {
  email: string;
  password?: string;
  confirmPassword?: string;
};

export default function AuthForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormFields>();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkRegistrationAllowed = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/settings");
      if (response.ok) {
        const settings = await response.json();
        return settings.allowRegistration;
      }
      return true; // Default: permitir se não conseguir verificar
    } catch (error) {
      console.error("Erro ao verificar configurações:", error);
      return true; // Default: permitir se houver erro
    }
  };

  // Adicionar a verificação de modo de manutenção
  const checkMaintenanceMode = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/settings");
      if (response.ok) {
        const settings = await response.json();
        return !!settings.maintenanceMode;
      }
      return false; // Default: permitir acesso se não conseguir verificar
    } catch (error) {
      console.error("Erro ao verificar modo de manutenção:", error);
      return false; // Default: permitir acesso se houver erro
    }
  };

  const onSubmit: SubmitHandler<AuthFormFields> = async (data) => {
    setError("");
    setSuccess("");

    try {
      // Verificar se o sistema está em modo de manutenção
      if (mode === "login") {
        const maintenanceMode = await checkMaintenanceMode();
        if (maintenanceMode) {
          router.push("/site-em-manutencao");
          return;
        }
      }

      if (mode === "login") {
        await signInWithEmailAndPassword(auth, data.email, data.password!);
        setSuccess("Login realizado com sucesso!");

        // Verifica se o usuário é admin
        try {
          const { db } = await import("@/lib/firebase");
          const { doc, getDoc } = await import("firebase/firestore");
          const adminId = data.email.replace(/\./g, "_").replace("@", "_");
          const adminRef = doc(db, "admins", adminId);
          const adminSnap = await getDoc(adminRef);

          if (adminSnap.exists()) {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Erro ao verificar perfil admin:", err);
          router.push("/dashboard");
        }
      } else if (mode === "register") {
        // Verificar se o registro está permitido
        const registrationAllowed = await checkRegistrationAllowed();
        if (!registrationAllowed) {
          setError(
            "O registro de novos usuários está temporariamente desabilitado."
          );
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password!
        );
        // Cria documento do usuário no Firestore
        try {
          const { db } = await import("@/lib/firebase");
          const { doc, setDoc, serverTimestamp } = await import(
            "firebase/firestore"
          );
          await setDoc(doc(db, "users", userCredential.user.uid), {
            displayName: userCredential.user.displayName || "Usuário",
            email: userCredential.user.email,
            photoURL: userCredential.user.photoURL || null,
            createdAt: serverTimestamp(),
            status: "active",
            matriculas: 0,
          });
        } catch (err) {
          console.error(
            "Erro ao criar documento do usuário no Firestore:",
            err
          );
        }
        setSuccess("Conta criada com sucesso!");
        router.push("/dashboard");
      } else if (mode === "reset") {
        await sendPasswordResetEmail(auth, data.email);
        setSuccess("Email de recuperação enviado!");
      }
      reset();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Erro desconhecido");
    }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-purple-800 py-8 px-2 animate-fade-in pt-32">
      <div className="bg-white/90 rounded-xl shadow-2xl flex flex-col md:flex-row w-full max-w-3xl overflow-hidden">
        {/* Seção de boas-vindas */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-800 to-purple-700 text-white p-10 w-1/2">
          <FaUserGraduate className="text-6xl mb-4" />
          <h2
            className="text-3xl font-bold mb-2 relative neon-text animate-pulse"
            style={{
              textShadow:
                "0 0 8px #7f9cf5, 0 0 16px #7f9cf5, 0 0 32px #a78bfa, 0 0 64px #c084fc",
            }}
          >
            Bem-vindo ao Self Coding!
          </h2>
          <p className="text-base mb-4 text-center">
            A plataforma para você aprender programação do zero ao avançado, com
            aulas, projetos e comunidade.
          </p>
          <ul className="text-sm space-y-1 text-blue-100">
            <li>✔️ Cursos de várias linguagens</li>
            <li>✔️ Progresso salvo na nuvem</li>
            <li>✔️ Tutoriais e blog exclusivos</li>
            <li>✔️ Comunidade para dúvidas</li>
          </ul>
        </div>
        {/* Seção do formulário */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="flex flex-col items-center mb-6 md:hidden">
            <FaUserGraduate className="text-5xl text-blue-700 mb-2" />
            <h1 className="text-2xl font-bold text-blue-900 mb-1">
              Self Coding
            </h1>
            <span className="text-sm text-blue-700 font-medium">
              Aprenda programação do zero ao avançado
            </span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Login</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-full max-w-xs"
          >
            <label
              htmlFor="email"
              className="text-sm font-semibold text-blue-900"
            >
              Email
            </label>
            <input
              {...register("email", {
                required: "Email obrigatório",
                pattern: { value: /.+@.+\..+/, message: "Email inválido" },
              })}
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              className={`input input-bordered border-blue-400 focus:border-blue-700 rounded-md px-3 py-2 text-base bg-white/80 text-blue-900 placeholder:text-blue-400 ${
                errors.email ? "border-red-500" : ""
              }`}
              autoComplete="email"
            />
            {errors.email && (
              <span className="text-red-500 text-xs animate-pulse">
                {errors.email.message as string}
              </span>
            )}
            {mode !== "reset" && (
              <>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-blue-900"
                >
                  Senha
                </label>
                <input
                  {...register("password", {
                    required:
                      mode === "login" || mode === "register"
                        ? "Senha obrigatória"
                        : false,
                    minLength:
                      mode === "login" || mode === "register"
                        ? { value: 6, message: "Mínimo 6 caracteres" }
                        : undefined,
                  })}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Senha"
                  className={`input input-bordered border-blue-400 focus:border-blue-700 rounded-md px-3 py-2 text-base bg-white/80 text-blue-900 placeholder:text-blue-400 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                {errors.password && (
                  <span className="text-red-500 text-xs animate-pulse">
                    {errors.password?.message as string}
                  </span>
                )}
                {mode === "register" && (
                  <>
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-blue-900"
                    >
                      Confirmar Senha
                    </label>
                    <input
                      {...register("confirmPassword", {
                        required: "Confirme sua senha",
                        validate: (value, formValues) =>
                          value === formValues.password ||
                          "As senhas não coincidem",
                      })}
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Confirme a senha"
                      autoComplete="new-password"
                      className={`input input-bordered border-blue-400 focus:border-blue-700 rounded-md px-3 py-2 text-base bg-white/80 text-blue-900 placeholder:text-blue-400 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-xs animate-pulse">
                        {errors.confirmPassword.message as string}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
            <button
              type="submit"
              className="btn bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-md py-2 mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : null}
              {mode === "login"
                ? "Entrar"
                : mode === "register"
                ? "Registrar"
                : "Recuperar Senha"}
            </button>
            {/* Mensagens animadas de erro/sucesso */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs text-center animate-fade-in-down">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs text-center animate-fade-in-down">
                {success}
              </div>
            )}
          </form>
          <div className="flex gap-4 mt-4 text-xs justify-center w-full">
            {mode !== "login" && (
              <button
                className="underline text-blue-700 font-semibold"
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
            )}
            {mode !== "register" && (
              <button
                className="underline text-blue-700 font-semibold"
                onClick={() => setMode("register")}
              >
                Registrar
              </button>
            )}
            {mode !== "reset" && (
              <button
                className="underline text-blue-700 font-semibold"
                onClick={() => setMode("reset")}
              >
                Esqueci a senha
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Footer personalizado TOP */}
      <footer className="fixed top-0 left-0 w-full z-50 flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 via-blue-700 to-purple-800 py-3 px-4 text-xs md:text-sm text-blue-100 shadow-2xl border-b-4 border-blue-400/40 backdrop-blur-md animate-footer-zoomloop">
        <div className="flex items-center gap-3 font-semibold tracking-wide uppercase drop-shadow-sm text-base md:text-lg">
          <span className="font-bold tracking-wide text-white drop-shadow-sm">
            dennisemannuel_DEV
          </span>
          <span className="hidden md:inline text-blue-200">|</span>
          <a
            href="https://self-dev.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline hover:text-green-300 transition-colors duration-150"
          >
            <svg
              width="18"
              height="18"
              fill="currentColor"
              className="inline-block text-green-300"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm7.938 8h-3.02c-.19-2.33-.93-4.19-1.89-5.36A8.03 8.03 0 0 1 19.938 10zM12 4.062c1.13 0 3.62 2.53 3.98 5.938h-7.96C8.38 6.592 10.87 4.062 12 4.062zM4.062 12c0-1.13 2.53-3.62 5.938-3.98v7.96C6.592 15.62 4.062 13.13 4.062 12zm1.728 5.36C5.07 16.19 4.33 14.33 4.062 12h3.02c.19 2.33.93 4.19 1.89 5.36A8.03 8.03 0 0 1 5.79 17.36zM12 19.938c-1.13 0-3.62-2.53-3.98-5.938h7.96c-.36 3.408-2.85 5.938-3.98 5.938zm2.23-2.578c.96-1.17 1.7-3.03 1.89-5.36h3.02c-.27 2.33-1.01 4.19-1.89 5.36a8.03 8.03 0 0 1-3.02 2.578zM16.98 12c-.18-2.13-.8-4.01-1.67-5.36A7.98 7.98 0 0 0 12 4.062V12h4.98zm-5.36 0V4.062A7.98 7.98 0 0 0 8.69 6.64C7.82 7.99 7.2 9.87 7.02 12H11.62zm0 1.62H7.02c.18 2.13.8 4.01 1.67 5.36A7.98 7.98 0 0 0 11.62 19.938V13.62zm1.76 0v6.318A7.98 7.98 0 0 0 15.31 17.36c.87-1.35 1.49-3.23 1.67-5.36h-3.43z" />
            </svg>
            <span className="hidden sm:inline">Site</span>
          </a>
          <span className="text-blue-200">|</span>
          <a
            href="https://www.instagram.com/dennisemannuel_dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline hover:text-pink-400 transition-colors duration-150"
          >
            <svg
              width="18"
              height="18"
              fill="currentColor"
              className="inline-block text-pink-400"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.808 2.256 6.088 2.243 6.497 2.243 12c0 5.503.013 5.912.072 7.192.059 1.276.353 2.449 1.32 3.416.967.967 2.14 1.261 3.416 1.32 1.28.059 1.689.072 7.192.072s5.912-.013 7.192-.072c1.276-.059 2.449-.353 3.416-1.32.967-.967 1.261-2.14 1.32-3.416.059-1.28.072-1.689.072-7.192s-.013-5.912-.072-7.192c-.059-1.276-.353-2.449-1.32-3.416C21.449.425 20.276.131 19 .072 17.72.013 17.311 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            <span className="hidden sm:inline">Instagram</span>
          </a>
          <span className="text-blue-200">|</span>
          <a
            href="https://www.linkedin.com/in/dennis-emannuel-60b670283"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline hover:text-blue-300 transition-colors duration-150"
          >
            <svg
              width="18"
              height="18"
              fill="currentColor"
              className="inline-block text-blue-300"
              viewBox="0 0 24 24"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.845-1.563 3.043 0 3.604 2.004 3.604 4.609v5.587z" />
            </svg>
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
