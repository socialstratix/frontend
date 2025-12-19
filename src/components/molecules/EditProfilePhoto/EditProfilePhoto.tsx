import React, { useState, useRef, DragEvent } from 'react';
import { colors } from '../../../constants/colors';
import { Button } from '../../atoms/Button/Button';
import { EditButton } from '../../atoms/EditButton/EditButton';
import { CloseIcon } from '../../../assets/icons';

interface EditProfilePhotoProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhoto?: string;
  onSave: (photo: File | null) => void;
  title?: string;
  maxSize?: number; // in MB
  maxDimensions?: string; // e.g., "200x200" or "300x300"
  multiplePhotos?: boolean;
}

export const EditProfilePhoto: React.FC<EditProfilePhotoProps> = ({
  isOpen,
  onClose,
  initialPhoto,
  onSave,
  title = 'Edit Profile photo',
  maxSize = 10,
  maxDimensions = '200x200',
  multiplePhotos = false,
}) => {
  const [photo, setPhoto] = useState<string | null>(initialPhoto || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPhoto(initialPhoto || null);
      setPhotoFile(null);
    }
  }, [isOpen, initialPhoto]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize} MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setPhotoFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleEditButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    onSave(photoFile);
    onClose();
  };

  const handleChange = () => {
    fileInputRef.current?.click();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: colors.primary.white,
          borderRadius: '8px',
          padding: '32px',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={CloseIcon} alt="Close" style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Poppins',
            fontSize: '20px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '24px',
            marginTop: 0,
          }}
        >
          {title}
        </h2>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Left Side - Photo Upload Area */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            {photo ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage: `url(${photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: `2px solid ${colors.border.light}`,
                  }}
                >
                  {/* Edit Button on Avatar */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      zIndex: 1,
                    }}
                  >
                    <EditButton
                      onClick={handleEditButtonClick}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                      }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    marginTop: '8px',
                    textAlign: 'center',
                  }}
                >
                  {maxDimensions} Min / {maxSize} MB Max
                </p>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  border: `2px dashed ${isDragging ? colors.primary.main : colors.border.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? colors.secondary.light : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <p
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      color: colors.text.secondary,
                      margin: 0,
                    }}
                  >
                    Add or drop photo here
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            {!photo && (
              <p
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: colors.text.secondary,
                  marginTop: '8px',
                  textAlign: 'center',
                }}
              >
                {maxDimensions} Min / {maxSize} MB Max
              </p>
            )}
          </div>

          {/* Right Side - Info */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Show clients the best version of yourself!
            </h3>

            {/* Multiple Face Previews - Always show when photo is selected */}
            {photo && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  alignItems: 'center',
                }}
              >
                {[80, 60, 45, 35].map((size, index) => (
                  <div
                    key={index}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundImage: `url(${photo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: `1px solid ${colors.border.light}`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Guidelines */}
            <div style={{ marginBottom: '16px' }}>
              <p
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.text.primary,
                  marginBottom: '8px',
                  lineHeight: '1.5',
                }}
              >
                Must be an actual photo of you.
              </p>
              <p
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  lineHeight: '1.5',
                }}
              >
                Logos, clip-art, group photos, and digitally-altered images are not recommended.
              </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Add learn more functionality
                }}
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.primary.main,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Learn more
              </a>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            style={{
              padding: '8px 24px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            CANCEL
          </Button>
          {photo ? (
            <>
              <Button
                variant="outline"
                onClick={handleChange}
                style={{
                  padding: '8px 24px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                CHANGE
              </Button>
              <Button
                variant="filled"
                onClick={handleSave}
                style={{
                  padding: '8px 24px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: colors.primary.main,
                }}
              >
                SAVE PHOTO
              </Button>
            </>
          ) : (
            <Button
              variant="filled"
              onClick={handleSave}
              disabled={!photo}
              style={{
                padding: '8px 24px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                backgroundColor: colors.primary.main,
              }}
            >
              SAVE PHOTO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

