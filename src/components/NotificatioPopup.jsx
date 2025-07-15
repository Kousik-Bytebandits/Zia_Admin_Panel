import { useEffect } from "react";

export default function NotificationPopup({ show, type, message, onClose, duration = 2500 }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0  z-50 flex justify-center items-center">
      <div className="bg-[#807D7DCC] rounded-xl p-6 w-[200px] h-[200px] text-center shadow-lg">
        <div className="flex justify-center mb-4">
          {type === "success" ? (
            <div className="w-[60px] h-[60px] rounded-full border-4 border-green-500 flex items-center justify-center">
              <svg
                className="w-[50px] h-[50px] text-[#59FF7E]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-[60px] h-[60px] rounded-full border-4 border-red-500 flex items-center justify-center">
              <svg
                className="w-[50px] h-[50px] text-[#FF5959]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <p className="text-white mb-4">{message}</p>
       
      </div>
    </div>
  );
}
