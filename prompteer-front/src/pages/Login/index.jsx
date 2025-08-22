import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import { signIn } from "../../apis/api.js";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  // state 'id'를 'email'로 변경
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사 메시지 및 필드 변경
    if (!form.email.trim() || !form.password.trim()) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // API 명세서에 맞게 데이터 구조 변경 (nickname -> email)
      const loginData = {
        email: form.email,
        password: form.password,
      };

      const result = await signIn(loginData);

      if (result.success) {
        alert("로그인 성공!");
      } else {
        alert(result.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <main className="login-main">
        <section className="login-card" aria-label="로그인 카드">
          <h1 className="login-title">로그인</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* ID 입력 필드를 Email 입력 필드로 변경 */}
            <div className="input-group">
              <label className="input-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="input-field"
                type="email"
                placeholder="이메일을 입력하세요"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="login-password">
                PW
              </label>
              <input
                id="login-password"
                className="input-field"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="login-meta">
              <button
                type="button"
                className="signup-link"
                aria-label="회원가입"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </button>
            </div>

            <div className="login-actions">
              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "로그인 중..." : "로그인"}
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;