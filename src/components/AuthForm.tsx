import { useState } from "react";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function AuthForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("正しいメールアドレスを入力してください");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem("user_email", email);
      // 状態を即座に更新
      await new Promise(resolve => setTimeout(resolve, 0));
      onSuccess(email);
    } catch (error) {
      alert("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      if (userEmail) {
        localStorage.setItem("user_email", userEmail);
        // 状態を即座に更新
        await new Promise(resolve => setTimeout(resolve, 0));
        onSuccess(userEmail);
      }
    } catch (error: any) {
      alert(`Appleログインに失敗しました: ${error.message || "不明なエラー"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          maxWidth: "400px",
          width: "100%",
          padding: "24px"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>ログイン</h2>
          <button onClick={onClose} style={{ fontSize: "28px", color: "#999", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handleAppleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Appleでログイン
          </button>

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            margin: "8px 0",
            color: "#999",
            fontSize: "12px"
          }}>
            <div style={{ flex: 1, height: "1px", background: "#E0E0E0" }} />
            または
            <div style={{ flex: 1, height: "1px", background: "#E0E0E0" }} />
          </div>

          <form onSubmit={handleEmailLogin}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "8px" }}>
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #E0E0E0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                placeholder="you@example.com"
                required
              />
            </div>

            <p style={{ fontSize: "11px", color: "#666", marginBottom: "12px" }}>
              メールアドレスを入力するだけでログインできます（推奨）
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "#4A90E2",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              メールでログイン（推奨）
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
