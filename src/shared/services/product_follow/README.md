# Product Follow Contract Service

Comprehensive TypeScript service layer for the Product Follow Contract that manages product following, notifications, alerts, and user preferences within the StarShop marketplace.

## Structure

```
src/shared/services/product_follow/
  follow.service.ts                // Main service class
  index.ts                         // Module exports
  types/
    follow.types.ts               // Core follow TypeScript interfaces
    notification.types.ts         // Notification types
    alert.types.ts                // Alert types
  utils/
    follow.utils.ts               // Helper/validation functions
  constants/
    follow.constants.ts           // Contract addresses, error codes, defaults
```

## Features

### Follow Management
- `followProduct(productId, user)` - Follow a product
- `unfollowProduct(productId, user)` - Unfollow a product
- `getFollowers(productId)` - Get product followers (paginated)
- `getFollowing(user)` - Get user's followed products (paginated)
- `isFollowing(productId, user)` - Check follow status

### Notification Management
- `setNotificationPreferences(user, preferences)` - Set notification preferences
- `getNotificationPreferences(user)` - Get notification preferences
- `sendNotification(productId, type, data)` - Send notification to followers
- `getNotificationHistory(query)` - Get notification history

### Alert Management
- `createAlert(user, request)` - Create price/stock alert
- `updateAlert(user, request)` - Update alert conditions
- `deleteAlert(user, alertId)` - Delete an alert
- `getAlerts(query)` - Get user alerts (paginated)
- `triggerAlert(alertId, values)` - Check alert conditions

### Rate Limiting & Validation
- Built-in rate limiting per user/action
- Address and product ID validation
- Notification format validation
- Alert condition validation

## Usage

```typescript
import { ProductFollowService, createTestnetFollowService } from './index';

const service = createTestnetFollowService();
await service.initialize();

// Follow a product
const result = await service.followProduct('product-123', 'GABCD...');

// Set notification preferences
await service.setNotificationPreferences('GABCD...', {
  enabled: true,
  maxPerDay: 50
});

// Create a price alert
await service.createAlert('GABCD...', {
  productId: 'product-123',
  type: AlertType.PRICE_BELOW,
  conditions: [{ field: 'price', operator: AlertOperator.LESS_THAN, value: 100 }]
});
```
