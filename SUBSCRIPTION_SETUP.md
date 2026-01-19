# Subscription Setup Guide

## Overview
Your app now has a subscription system with:
- **1 month free trial** for all new users
- **$20 lifetime access** (one-time payment)
- **$1/month subscription** (recurring)

## Setup Steps

### 1. RevenueCat Setup

1. **Create a RevenueCat Account**
   - Go to https://www.revenuecat.com/
   - Sign up for a free account
   - Create a new project

2. **Get Your API Key**
   - In RevenueCat dashboard, go to Settings → API Keys
   - Copy your Public SDK Key for iOS
   - Update the API key in `/src/services/subscriptionService.ts`:
     ```typescript
     const REVENUECAT_API_KEY = 'YOUR_ACTUAL_KEY_HERE';
     ```

3. **Configure iOS**
   - In RevenueCat, go to Project Settings → Apps
   - Add your iOS app
   - Enter your Bundle ID: `com.eodapp.app`
   - Link to App Store Connect (will prompt for credentials)

### 2. App Store Connect Setup

1. **Create In-App Purchase Products**
   - Log in to https://appstoreconnect.apple.com/
   - Select your app "End of Day"
   - Go to "Features" → "In-App Purchases"
   
2. **Create Lifetime Product**
   - Click "+" to add a new in-app purchase
   - Type: **Non-Consumable**
   - Reference Name: `EOD Lifetime Access`
   - Product ID: `eod_lifetime` (or your preferred ID)
   - Price: $19.99 USD (or your preferred price)
   - Add localized descriptions
   - Submit for review

3. **Create Monthly Subscription**
   - Click "+" to add a subscription
   - Type: **Auto-Renewable Subscription**
   - Create a new Subscription Group: `EOD Premium`
   - Reference Name: `EOD Monthly Subscription`
   - Product ID: `eod_monthly` (or your preferred ID)
   - Subscription Duration: 1 Month
   - Price: $0.99 USD (or your preferred price)
   - Add localized descriptions
   - Submit for review

### 3. RevenueCat Product Configuration

1. **Create Entitlements**
   - In RevenueCat dashboard, go to "Entitlements"
   - Create entitlement: `lifetime`
   - Create entitlement: `monthly`

2. **Link Products**
   - Go to "Products" in RevenueCat
   - Add your App Store products:
     - Product ID: `eod_lifetime` → Attach to `lifetime` entitlement
     - Product ID: `eod_monthly` → Attach to `monthly` entitlement

3. **Create Offerings**
   - Go to "Offerings" in RevenueCat
   - Create a new offering called "default"
   - Add packages:
     - Package: Lifetime → Product: `eod_lifetime`
     - Package: Monthly → Product: `eod_monthly`
   - Set as current offering

### 4. iOS Native Setup

Since you're using EAS Build, the native setup should be handled automatically, but verify:

1. **Install Pods**
   ```bash
   cd ios && pod install
   ```

2. **Capabilities in Xcode**
   - Open the workspace: `EODApp.xcworkspace`
   - Select your target
   - Go to "Signing & Capabilities"
   - Add "In-App Purchase" capability (should already be there)

### 5. Testing

1. **Create Sandbox Test Account**
   - Go to App Store Connect → Users and Access → Sandbox Testers
   - Create a test account with a unique email
   
2. **Test on Device**
   - Sign out of your real App Store account on the test device
   - Build and run the app
   - When prompted, sign in with your sandbox test account
   - Test purchasing both the lifetime and monthly options
   - Test restore purchases

3. **Test Trial Period**
   - Delete the app
   - Clear app data
   - Reinstall
   - Should show 30 days free trial

### 6. App Store Submission

When submitting to App Store Review:

1. **In-App Purchase Screenshot**
   - Take screenshots of the paywall screen
   - Upload to App Store Connect

2. **Review Notes**
   - Provide a test account if needed
   - Explain the trial: "Users get 30 days free, then must subscribe"
   - Mention restore purchases functionality

### 7. Price Adjustments

To change prices, update in both places:

1. **App Store Connect**
   - Edit your in-app purchase products
   - Change the price tier

2. **RevenueCat**
   - Will sync automatically from App Store

## Important Notes

- **Trial Period**: Tracked locally by first launch date (30 days)
- **Product IDs**: Must match exactly between App Store Connect and RevenueCat
- **Entitlements**: The app checks for "lifetime" or "monthly" entitlements
- **Paywall**: Shows automatically when trial expires or no subscription found
- **Settings Screen**: Shows current subscription status

## Customization

### Change Trial Duration
In `/src/services/subscriptionService.ts`:
```typescript
const TRIAL_DAYS = 30; // Change to your desired number
```

### Change Prices
Update in App Store Connect only - they will sync to RevenueCat

### Modify Paywall UI
Edit `/src/screens/PaywallScreen.tsx` to customize the look and feel

## Troubleshooting

### "No products found"
- Verify products are in "Ready to Submit" or "Approved" state
- Check Product IDs match between App Store Connect and RevenueCat
- Wait 2-4 hours after creating products for them to be available in sandbox

### "Purchase failed"
- Make sure using a sandbox test account
- Check RevenueCat API key is correct
- Verify app's bundle ID matches App Store Connect

### Trial not working
- Check the first launch date is being saved correctly
- Clear app data to reset trial
- Verify AsyncStorage is working

## Support
- RevenueCat Docs: https://docs.revenuecat.com/
- App Store Connect Help: https://developer.apple.com/app-store-connect/
