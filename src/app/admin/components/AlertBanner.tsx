import {
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

type AlertType = "info" | "warning" | "success" | "error";

interface AlertBannerProps {
  type: AlertType;
  message: string | React.ReactNode;
  title?: string;
  onClose?: () => void;
  className?: string;
}

export default function AlertBanner({
  type,
  message,
  title,
  onClose,
  className = "",
}: AlertBannerProps) {
  // Determinar as cores e ícones com base no tipo de alerta
  const config = {
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-400",
      textColor: "text-blue-700",
      titleColor: "text-blue-800",
      icon: <FaInfoCircle className="h-5 w-5 text-blue-400" />,
    },
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-700",
      titleColor: "text-yellow-800",
      icon: <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />,
    },
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-400",
      textColor: "text-green-700",
      titleColor: "text-green-800",
      icon: <FaCheckCircle className="h-5 w-5 text-green-400" />,
    },
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-400",
      textColor: "text-red-700",
      titleColor: "text-red-800",
      icon: <FaExclamationCircle className="h-5 w-5 text-red-400" />,
    },
  };

  const { bgColor, borderColor, textColor, titleColor, icon } = config[type];

  return (
    <div
      className={`${bgColor} border-l-4 ${borderColor} p-4 mb-4 ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <div className={`text-sm ${textColor}`}>
            {typeof message === "string" ? (
              <>
                {type === "warning" && (
                  <strong className={`font-medium ${titleColor}`}>
                    Atenção:{" "}
                  </strong>
                )}
                {type === "error" && (
                  <strong className={`font-medium ${titleColor}`}>
                    Erro:{" "}
                  </strong>
                )}
                {type === "success" && (
                  <strong className={`font-medium ${titleColor}`}>
                    Sucesso:{" "}
                  </strong>
                )}
                {type === "info" && (
                  <strong className={`font-medium ${titleColor}`}>
                    Informação:{" "}
                  </strong>
                )}
                {message}
              </>
            ) : (
              message
            )}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`-mr-1 flex p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor.replace(
                "text",
                "focus:ring"
              )}`}
            >
              <span className="sr-only">Fechar</span>
              <svg
                className={`h-4 w-4 ${textColor}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
