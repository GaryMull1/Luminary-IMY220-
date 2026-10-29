import React, { useState, useRef } from 'react';
import { api } from '../../api';
import './AvatarUploader.css';

const AvatarUploader = ({ profile, onAvatarUpdated }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);
    const dragCounter = useRef(0);

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profile.name
    )}&background=6C63FF&color=fff&size=120`;

    const validateFile = (file) => {
        if (!file) return 'No file selected';
        if (!file.type.startsWith('image/')) return 'Please select an image file';
        if (file.size > 5 * 1024 * 1024) return 'Image must be less than 5MB';
        return null;
    };

    const uploadFile = async (file) => {
        const validationError = validateFile(file);
        if (validationError) { setError(validationError); return; }

        setError('');
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const res = await api('/api/users/me', {
                    method: 'PUT',
                    body: JSON.stringify({ profileImage: reader.result }),
                });
                onAvatarUpdated(res.user.profileImage);
            } catch (err) {
                setError(err.message || 'Upload failed');
            } finally {
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            setError('Could not read file');
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleFiles = (files) => {
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
    };

    const handleClick = () => {
        if (isUploading) return;
        inputRef.current?.click();
    };

    const handleInputChange = (e) => {
        handleFiles(e.target.files);
        // Reset so the same file can be chosen again
        e.target.value = '';
    };

    const displaySrc = preview || profile.avatar || defaultAvatar;

    return (
        <div className="avatar-uploader">
            <div
                className={`avatar-uploader-dropzone ${isDragging ? 'is-dragging' : ''
                    } ${isUploading ? 'is-uploading' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleClick();
                }}
                aria-label="Change profile picture"
            >
                <img
                    src={displaySrc}
                    alt={profile.name}
                    className="profile-avatar w-20 h-20 md:w-[120px] md:h-[120px]"
                />

                {/* Hover / drag overlay */}
                <div className="avatar-uploader-overlay">
                    {isUploading ? (
                        <div className="avatar-uploader-spinner" />
                    ) : (
                        <>
                            <svg
                                className="avatar-uploader-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span className="avatar-uploader-text">
                                {isDragging ? 'Drop to upload' : 'Change photo'}
                            </span>
                        </>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="avatar-uploader-input"
                    aria-hidden="true"
                    tabIndex={-1}
                />
            </div>

            {error && <p className="avatar-uploader-error">{error}</p>}
        </div>
    );
};

export default AvatarUploader;