import React, { useState, type KeyboardEvent } from 'react';
import { colors } from '../../../constants/colors';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';
import { CloseIcon } from '../../../assets/icons';

interface EditTagsProps {
  isOpen: boolean;
  onClose: () => void;
  initialTags?: string[];
  onSave: (tags: string[]) => void;
  suggestedTags?: string[];
  maxTags?: number;
  title?: string;
  instruction?: string;
}

export const EditTags: React.FC<EditTagsProps> = ({
  isOpen,
  onClose,
  initialTags = [],
  onSave,
  suggestedTags = [],
  maxTags = 6,
  title = 'Edit tags',
  instruction = 'Add tags that clearly highlight your skills and expertise, making it easy for brands to understand you.',
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTags(initialTags);
      setInputValue('');
    }
  }, [isOpen, initialTags]);

  if (!isOpen) return null;

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      setTags([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleSuggestedTagClick = (tag: string) => {
    if (!tags.includes(tag) && tags.length < maxTags) {
      setTags([...tags, tag]);
    }
  };

  const handleSave = () => {
    onSave(tags);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const availableSuggestedTags = suggestedTags.filter((tag) => !tags.includes(tag));

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
          maxWidth: '600px',
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
            marginBottom: '8px',
            marginTop: 0,
          }}
        >
          {title}
        </h2>

        {/* Instruction */}
        <p
          style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            color: colors.text.secondary,
            marginBottom: '24px',
            lineHeight: '1.5',
          }}
        >
          {instruction}
        </p>

        {/* Input Field */}
        <div style={{ marginBottom: '16px' }}>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter to add a tag"
            disabled={tags.length >= maxTags}
            style={{
              width: '100%',
            }}
          />
        </div>

        {/* Tags Display */}
        {tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {tags.map((tag, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: colors.primary.main,
                  borderRadius: '16px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.primary.white,
                }}
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: colors.primary.white,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    fontSize: '16px',
                    lineHeight: '1',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Max Tags Warning */}
        {tags.length >= maxTags && (
          <p
            style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: colors.red.main,
              marginBottom: '16px',
            }}
          >
            You can only add up to {maxTags} tags.
          </p>
        )}

        {/* Suggested Tags */}
        {availableSuggestedTags.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Suggested Tags
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {availableSuggestedTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedTagClick(tag)}
                  disabled={tags.length >= maxTags}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: colors.secondary.light,
                    borderRadius: '16px',
                    border: 'none',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: colors.text.primary,
                    cursor: tags.length >= maxTags ? 'not-allowed' : 'pointer',
                    opacity: tags.length >= maxTags ? 0.5 : 1,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
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
            SAVE
          </Button>
        </div>
      </div>
    </div>
  );
};

