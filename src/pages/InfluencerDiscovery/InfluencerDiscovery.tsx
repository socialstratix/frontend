import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, RangeSlider } from '../../components';
import { InfluencerGrid } from '../../components';
import { useInfluencerList } from '../../hooks';
import { INFLUENCER_TAGS } from '../../constants/tags';
import { ArrowDropDownIcon, SearchIcon, CloseIcon, FilterIcon } from '../../assets/icons';
import { colors } from '../../constants/colors';
import { influencerService, type Influencer } from '../../services/influencerService';

type Platform = 'instagram' | 'youtube' | 'tiktok' | 'x' | 'facebook';

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'x', label: 'X' },
  { value: 'facebook', label: 'Facebook' },
];

export const InfluencerDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Filter state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [advancedFiltersEnabled, setAdvancedFiltersEnabled] = useState(true);
  const [minFollowers, setMinFollowers] = useState(0);
  const [minAvgViews, setMinAvgViews] = useState(0);
  const [minHighestView, setMinHighestView] = useState(0);
  const [minAvgLikes, setMinAvgLikes] = useState(0);
  const [minHighestLikes, setMinHighestLikes] = useState(0);
  
  // Mobile drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch influencers from API with filters
  const { influencers, isLoading, error } = useInfluencerList({
    limit: 50,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    location: locationFilter || undefined,
  });

  // State for enriched influencers with engagement metrics
  const [enrichedInfluencers, setEnrichedInfluencers] = useState<Influencer[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const metricsCacheRef = useRef<Map<string, Influencer>>(new Map());

  // Check if any filter is active (platform, tags, location, followers, or engagement metrics)
  const hasAnyFilter = useMemo(() => {
    return (
      selectedPlatforms.length > 0 ||
      selectedTags.length > 0 ||
      locationFilter.length > 0 ||
      (advancedFiltersEnabled && minFollowers > 0) ||
      (advancedFiltersEnabled && (minAvgViews > 0 || minHighestView > 0 || minAvgLikes > 0 || minHighestLikes > 0))
    );
  }, [selectedPlatforms, selectedTags, locationFilter, advancedFiltersEnabled, minFollowers, minAvgViews, minHighestView, minAvgLikes, minHighestLikes]);

  // Determine the base path based on current route
  const getBasePath = () => {
    if (location.pathname.startsWith('/brand')) {
      return '/brand';
    } else if (location.pathname.startsWith('/influencer')) {
      return '/influencer';
    } else {
      return '/home';
    }
  };

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setSelectedPlatforms([]);
    setSelectedTags([]);
    setLocationFilter('');
    setAdvancedFiltersEnabled(true);
    setMinFollowers(0);
    setMinAvgViews(0);
    setMinHighestView(0);
    setMinAvgLikes(0);
    setMinHighestLikes(0);
  }, []);

  // Toggle platform selection
  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }, []);

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Handle backdrop click for mobile drawer
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsFilterOpen(false);
    }
  }, []);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFilterOpen) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFilterOpen]);

  // Fetch followers data to get engagement metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      // Fetch if any filter is active
      if (!hasAnyFilter || influencers.length === 0) {
        setEnrichedInfluencers(influencers);
        return;
      }

      setIsLoadingMetrics(true);
      console.log('Fetching engagement metrics for', influencers.length, 'influencers (any filter is active)');

      try {
        // Filter influencers that need metrics (don't have them and aren't in cache)
        const influencersToFetch = influencers.filter((inf) => {
          const hasMetrics = inf.avgViewPerPost !== undefined;
          const inCache = metricsCacheRef.current.has(inf._id);
          return !hasMetrics && !inCache;
        });

        if (influencersToFetch.length === 0) {
          // All influencers already have metrics or are cached
          const cached = influencers.map((inf) => {
            return metricsCacheRef.current.get(inf._id) || inf;
          });
          setEnrichedInfluencers(cached);
          setIsLoadingMetrics(false);
          return;
        }

        console.log('Fetching metrics for', influencersToFetch.length, 'influencers');

        // Fetch in batches of 5 to avoid overwhelming the API
        const batchSize = 5;
        const enriched: Influencer[] = [...influencers];

        for (let i = 0; i < influencersToFetch.length; i += batchSize) {
          const batch = influencersToFetch.slice(i, i + batchSize);
          console.log(`Fetching batch ${Math.floor(i / batchSize) + 1}:`, batch.map(b => b._id));
          
          const batchPromises = batch.map(async (influencer) => {
            try {
              // Check cache first
              if (metricsCacheRef.current.has(influencer._id)) {
                const cached = metricsCacheRef.current.get(influencer._id)!;
                return {
                  index: influencers.findIndex((inf) => inf._id === influencer._id),
                  data: cached,
                };
              }

              // Fetch followers data - THIS WILL SHOW IN NETWORK TAB
              console.log(`Fetching followers for influencer: ${influencer._id}`);
              const followersData = await influencerService.getInfluencerFollowers(influencer._id, '7d');
              
              // Merge engagement metrics and platform followers from API into influencer object
              const enrichedInfluencer: Influencer = {
                ...influencer,
                // Update platformFollowers with API data (more accurate)
                platformFollowers: followersData.platformFollowers,
                avgViewPerPost: followersData.avgViewPerPost,
                highestView: followersData.highestView,
                avgLikesPerPost: followersData.avgLikesPerPost,
                highestLikes: followersData.highestLikes,
              };

              // Cache the enriched influencer
              metricsCacheRef.current.set(influencer._id, enrichedInfluencer);

              return {
                index: influencers.findIndex((inf) => inf._id === influencer._id),
                data: enrichedInfluencer,
              };
            } catch (error) {
              console.error(`Failed to fetch metrics for influencer ${influencer._id}:`, error);
              // Return original influencer if fetch fails
              return {
                index: influencers.findIndex((inf) => inf._id === influencer._id),
                data: influencer,
              };
            }
          });

          const results = await Promise.all(batchPromises);
          
          // Update enriched array with fetched data
          results.forEach(({ index, data }) => {
            if (index >= 0) {
              enriched[index] = data;
            }
          });

          // Update state after each batch so UI updates progressively
          setEnrichedInfluencers([...enriched]);
        }

        setEnrichedInfluencers(enriched);
      } catch (error) {
        console.error('Error fetching engagement metrics:', error);
        // Fallback to original influencers if batch fetch fails
        setEnrichedInfluencers(influencers);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [influencers, hasAnyFilter]);

  // Filter influencers based on all criteria
  const filteredInfluencers = useMemo(() => {
    // Use enriched influencers if any filter is active and we have enriched data, otherwise use original influencers
    const influencersToFilter = hasAnyFilter && enrichedInfluencers.length > 0 
      ? enrichedInfluencers 
      : influencers;
    
    return influencersToFilter.filter((influencer) => {
      // Platform filter
      if (selectedPlatforms.length > 0) {
        const influencerPlatforms: Platform[] = [];
        if (influencer.platformFollowers?.x) influencerPlatforms.push('x');
        if (influencer.platformFollowers?.youtube) influencerPlatforms.push('youtube');
        if (influencer.platformFollowers?.facebook) influencerPlatforms.push('facebook');
        if (influencer.platformFollowers?.instagram) influencerPlatforms.push('instagram');
        if (influencer.platformFollowers?.tiktok) influencerPlatforms.push('tiktok');

        const hasSelectedPlatform = selectedPlatforms.some((platform) =>
          influencerPlatforms.includes(platform)
        );
        if (!hasSelectedPlatform) return false;
      }

      // Followers filter (using data from followers API)
      if (advancedFiltersEnabled && minFollowers > 0) {
        // If platforms are selected, check followers for those specific platforms
        // Otherwise, check max followers across all platforms
        let followersToCheck: number[] = [];
        
        if (selectedPlatforms.length > 0) {
          // Filter based on selected platforms' followers from API
          selectedPlatforms.forEach((platform) => {
            const platformKey = platform === 'x' ? 'x' : platform;
            const followers = influencer.platformFollowers?.[platformKey as keyof typeof influencer.platformFollowers] as number | undefined;
            if (followers !== undefined) {
              followersToCheck.push(followers);
            }
          });
        } else {
          // No platform selected, check all platforms
          followersToCheck = [
            influencer.platformFollowers?.youtube || 0,
            influencer.platformFollowers?.instagram || 0,
            influencer.platformFollowers?.tiktok || 0,
            influencer.platformFollowers?.facebook || 0,
            influencer.platformFollowers?.x || 0,
          ];
        }
        
        // Check if any of the selected platforms (or max if none selected) meets the minimum
        const maxFollowers = followersToCheck.length > 0 
          ? Math.max(...followersToCheck) 
          : 0;
        
        if (maxFollowers < minFollowers) return false;
      }

      // Engagement metrics filters (using data from followers API if available)
      if (advancedFiltersEnabled) {
        // Avg view per post filter
        if (minAvgViews > 0 && influencer.avgViewPerPost !== undefined) {
          if (influencer.avgViewPerPost < minAvgViews) return false;
        }

        // Highest view filter
        if (minHighestView > 0 && influencer.highestView !== undefined) {
          if (influencer.highestView < minHighestView) return false;
        }

        // Avg likes per post filter
        if (minAvgLikes > 0 && influencer.avgLikesPerPost !== undefined) {
          if (influencer.avgLikesPerPost < minAvgLikes) return false;
        }

        // Highest likes filter
        if (minHighestLikes > 0 && influencer.highestLikes !== undefined) {
          if (influencer.highestLikes < minHighestLikes) return false;
        }
      }

      return true;
    });
  }, [
    influencers,
    enrichedInfluencers,
    hasAnyFilter,
    selectedPlatforms,
    advancedFiltersEnabled,
    minFollowers,
    minAvgViews,
    minHighestView,
    minAvgLikes,
    minHighestLikes,
  ]);

  // Map API data to InfluencerGrid format
  const mappedInfluencers = useMemo(() => {
    return filteredInfluencers.map((influencer) => {
      // Determine which platforms the influencer has based on platformFollowers
      const platforms: Array<'instagram' | 'youtube' | 'tiktok' | 'x' | 'facebook'> = [];
      if (influencer.platformFollowers?.x) platforms.push('x');
      if (influencer.platformFollowers?.youtube) platforms.push('youtube');
      if (influencer.platformFollowers?.facebook) platforms.push('facebook');
      if (influencer.platformFollowers?.instagram) platforms.push('instagram');
      if (influencer.platformFollowers?.tiktok) platforms.push('tiktok');

      return {
        id: influencer._id,
        name: influencer.user?.name || 'Influencer',
        image: influencer.coverImage,
        profileImage: influencer.profileImage || influencer.user?.avatar,
        rating: influencer.rating,
        description: influencer.description || influencer.bio,
        platforms,
        platformFollowers: influencer.platformFollowers,
        isTopCreator: influencer.isTopCreator,
      };
    });
  }, [filteredInfluencers]);

  // Render filter panel content (reusable for desktop and mobile)
  const renderFilterPanel = () => (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            color: '#1E002B',
            margin: 0,
          }}
        >
          Filters
        </h2>
        <button
          onClick={handleClearAll}
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: colors.primary.main,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          CLEAR ALL
        </button>
      </div>

      {/* Filters - Vertical Stack */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          flex: 1,
        }}
      >
              {/* Platform Dropdown */}
              <div style={{ position: 'relative' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#1E002B',
                    marginBottom: '8px',
                  }}
                >
                  Select platform
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        togglePlatform(e.target.value as Platform);
                        e.target.value = ''; // Reset select
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 32px 10px 12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#1E002B',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #AA86B9',
                      borderRadius: '4px',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled hidden>
                      {selectedPlatforms.length > 0
                        ? (() => {
                            const labels = selectedPlatforms
                              .map((p) => PLATFORMS.find((pl) => pl.value === p)?.label || p)
                              .join(', ');
                            return labels.length > 20 ? labels.substring(0, 17) + '...' : labels;
                          })()
                        : 'Select platform'}
                    </option>
                    {selectedPlatforms.length === 0 && (
                      <option value="" disabled>
                        Select platform
                      </option>
                    )}
                    {PLATFORMS.filter((p) => !selectedPlatforms.includes(p.value)).map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                  <img
                    src={ArrowDropDownIcon}
                    alt="Dropdown"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  />
                </div>
                {selectedPlatforms.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedPlatforms.map((platform) => {
                      const platformLabel = PLATFORMS.find((p) => p.value === platform)?.label || platform;
                      return (
                        <span
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 12px',
                            backgroundColor: colors.primary.light,
                            color: colors.primary.main,
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontFamily: 'Poppins, sans-serif',
                            cursor: 'pointer',
                          }}
                        >
                          {platformLabel} ×
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tags Dropdown */}
              <div style={{ position: 'relative' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#1E002B',
                    marginBottom: '8px',
                  }}
                >
                  Select Tags
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleTag(e.target.value);
                        e.target.value = ''; // Reset select
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 32px 10px 12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#1E002B',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #AA86B9',
                      borderRadius: '4px',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled hidden>
                      {selectedTags.length > 0
                        ? (() => {
                            const tagsStr = selectedTags.join(', ');
                            return tagsStr.length > 20 ? tagsStr.substring(0, 17) + '...' : tagsStr;
                          })()
                        : 'Select Tags'}
                    </option>
                    {selectedTags.length === 0 && (
                      <option value="" disabled>
                        Select Tags
                      </option>
                    )}
                    {INFLUENCER_TAGS.filter((tag) => !selectedTags.includes(tag)).map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <img
                    src={ArrowDropDownIcon}
                    alt="Dropdown"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  />
                </div>
                {selectedTags.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 12px',
                          backgroundColor: colors.primary.light,
                          color: colors.primary.main,
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontFamily: 'Poppins, sans-serif',
                          cursor: 'pointer',
                        }}
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div style={{ position: 'relative' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#1E002B',
                    marginBottom: '8px',
                  }}
                >
                  Select Location
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="All Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#1E002B',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #AA86B9',
                      borderRadius: '4px',
                      outline: 'none',
                    }}
                  />
                  <img
                    src={SearchIcon}
                    alt="Search"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      pointerEvents: 'none',
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>

        {/* Advanced Filters Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <label
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#1E002B',
            }}
          >
            Advanced Filters
          </label>
          <button
            onClick={() => setAdvancedFiltersEnabled(!advancedFiltersEnabled)}
            style={{
              width: '48px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: advancedFiltersEnabled ? colors.primary.main : '#E0E0E0',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                top: '2px',
                left: advancedFiltersEnabled ? '26px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            />
          </button>
        </div>

        {/* Range Sliders - Vertical Stack */}
        {advancedFiltersEnabled && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
                <RangeSlider
                  label="Followers/Subscribers"
                  min={0}
                  max={1000000}
                  value={minFollowers}
                  onChange={setMinFollowers}
                />
                <RangeSlider
                  label="Avg view per post"
                  min={0}
                  max={1000000}
                  value={minAvgViews}
                  onChange={setMinAvgViews}
                />
                <RangeSlider
                  label="Highest View"
                  min={0}
                  max={1000000}
                  value={minHighestView}
                  onChange={setMinHighestView}
                />
                <RangeSlider
                  label="Avg likes per post"
                  min={0}
                  max={1000000}
                  value={minAvgLikes}
                  onChange={setMinAvgLikes}
                />
            <RangeSlider
              label="Highest likes"
              min={0}
              max={1000000}
              value={minHighestLikes}
              onChange={setMinHighestLikes}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="w-full py-4 sm:py-6 md:py-8"
      style={{
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          @media (min-width: 1024px) {
            .filter-layout {
              grid-template-columns: 1fr 320px !important;
            }
          }
        `}
      </style>
      
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4 px-4 sm:px-6">
        <button
          onClick={() => setIsFilterOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${colors.primary.main}`,
            borderRadius: '8px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: colors.primary.main,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <img src={FilterIcon} alt="Filter" style={{ width: '16px', height: '16px' }} />
          Filters
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isFilterOpen && (
        <div
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '400px',
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              overflow: 'auto',
              animation: 'slideIn 0.3s ease-out',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFilterOpen(false)}
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
                zIndex: 10,
              }}
            >
              <img src={CloseIcon} alt="Close" style={{ width: '20px', height: '20px' }} />
            </button>
            {renderFilterPanel()}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div
          className="filter-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
            maxWidth: '100%',
          }}
        >
          {/* Content Column */}
          <div style={{ minWidth: 0 }}>
            <div className="mb-8 text-center">
              <h1
                className="mb-2 font-bold mx-auto"
                style={{
                  background: 'linear-gradient(90deg, #DD8AFF 0%, #783C91 20%, #DB9400 95%, #FFC244 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '48px',
                  fontWeight: 700,
                  lineHeight: '1.2',
                  textAlign: 'center',
                }}
              >
                Right Voices to Amplify Your Brand!
              </h1>
              <Typography variant="p" className="text-gray-600 mb-6 text-center">
                Find the perfect influencers for Instagram, YouTube, TikTok, and more
              </Typography>
            </div>

            {/* Loading Metrics Indicator */}
            {isLoadingMetrics && (
              <div className="mb-6 flex justify-center items-center gap-4">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    color: colors.primary.main,
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: `2px solid ${colors.primary.main}`,
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Fetching engagement metrics...</span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '40px',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #783C91',
                    borderTop: '4px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                ></div>
                <p style={{ fontFamily: 'Poppins', color: '#666' }}>Loading influencers...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#d32f2f',
                  fontFamily: 'Poppins',
                }}
              >
                <p>Error loading influencers: {error}</p>
              </div>
            ) : mappedInfluencers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#666',
                  fontFamily: 'Poppins',
                }}
              >
                <p>No influencers found.</p>
              </div>
            ) : (
              <InfluencerGrid
                influencers={mappedInfluencers}
                onInfluencerClick={(influencer) => {
                  navigate(`${getBasePath()}/influencer/${influencer.id}`);
                }}
              />
            )}
          </div>

          {/* Desktop Filter Panel - Right Side */}
          <div className="hidden lg:block" style={{ position: 'relative' }}>
            <div
              style={{
                position: 'sticky',
                top: '24px',
                maxHeight: 'calc(100vh - 48px)',
                overflowY: 'auto',
              }}
            >
              {renderFilterPanel()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
