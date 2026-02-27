import React from 'react';
import { XIcon, YouTubeIcon, InstagramIcon, TikTokIcon, VerifiedIcon } from '../../../assets/icons';
import { type ContentItem } from '../../../services/influencerService';

interface MediaSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ContentItem | null;
    isSelected: boolean;
    onToggleSelect: (itemId: string) => void;
}

export const MediaSelectionModal: React.FC<MediaSelectionModalProps> = ({
    isOpen,
    onClose,
    item,
    isSelected,
    onToggleSelect,
}) => {
    if (!isOpen || !item) return null;

    const getPlatformIcon = (platform: string) => {
        const iconStyle = { width: '20px', height: '20px' };
        switch (platform) {
            case 'youtube':
                return <img src={YouTubeIcon} alt="YouTube" style={iconStyle} />;
            case 'instagram':
                return <img src={InstagramIcon} alt="Instagram" style={iconStyle} />;
            case 'tiktok':
                return <img src={TikTokIcon} alt="TikTok" style={iconStyle} />;
            default:
                return null;
        }
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toLocaleString();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #E0E0E0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#1E002B',
                            }}
                        >
                            Media Content Details
                        </h3>
                        {isSelected && (
                            <div
                                style={{
                                    backgroundColor: '#783C91',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                }}
                            >
                                Selected
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img src={XIcon} alt="Close" style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>

                {/* Content Body */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        overflowY: 'auto',
                    }}
                >
                    {/* Media Preview */}
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '300px',
                        }}
                    >
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '500px',
                                objectFit: 'contain',
                            }}
                        />
                    </div>

                    {/* Info Details */}
                    <div
                        style={{
                            width: window.innerWidth < 768 ? '100%' : '300px',
                            padding: '24px',
                            backgroundColor: '#F9F9F9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        <div>
                            <label style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>Title</label>
                            <p style={{ margin: '4px 0 0', fontFamily: 'Poppins', fontWeight: 600, color: '#1E002B' }}>
                                {item.title || 'Untitled Content'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>Platform</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    {getPlatformIcon(item.platform)}
                                    <span style={{ fontSize: '14px', color: '#333', textTransform: 'capitalize' }}>{item.platform}</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>Duration</label>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#333' }}>{item.duration || 'N/A'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>Views</label>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#333', fontWeight: 600 }}>{formatViews(item.views)}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>Date</label>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#333' }}>{item.date || 'Unknown'}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                            <button
                                onClick={() => onToggleSelect(item.id)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: isSelected ? '1px solid #783C91' : 'none',
                                    backgroundColor: isSelected ? 'transparent' : '#783C91',
                                    color: isSelected ? '#783C91' : '#FFFFFF',
                                    fontFamily: 'Poppins',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                {isSelected ? (
                                    <>
                                        <img src={VerifiedIcon} alt="Selected" style={{ width: '16px', height: '16px', filter: 'invert(31%) sepia(35%) saturate(1478%) hue-rotate(248deg) brightness(91%) contrast(92%)' }} />
                                        Deselect Content
                                    </>
                                ) : (
                                    'Select for Individual Campaign'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
