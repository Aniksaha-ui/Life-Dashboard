export const CAMPAIGN_BANNER_IMAGES = [
  "https://campaign.sslcommerz.com/fifa_26/images/Landing-page-Banner.png",
  "https://campaign.sslcommerz.com/summer_26/images/Landing-page-Banner.png",
] as const;

export const getRandomCampaignBanner = () =>
  CAMPAIGN_BANNER_IMAGES[
    Math.floor(Math.random() * CAMPAIGN_BANNER_IMAGES.length)
  ];

export const getCampaignBannerByIndex = (index: number) =>
  CAMPAIGN_BANNER_IMAGES[index % CAMPAIGN_BANNER_IMAGES.length];
