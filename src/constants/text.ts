// Text constants for UI labels and messages

export const text = {
  campaign: {
    title: 'Campaign details',
    description: 'Share details about the influencers you\'d like to target. We\'ll gather campaign specifics, including content needs and product descriptions, once your targeting is set.',
    name: {
      label: 'What is the Campaign name?',
      placeholder: 'Campaign name',
    },
    descriptionField: {
      label: 'Write description of the Campaign?',
      placeholder: 'Description',
    },
    platform: {
      label: 'Where Campaign?',
      youtube: 'YouTube',
      facebook: 'Facebook',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      x: 'X',
    },
    tags: {
      label: 'Add tags',
      placeholder: 'Description',
    },
    attachments: {
      label: 'Add Attachments',
      button: 'Attach files',
    },
    next: 'NEXT',
  },
  pricing: {
    title: 'Pricing details',
    description: 'Provide your pricing details, and estimate costs based on your campaign goals and influencer reach. Get a clear breakdown to align with your targeting strategy.',
    budget: {
      label: 'What is the Campaign budget?',
      placeholder: 'Campaign budget',
    },
    postCampaign: 'POST CAMPAIGN',
  },
} as const;

