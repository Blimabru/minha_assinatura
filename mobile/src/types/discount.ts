export interface Discount {
  id: string;
  serviceName: string;
  description: string;
  discountCode?: string;
  discountPercentage?: number;
  affiliateLink?: string;
  externalLink: string;
  category?: string;
  active: boolean;
  createdAt: Date;
}

export interface DiscountItem {
  id: string;
  serviceName: string;
  description: string;
  discountCode?: string;
  discountPercentage?: number;
  affiliateLink?: string;
  externalLink: string;
  category?: string;
}
