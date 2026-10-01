export interface AlertConditions {
  priceBelow?: number;
  priceAbove?: number;
  stockAbove?: number;
  category?: string;
}

export interface ProductAlert {
  id: string;
  userId: string;
  productId: string;
  conditions: AlertConditions;
  createdAt: number;
  isActive: boolean;
}
