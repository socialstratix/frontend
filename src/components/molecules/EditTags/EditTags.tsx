import React, { useState, type KeyboardEvent } from 'react';
import { colors } from '../../../constants/colors';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';
import { CloseIcon, CheckIcon } from '../../../assets/icons';
import { INFLUENCER_TAGS } from '../../../constants/tags';

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

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || inputValue;
    if (!tagToAdd.trim()) return;

    // Split input by comma and handle each tag independently
    const inputTags = tagToAdd.split(',').map(t => t.trim()).filter(t => t);

    const newTags = [...tags];

    inputTags.forEach(t => {
      // Check for case-insensitive duplicate
      const isDuplicate = newTags.some(existingTag =>
        existingTag.toLowerCase() === t.toLowerCase()
      );

      if (!isDuplicate && newTags.length < maxTags) {
        newTags.push(t);
      }
    });

    if (newTags.length !== tags.length) {
      setTags(newTags);
      setInputValue(''); // Clear input after successful addition
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleSuggestedTagClick = (tag: string) => {
    // Check for case-insensitive match in current tags
    const existingIndex = tags.findIndex(t => t.toLowerCase() === tag.toLowerCase());

    if (existingIndex !== -1) {
      // Remove tag if already selected (case-insensitive)
      const newTags = [...tags];
      newTags.splice(existingIndex, 1);
      setTags(newTags);
    } else if (tags.length < maxTags) {
      // Add tag if not selected and under max limit
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

  // Use INFLUENCER_TAGS if suggestedTags is empty, otherwise use suggestedTags
  const allTags = suggestedTags.length > 0 ? suggestedTags : [...INFLUENCER_TAGS];

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
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag..."
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

        {/* All Tags - Scrollable */}
        {allTags.length > 0 && (
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
              All Tags
            </h3>
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '4px',
                scrollbarWidth: 'thin',
                scrollbarColor: `${colors.primary.main || '#783C91'} ${colors.secondary.light || '#F5F0F8'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {allTags.map((tag, index) => {
                  const isSelected = tags.includes(tag);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestedTagClick(tag)}
                      disabled={!isSelected && tags.length >= maxTags}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: isSelected
                          ? (colors.primary.main || '#783C91')
                          : (colors.grey.light || '#E0E0E0'),
                        borderRadius: '20px',
                        border: 'none',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        color: isSelected
                          ? '#FFFFFF'
                          : (colors.text.secondary || '#676767'),
                        cursor: (!isSelected && tags.length >= maxTags) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: (!isSelected && tags.length >= maxTags) ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!(!isSelected && tags.length >= maxTags)) {
                          e.currentTarget.style.backgroundColor = isSelected
                            ? (colors.primary.dark || '#3F214C')
                            : (colors.primary.main || '#783C91');
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(!isSelected && tags.length >= maxTags)) {
                          e.currentTarget.style.backgroundColor = isSelected
                            ? (colors.primary.main || '#783C91')
                            : (colors.grey.light || '#E0E0E0');
                          e.currentTarget.style.color = isSelected
                            ? '#FFFFFF'
                            : (colors.text.secondary || '#676767');
                        }
                      }}
                    >
                      {isSelected && (
                        <img
                          src={CheckIcon}
                          alt="Selected"
                          style={{
                            width: '14px',
                            height: '14px',
                            filter: 'brightness(0) invert(1)'
                          }}
                        />
                      )}
                      {tag}
                    </button>
                  );
                })}
              </div>
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

