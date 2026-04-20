import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[AuthCallback] href:", window.location.href);
    console.log("[AuthCallback] hash:", window.location.hash);
    console.log("[AuthCallback] search:", window.location.search);

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        console.log("[AuthCallback] exchangeCodeForSession", data, error);
        navigate(data.session ? "/" : "/login", { replace: true });
      });
      return;
    }

    // implicit flow fallback (hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthCallback] onAuthStateChange", event, session);
      if (event === "SIGNED_IN" && session) {
        navigate("/", { replace: true });
      }
    });

    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      navigate(session ? "/" : "/login", { replace: true });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e", color: "#fff" }}>
      로그인 처리 중...
    </div>
  );
}
