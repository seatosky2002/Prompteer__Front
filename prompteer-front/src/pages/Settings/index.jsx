import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import {
  unregisterUser,
  getCurrentUserDetails,
  checkPassword,
  updateUserAccount,
  updateUserProfile,
} from "../../apis/api.js";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("프로필 수정");
  const [formData, setFormData] = useState({
    // 계정 설정
    nickname: "",
    email: "",
    bio: "",
    interests: [],
    password: "",
    newPassword: "",
    confirmPassword: "",
    deletePassword: "",

    // 개인정보 설정
    privacy: {
      profilePublic: true,
      activityVisible: true,
      searchable: false,
    },

    // 앱 설정
    preferences: {
      theme: "light",
      language: "ko",
      autoSave: true,
      showTutorials: true,
    },
  });

  const allInterests = [
    "백엔드 개발자",
    "프론트엔드 개발자",
    "UX/UI디자이너",
    "프롬프트 엔지니어",
    "기획/PM",
    "PS",
    "기타",
  ];

  // 백엔드 API 형식 → 프론트엔드 형식으로 변환
  // 중복 선택 가능하게끔 하는 느낌. 사용자의 DB에서 받아오는 관심 영역 data들을 프론트에서 띄워주는 함수
  const mapInterestsFromAPI = (apiInterests) => {
    const interestMap = {
      backend_developer: "백엔드 개발자",
      frontend_developer: "프론트엔드 개발자",
      ui_ux_designer: "UX/UI디자이너",
      prompt_engineer: "프롬프트 엔지니어",
      planner_pm: "기획/PM",
      ps: "PS",
      etc: "기타",
    };

    return Object.entries(apiInterests)
      .filter(([key, value]) => value === true)
      .map(([key]) => interestMap[key])
      .filter(Boolean);
  };

  // 현재 어떤 관심 분야들이 선택되었는지 반환해주는 함수
  const mapInterestsToAPI = (selectedInterests) => {
    return {
      backend_developer: selectedInterests.includes("백엔드 개발자"),
      frontend_developer: selectedInterests.includes("프론트엔드 개발자"),
      ui_ux_designer: selectedInterests.includes("UX/UI디자이너"),
      prompt_engineer: selectedInterests.includes("프롬프트 엔지니어"),
      planner_pm: selectedInterests.includes("기획/PM"),
      ps: selectedInterests.includes("PS"),
      etc: selectedInterests.includes("기타"),
    };
  };

  const tabs = [
    { id: "프로필 수정", label: "프로필 수정", icon: "👤" },
    { id: "비밀번호 변경", label: "비밀번호 변경", icon: "🔒" },
    { id: "회원 탈퇴", label: "회원 탈퇴", icon: "⚠️" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleInterest = (tag) => {
    setFormData((prev) => {
      const isSelected = prev.interests.includes(tag);
      const nextInterests = isSelected
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag];
      return { ...prev, interests: nextInterests };
    });
  };

  // 회원 탈퇴 모달 상태 및 핸들러
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // 설정 저장 버튼 표시 여부
  const [isSettingButtonLive, setIsSettingButtonLive] = useState(true);
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setFormData((prev) => ({
      ...prev,
      deletePassword: "",
    })); // 모달 열릴 때 비밀번호 입력 필드 초기화
  };
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);
  const handleConfirmDelete = async () => {
    // 비동기함수 사용 위해 async로 바꾸기
    if (!formData.deletePassword?.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      // 1단계: 비밀번호 확인
      const passwordCheck = await checkPassword(formData.deletePassword); // 현재 form에서 비밀번호 입력 중인 값을 백엔드에 보내서 그게 유효한지 확인하는 함수

      if (!passwordCheck.success) {
        alert(passwordCheck.error || "비밀번호가 일치하지 않습니다.");
        return;
      }

      // 비밀번호 확인까지 완료되면 다음단계로.

      // 2단계: 회원 탈퇴 API 호출
      const result = await unregisterUser();

      if (result.success) {
        alert("회원 탈퇴가 완료되었습니다. 이용해주셔서 감사했습니다.");
        // 메인 페이지로 리다이렉트 (이미 로그아웃 상태)
        navigate("/");
      } else {
        alert(result.error || "회원 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("Unregister error:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    } finally {
      setIsDeleteModalOpen(false); // 모달을 닫는다
    }
  };

  useEffect(() => {
    if (activeTab === "회원 탈퇴") {
      setIsDeleteModalOpen(false);
      setIsSettingButtonLive(false); // 회원 탈퇴 탭에서는 설정 저장 버튼 숨김
    } else {
      setIsSettingButtonLive(true); // 다른 탭에서는 설정 저장 버튼 표시
    }

    // 탭이 바뀔 때마다 저장 버튼 애니메이션 리셋
    resetSaveButton();
  }, [activeTab]);

  // 컴포넌트 마운트 시 사용자 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await getCurrentUserDetails();

        if (result.success) {
          const userData = result.data; // 백엔드에서 받아온 api의 프로필 데이터를 이용해서..
          setFormData((prev) => ({
            // state에다가 저장한다.
            ...prev,
            nickname: userData.nickname || "",
            email: userData.email || "",
            bio: userData.profile?.introduction || "",
            interests: userData.profile?.interested_in
              ? mapInterestsFromAPI(userData.profile.interested_in)
              : [],
          }));
        } else {
          console.error("사용자 데이터 가져오기 실패:", result.error);
        }
      } catch (error) {
        console.error("사용자 데이터 가져오기 중 오류:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    // '저장' 버튼 누르면 실행되는 것들을 한번에 구현
    if (activeTab === "프로필 수정") {
      // 프로필 수정 저장
      try {
        const profileData = {
          introduction: formData.bio,
          interested_in: mapInterestsToAPI(formData.interests), // 현재 선택된 관심 분야들, 입력된 한줄 소개를 백엔드에 보내준다.
        };

        const result = await updateUserProfile(profileData); // 현재 선택된 것들을 put으로 날려버린다다
        if (result.success) {
          showSaveSuccess(); // 성공하면 저장 성공 애니메이션 띄우기
        } else {
          alert(result.error || "프로필 저장에 실패했습니다.");
        }
      } catch (error) {
        console.error("Profile save error:", error);
        alert("프로필 저장 중 오류가 발생했습니다.");
      }
    } else if (activeTab === "비밀번호 변경") {
      // 비밀번호 변경 저장
      if (
        !formData.password ||
        !formData.newPassword ||
        !formData.confirmPassword
      ) {
        alert("모든 필드를 입력해주세요.");
        return;
      }

      try {
        // 1단계: 현재 비밀번호 확인
        const passwordCheck = await checkPassword(formData.password);
        if (!passwordCheck.success) {
          alert(passwordCheck.error || "현재 비밀번호가 일치하지 않습니다.");
          // 비밀번호 필드 초기화
          setFormData((prev) => ({
            ...prev,
            password: "",
            newPassword: "",
            confirmPassword: "",
          }));
          return;
        }

        if (formData.newPassword.length < 4) {
          alert("새 비밀번호는 4자 이상이어야 합니다.");
          // 비밀번호 필드 초기화
          setFormData((prev) => ({
            ...prev,
            password: "",
            newPassword: "",
            confirmPassword: "",
          }));
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
          // 비밀번호 필드 초기화
          setFormData((prev) => ({
            ...prev,
            password: "",
            newPassword: "",
            confirmPassword: "",
          }));
          return;
        }

        // 2단계: 새 비밀번호로 업데이트
        const accountData = {
          password: formData.newPassword, // put이라 password 필드 하나만 부분적으로 변경해도 됨
        };

        const result = await updateUserAccount(accountData); // 새 비밀번호 담아서 백엔드에 보내버리기기
        if (result.success) {
          alert("비밀번호가 성공적으로 변경되었습니다.");
          // 비밀번호 필드 초기화
          setFormData((prev) => ({
            ...prev,
            password: "",
            newPassword: "",
            confirmPassword: "",
          }));
          showSaveSuccess();
        } else {
          alert(result.error || "비밀번호 변경에 실패했습니다.");
        }
      } catch (error) {
        console.error("Password change error:", error);
        alert("비밀번호 변경 중 오류가 발생했습니다.");
      }
    }
  };

  const showSaveSuccess = () => {
    // 저장 애니메이션 효과
    const saveBtn = document.querySelector(".save-button");
    if (saveBtn) {
      saveBtn.textContent = "저장 완료!";
      saveBtn.style.backgroundColor = "#51CF66";
      setTimeout(() => {
        saveBtn.textContent = "설정 저장";
        saveBtn.style.backgroundColor = "#228BE6";
      }, 2000);
    }
  };

  const resetSaveButton = () => {
    // 저장 버튼을 원래 상태로 리셋. showSaveSuccess 도중 activeTab 넘어갔을 때 호출
    const saveBtn = document.querySelector(".save-button");
    if (saveBtn) {
      saveBtn.textContent = "설정 저장";
      saveBtn.style.backgroundColor = "#228BE6";
    }
  };

  const renderAccountSettings = () => (
    <div className="settings-content-section">
      <h3 className="section-title">프로필 수정</h3>

      {/* 이메일 (비활성화, 회색 배경) */}
      <div className="form-group">
        <div className="input-wrapper">
          <label htmlFor="email">이메일</label>
          <input
            className="input-field input-gray"
            type="email"
            id="email"
            value={formData.email}
            disabled
            aria-readonly
            placeholder="likelion@snu.ac.kr"
          />
        </div>
      </div>

      {/* 닉네임 (흰 배경) */}
      <div className="form-group">
        <div className="input-wrapper">
          <label htmlFor="nickname">닉네임</label>
          <input
            className="input-field input-white"
            type="text"
            id="nickname"
            value={formData.nickname}
            onChange={(e) => handleInputChange("nickname", e.target.value)}
            placeholder="프롬프트장인이되겠어"
          />
        </div>
      </div>

      {/* 관심 분야 (중복 선택 가능한 태그) */}
      <div className="form-group">
        <div className="input-wrapper">
          <label>관심 분야</label>
          <div className="interest-group">
            {allInterests.map((t) => {
              const selected = formData.interests.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  className={`pill ${selected ? "selected" : ""}`}
                  onClick={() => handleToggleInterest(t)}
                  aria-pressed={selected}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 한 줄 소개 */}
      <div className="form-group">
        <div className="input-wrapper">
          <label htmlFor="bio">한 줄 소개</label>
          <textarea
            id="bio"
            className="textarea"
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="AI와 함께 성장하는 개발자입니다."
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-content-section">
      <h3 className="section-title">비밀번호 변경</h3>
      <div className="form-group">
        <div className="input-wrapper">
          <label htmlFor="password">현재 비밀번호</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="현재 비밀번호를 입력하세요"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="newPassword">새 비밀번호</label>
          <input
            type="password"
            id="newPassword"
            value={formData.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
            placeholder="새 비밀번호를 입력하세요"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            placeholder="새 비밀번호를 다시 입력하세요"
          />
        </div>
      </div>
    </div>
  );

  const renderAppSettings = () => (
    <div className="settings-content-section">
      <h3 className="section-title">회원 탈퇴</h3>
      <p className="setting-description">
        계정을 탈퇴하려면 아래 버튼을 클릭하세요. 팝업에서 비밀번호 확인 후
        진행됩니다.
      </p>
      <div>
        <button
          type="button"
          className="delete-button"
          onClick={handleOpenDeleteModal}
        >
          회원 탈퇴 진행
        </button>
      </div>
    </div>
  );

  const renderActiveContent = () => {
    // 한 페이지 안에서 탭 관리하는 칸
    switch (activeTab) {
      case "프로필 수정":
        return renderAccountSettings();

      case "비밀번호 변경":
        return renderPrivacySettings();
      case "회원 탈퇴":
        return renderAppSettings();
      default:
        return renderAccountSettings();
    }
  };

  return (
    <div className="settings-page">
      <Header />

      <main className="settings-main">
        <div className="settings-container">
          {/* 설정 헤더 */}
          <div className="settings-header">
            <div className="settings-title-section">
              <h1 className="settings-title">설정</h1>
              <p className="settings-subtitle">계정 및 앱 설정을 관리하세요</p>
            </div>
          </div>

          <div className="settings-body">
            {/* 사이드바 탭 */}
            <div className="settings-sidebar">
              <nav className="settings-nav">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`settings-nav-item ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="settings-content">
              <div className="settings-content-wrapper">
                {renderActiveContent()} {/* 탭 관리하는 칸 */}
                {/* 저장 버튼 */}
                {isSettingButtonLive && (
                  <div className="settings-actions">
                    <button className="save-button" onClick={handleSave}>
                      설정 저장
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 회원 탈퇴 모달 */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <button
              className="modal-close"
              onClick={handleCloseDeleteModal}
              aria-label="닫기"
            >
              ×
            </button>
            <div className="exit-modal-header">
              <h3 id="delete-modal-title" className="modal-title">
                회원 탈퇴
              </h3>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                모든 기록이 전부 지워지고, 복구가 불가능합니다.
                <br />
                정말 탈퇴하시겠습니까?
                <br />
                <br />
                탈퇴하려면 본인의 <b>비밀번호</b>를 입력해주세요.
              </p>
              <div className="modal-field">
                <input
                  id="deletePassword"
                  type="password"
                  className="modal-input"
                  placeholder="현재 비밀번호를 입력하세요"
                  value={formData.deletePassword}
                  onChange={(e) =>
                    handleInputChange("deletePassword", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="modal-cancel-button"
                onClick={handleCloseDeleteModal}
              >
                취소
              </button>
              <button
                className="modal-delete-button"
                onClick={handleConfirmDelete}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Settings;
