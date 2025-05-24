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
  const onSubmit: SubmitHandler<AuthFormFields> = async (data) => {
    setError("");
    setSuccess("");
    try {
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-purple-800 py-8 px-2 animate-fade-in">
      <div className="bg-white/90 rounded-xl shadow-2xl flex flex-col md:flex-row w-full max-w-3xl overflow-hidden">
        {/* Seção de boas-vindas */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-800 to-purple-700 text-white p-10 w-1/2">
          <FaUserGraduate className="text-6xl mb-4" />
          <h2 className="text-3xl font-bold mb-2">Bem-vindo ao Self Coding!</h2>
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
    </div>
  );
}
