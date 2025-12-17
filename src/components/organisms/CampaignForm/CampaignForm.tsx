import React, { useState } from 'react';
import { Input, Textarea, Button, Checkbox } from '../../atoms';
import { SearchBar } from '../../molecules';
import { Card } from '../../molecules';

interface Influencer {
  id: string;
  name: string;
  image?: string;
}

interface CampaignFormData {
  name: string;
  description: string;
  publishDate: string;
  publishTime: string;
  tags: string[];
  platforms: string[];
  influencers: string[];
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  availableInfluencers?: Influencer[];
  initialData?: Partial<CampaignFormData>;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
  onSubmit,
  availableInfluencers = [],
  initialData,
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    publishDate: initialData?.publishDate || '',
    publishTime: initialData?.publishTime || '',
    tags: initialData?.tags || [],
    platforms: initialData?.platforms || [],
    influencers: initialData?.influencers || [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const toggleInfluencer = (influencerId: string) => {
    setFormData({
      ...formData,
      influencers: formData.influencers.includes(influencerId)
        ? formData.influencers.filter((id) => id !== influencerId)
        : [...formData.influencers, influencerId],
    });
  };

  const filteredInfluencers = availableInfluencers.filter((inf) =>
    inf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Campaign name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Textarea
        label="What is the description of the campaign"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        rows={4}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="When to publish"
          type="date"
          value={formData.publishDate}
          onChange={(e) =>
            setFormData({ ...formData, publishDate: e.target.value })
          }
          required
        />
        <Input
          label="Time"
          type="time"
          value={formData.publishTime}
          onChange={(e) =>
            setFormData({ ...formData, publishTime: e.target.value })
          }
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add tags
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type and press Enter"
            className="flex-1"
          />
          <Button type="button" onClick={addTag}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post on
        </label>
        <div className="space-y-2">
          {['Instagram', 'YouTube', 'TikTok'].map((platform) => (
            <Checkbox
              key={platform}
              label={platform}
              checked={formData.platforms.includes(platform.toLowerCase())}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    platforms: [...formData.platforms, platform.toLowerCase()],
                  });
                } else {
                  setFormData({
                    ...formData,
                    platforms: formData.platforms.filter(
                      (p) => p !== platform.toLowerCase()
                    ),
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add influencers
        </label>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search influencers..."
          className="mb-4"
        />
        <Card className="max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {filteredInfluencers.map((influencer) => (
              <div
                key={influencer.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {influencer.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{influencer.name}</span>
                </div>
                <Checkbox
                  checked={formData.influencers.includes(influencer.id)}
                  onChange={() => toggleInfluencer(influencer.id)}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create Campaign
        </Button>
      </div>
    </form>
  );
};

