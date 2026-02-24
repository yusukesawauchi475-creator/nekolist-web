import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#4A90E2",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#FF3B30",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
