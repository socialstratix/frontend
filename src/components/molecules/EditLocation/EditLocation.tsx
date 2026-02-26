import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../../constants/colors';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';
import { CloseIcon } from '../../../assets/icons';

interface PhotonFeature {
  properties: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    name?: string;
    street?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface EditLocationProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: {
    city?: string;
    country?: string;
    state?: string;
    address?: string;
    pincode?: string;
  };
  onSave: (location: {
    city?: string;
    country?: string;
    state?: string;
    address?: string;
    pincode?: string;
  }) => void;
  title?: string;
  instruction?: string;
}

export const EditLocation: React.FC<EditLocationProps> = ({
  isOpen,
  onClose,
  initialValue = {},
  onSave,
  title = 'Edit Location',
  instruction = 'Update your location information.',
}) => {
  const [city, setCity] = useState(initialValue.city || '');
  const [country, setCountry] = useState(initialValue.country || '');
  const [state, setState] = useState(initialValue.state || '');
  const [address, setAddress] = useState(initialValue.address || '');
  const [pincode, setPincode] = useState(initialValue.pincode || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCity(initialValue.city || '');
      setCountry(initialValue.country || '');
      setState(initialValue.state || '');
      setAddress(initialValue.address || '');
      setPincode(initialValue.pincode || '');
      setSearchTerm('');
      setSuggestions([]);
    }
  }, [isOpen, initialValue]);

  // Search logic for Photon API (Free OSM alternative)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: PhotonFeature) => {
    const { properties } = suggestion;

    setCity(properties.city || properties.name || '');
    setState(properties.state || '');
    setCountry(properties.country || '');
    setPincode(properties.postcode || '');

    // Clear search and hide dropdown
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      state: state.trim() || undefined,
      address: address.trim() || undefined,
      pincode: pincode.trim() || undefined,
    });
    onClose();
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
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'visible',
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

        {/* Input Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '100%', position: 'relative' }}>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search City/Location (e.g. Mumbai, Berlin)"
              style={{
                width: '100%',
                border: `1px solid ${colors.border.purple}`,
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {isSearching && (
              <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '12px', color: colors.text.secondary }}>
                Searching...
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: colors.primary.white,
                  border: `1px solid ${colors.border.purple}`,
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1100,
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((suggestion, index) => {
                  const { properties } = suggestion;
                  const label = [properties.name, properties.city, properties.state, properties.country]
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #f0f0f0',
                        backgroundColor: 'white',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              style={{
                width: '100%',
                border: `1px solid ${colors.border.purple}`,
              }}
            />
            <Input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              style={{
                width: '100%',
                border: `1px solid ${colors.border.purple}`,
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              style={{
                width: '100%',
                border: `1px solid ${colors.border.purple}`,
              }}
            />
            <Input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
              style={{
                width: '100%',
                border: `1px solid ${colors.border.purple}`,
              }}
            />
          </div>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              border: `1px solid ${colors.border.purple}`,
              borderRadius: '4px',
              resize: 'vertical',
            }}
          />
        </div>

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
