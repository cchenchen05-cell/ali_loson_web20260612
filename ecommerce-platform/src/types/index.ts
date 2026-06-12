export interface Product {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  summary?: string | null;
  coverImage?: string | null;
  images?: string | null;
  price?: number | null;
  likeBase: number;
  actualLikeCount: number;
  likeCount: number;
  status: string;
  featured: boolean;
  sortOrder: number;
  specifications?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  translations?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  isFavorite?: boolean;
}

export interface Category {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  previewImage?: string | null;
  description?: string | null;
  sortOrder: number;
  children?: Category[];
}

export interface Banner {
  id: number;
  title?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  coverImage?: string | null;
  tags?: string | null;
  status: string;
  publishedAt?: string | null;
  createdAt: string;
}

export interface Announcement {
  id: number;
  content: string;
  isPinned: boolean;
  startAt?: string | null;
  endAt?: string | null;
}

export interface Review {
  id: number;
  productId?: number | null;
  clientName?: string | null;
  avatarUrl?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  rating: number;
  tags?: string | null;
  status: string;
}

export interface Inquiry {
  id: number;
  inquiryNo: string;
  name: string;
  phone: string;
  email: string;
  budget?: string | null;
  purchaseTime?: string | null;
  address?: string | null;
  message?: string | null;
  productIds?: string | null;
  status: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  oldData?: string | null;
  newData?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { username: string };
}

export interface Setting {
  id: number;
  key: string;
  value?: string | null;
  group?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  firstLogin: boolean;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
}

export interface Visitor {
  id: number;
  fingerprint: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  firstVisitAt: string;
  lastVisitAt: string;
  visitCount: number;
}

export interface VenueDesign {
  id: number;
  title: string;
  description: string;
  category: string;
  images: string[];
  sortOrder: number;
}