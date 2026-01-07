/** @format */

import React, { useRef, useState, useEffect, useContext } from "react";
import UpdateProfileModal from "./UpdateProfileModal";
import { ReactComponent as ProfileIcon } from "../../assets/images/user_profile.svg";
import Modal from "react-bootstrap/Modal";
import { RxCross2 } from "react-icons/rx";
import { notifyError, notifySuccess } from "../../hooks/toastUtils";
import { loadModels, stopCamera, detectFaceDescriptor, captureImageFromVideo } from "../../hooks/useFaceRecognition";
import { ToastContainer } from "react-toastify";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { MdModeEdit } from "react-icons/md";
import { Spinner } from "react-bootstrap";
import { SlCamera } from "react-icons/sl";
import useAppsApi from "../../hooks/useAppsApi";
import Swal from "sweetalert2";
import { DataContext } from "../../context/DataContext";

const PersonalContentBox = () => {
  const { profileImage, setProfileImage } = useContext(DataContext)
  const [updateProfileShow, setUpdateProfileShow] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFacePopup, setShowFacePopup] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [faceLoading, setFaceLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const menuRef = useRef(null);


  const handleModalClose = async () => {
    setShowFacePopup(false);
    setErrorMessage("");
  };

  const user_id = localStorage.getItem("id")
  const user_token = localStorage.getItem("token")

  const captureFace = async () => {
    try {
      setFaceLoading(true);
      setErrorMessage("");
      if (!videoRef.current) return null;
      const video = videoRef.current;
      await new Promise((resolve) => {
        if (video.readyState >= 2) return resolve();
        video.onloadeddata = () => resolve();
      });

      const imageBase64 = await captureImageFromVideo(videoRef);
      const descriptor = await detectFaceDescriptor(videoRef);
      if (!descriptor) throw new Error("No face detected. Make sure your face is centered and clearly visible.");

      const formData = new FormData();
      formData?.append("user_id", user_id);
      formData?.append("user_token", user_token);
      formData.append("user_face_descriptor", JSON.stringify(descriptor))
      formData.append("user_face", imageBase64)

      const registerFace = await useAppsApi('update-user-face', formData)

      if (registerFace.status_code == 1) {
        localStorage.setItem('profile', registerFace?.user_face);
        setProfileImage(import.meta.env.VITE_IMAGE_BASE_URL + registerFace?.user_face)
        notifySuccess("Face captured!");
        setShowMenu(false);
        setShowFacePopup(false);
      } else if (registerFace.status_code == 0) {
        setErrorMessage(registerFace.msg);
      }
    } catch (err) {
      setErrorMessage(err.msg || "Face not clearly visible");
    } finally {
      setFaceLoading(false);
    }
  };

  useEffect(() => () => stopCamera(streamRef), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowImagePreview(false);
    };

    if (showImagePreview) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showImagePreview]);

  const startFaceCaptureFlow = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    try {
      setFaceLoading(true);
      setErrorMessage("");
      setShowFacePopup(true);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      await loadModels();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      // notifyError("Camera access is blocked. Please allow it from your browser settings.");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        notifyError("Camera access is blocked. Please allow it from your browser settings.");
        setErrorMessage("Camera access is blocked. Please allow it from your browser settings.");
      } else if (isIOS) {
        setErrorMessage("Camera access is required. Please enable it in iOS Safari: Settings > Safari > Camera.");
        notifyError("Camera access is required. Please enable it in iOS Safari: Settings > Safari > Camera.");
      } else {
        setErrorMessage("Unable to access the camera. Please check permissions and try again.");
        notifyError("Unable to access the camera. Please check permissions and try again.");
      }

      setShowFacePopup(false);
      stopCamera(streamRef);
    } finally {
      setFaceLoading(false);
    }
  };
  useEffect(() => {
    if (!showFacePopup) {
      stopCamera(streamRef);
    }
  }, [showFacePopup]);

  const userData = {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
  };
  // alert
  const handleAlert = () => {
    Swal.fire({
      title: "Are you sure you want to delete?",
      width: 450,
      icon: "warning",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#1967d2",
      cancelButtonColor: "#5f6368",
      confirmButtonText: "Yes",
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        const confirmButton = Swal.getConfirmButton();
        confirmButton.innerHTML = `<div class="logout_spinner"></div>`;
        const apiStatus = await handleDelete();
        if (apiStatus === 1) {
          localStorage.removeItem('profile')
          setProfileImage(null)
          setShowMenu(false);
          notifySuccess("Image removed");
        } else {
          Swal.showValidationMessage("Please try again");
        }
      },
    });
  };

  const handleDelete = async () => {
    try {
      const deleteFormData = new FormData()
      deleteFormData.append('user_id', user_id)
      deleteFormData.append('user_token', user_token)
      const response = await useAppsApi('delete-user-face', deleteFormData)
      return response.status_code;
    } catch (error) {
      return 0
    }
  }

  return (
    <div className={`right-box-wrap`}>
      <ToastContainer position="top-center" />
      <div className="main-box-wrapper personal-profile">
        <div className="main-box-row info-box-wrap">
          <div className="button-top-wrap">
            <h1 className="title"></h1>
            <div className="d-content-btn float-right text-transform body-font-btn ml-0" onClick={() => setUpdateProfileShow(true)}>
              Edit Profile
            </div>
          </div>
          <div className="box-wrapper">
            <div className="box">
              <div className="title-box profile-sub-title">
                <div>User Profile</div>
              </div>
              <div className="content-box">
                <div className="img-box profile_photo profile-avatar-wrapper" style={{ position: "relative", display: "inline-block" }}>
                  {!imageError && profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-avatar" onError={() => setImageError(true)} onClick={() => setShowImagePreview(true)} style={{ cursor: "pointer", transform: "scaleX(-1)" }} />
                  ) : (
                    <ProfileIcon className="profile-avatar" />
                  )}

                  <span className="edit-icon-user" onClick={() => setShowMenu(!showMenu)} title="Edit">
                    <MdModeEdit size={14} />
                  </span>

                  {showMenu && (
                    <div className="menu-box-user" ref={menuRef}>
                      <div className="menu-item-user" onClick={startFaceCaptureFlow}>
                        <FiCamera /> Capture
                      </div>
                      {profileImage && <div
                        className="menu-item-user delete"
                        onClick={() => handleAlert()}
                      >
                        <FiTrash2 /> Delete
                      </div>}
                    </div>
                  )}
                  <Modal show={showFacePopup} onHide={handleModalClose} size="xl-down" centered className="modal fade basic-modal-wrap popup-modal-wrap face-popup-overlay face-login-model">
                    <Modal.Body className="text-center">
                      <div className="face-popup-content">
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div className="face-instruction">Capture Photo</div>
                          <div
                            style={{
                              cursor: "pointer",
                              zIndex: 10,
                            }}
                            onClick={handleModalClose}
                            title="Close"
                          >
                            <RxCross2 size={22} />
                          </div>
                        </div>
                        <video ref={videoRef} autoPlay muted playsInline className="face-video" style={{ transform: "scaleX(-1)" }} />

                        <div className="error-actions">
                          <div style={{ display: "flex", justifyContent: "center", marginTop: "5px", marginBottom: "5px" }}>
                            {/* <button type="button" className="d-content-btn float-right" onClick={handleModalClose} disabled={faceLoading}>
                              Cancel
                            </button> */}
                            <button
                              className="d-content-btn bg-btn float-right face-capture-btn"
                              onClick={captureFace}
                              disabled={faceLoading}
                              style={{ backgroundColor: "#3b82f6", fontSize: "14px", textTransform: "initial", letterSpacing: "0.55px", padding: "8px 20px", borderRadius: "5px", minWidth: "120px" }}
                            >
                              {faceLoading ? (
                                <div>
                                  <Spinner animation="border" size="sm" />{" "}
                                </div>
                              ) : (
                                <>
                                  <SlCamera size={18} style={{ marginRight: "10px", fontWeight: "600", marginBottom: "2px" }} strokeWidth={20} />
                                  <span>Capture</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        {errorMessage && (
                          <div className="face-error-message">
                            <div className="formErrors" style={{ fontSize: "14px" }}>
                              {errorMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </Modal.Body>
                  </Modal>
                </div>
              </div>
            </div>
            <div className="box">
              <div className="title-box profile-sub-title">
                <div>Name</div>
              </div>
              <div className="content-box">
                <p className="">{localStorage.getItem("name")}</p>
              </div>
            </div>
            <div className="box">
              <div className="title-box profile-sub-title">
                <div>Email</div>
              </div>
              <div className="content-box">
                {userData?.email || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <UpdateProfileModal show={updateProfileShow} onHide={() => setUpdateProfileShow(false)} />
      <Modal
        show={showImagePreview}
        onHide={() => setShowImagePreview(false)}
        size="xl-down"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal fade basic-modal-wrap popup-modal-wrap image-preview-modal"
      >
        <Modal.Body className="text-center">
          <div className="face-popup-content">
            <div style={{ position: "relative" }}>
              <img
                src={profileImage}
                alt="Preview"
                style={{ transform: "scaleX(-1)", borderRadius: 10 }}
              />
              <div className="image-preview-close-icon" onClick={() => setShowImagePreview(false)} title="Close preview">
                <RxCross2 />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PersonalContentBox;
