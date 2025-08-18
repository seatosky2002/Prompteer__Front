import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import { signIn } from "../../apis/api.js";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    // await 사용 위해서 async 함수로 바꿔주고.
    e.preventDefault();

    // 기본 유효성 검사
    if (!form.id.trim() || !form.password.trim()) {
      alert("ID와 비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    // 전반적으로 signUp과 매우 유사

    try {
      // API 명세서에 맞는 데이터 구조로 변환
      const loginData = {
        nickname: form.id, // 명세서에서는 nickname 필드 사용
        password: form.password,
      };

      const result = await signIn(loginData);

      if (result.success) {
        // signIn 함수에서 이미 토큰 저장하고 리다이렉트 처리함
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
            <div className="input-group">
              <label className="input-label" htmlFor="login-id">
                ID
              </label>
              <input
                id="login-id"
                className="input-field"
                type="text"
                placeholder="아이디를 입력하세요"
                value={form.id}
                onChange={(e) => handleChange("id", e.target.value)}
                autoComplete="username"
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
