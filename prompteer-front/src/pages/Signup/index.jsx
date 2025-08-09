import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import "./Signup.css";

const allInterests = [
  "백엔드 개발자",
  "프론트엔드 개발자",
  "UX/UI디자이너",
  "프롬프트 엔지니어",
  "기획/PM",
  "PS",
  "기타",
];

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    id: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    interests: [],
    bio: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (tag) => {
    setForm((prev) => {
      const selected = prev.interests.includes(tag);
      const next = selected
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag];
      return { ...prev, interests: next };
    });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("올바른 이메일을 입력해주세요.");
      return false;
    }
    if (form.id.trim().length < 3) {
      alert("ID는 3자 이상이어야 합니다.");
      return false;
    }
    if (form.password.length < 6) {
      alert("비밀번호는 6자 이상이어야 합니다.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return false;
    }
    if (!form.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // TODO: API 연동
    setTimeout(() => {
      setIsSubmitting(false);
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    }, 800);
  };

  return (
    <div className="signup-page">
      <Header />
      <main className="signup-main">
        <section className="signup-card" aria-label="회원가입 카드">
          <h1 className="signup-title">회원가입</h1>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="signup-email">
                이메일
              </label>
              <input
                id="signup-email"
                className="input-field"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="signup-id">
                ID
              </label>
              <input
                id="signup-id"
                className="input-field"
                type="text"
                placeholder="아이디를 입력하세요"
                value={form.id}
                onChange={(e) => handleChange("id", e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="signup-password">
                  PW
                </label>
                <input
                  id="signup-password"
                  className="input-field"
                  type="password"
                  placeholder="비밀번호"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="signup-confirm">
                  PW 확인
                </label>
                <input
                  id="signup-confirm"
                  className="input-field"
                  type="password"
                  placeholder="비밀번호 확인"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="signup-nickname">
                닉네임
              </label>
              <input
                id="signup-nickname"
                className="input-field"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={form.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">관심 분야</label>
              <div className="tag-group">
                {allInterests.map((tag) => {
                  const selected = form.interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag ${selected ? "selected" : ""}`}
                      onClick={() => toggleInterest(tag)}
                      aria-pressed={selected}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="signup-bio">
                한 줄 소개
              </label>
              <textarea
                id="signup-bio"
                className="textarea"
                placeholder="자기 소개를 입력하세요"
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
              />
            </div>

            <div className="signup-actions">
              <button
                type="submit"
                className="signup-button"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "가입 중..." : "회원가입"}
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
