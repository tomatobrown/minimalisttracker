# End of Day (EOD) App

A React Native app built with Expo to track daily habits and activities, then analyze trends over time.

## Features

- **Daily Check-ins**: Answer questions about your daily activities (e.g., "Did you drink alcohol?", "How many times did you poop?")
- **Custom Questions**: Add your own questions to track custom metrics
- **Trend Analysis**: View 30-day trends and statistics for all tracked items
- **Local Storage**: All data is stored locally on your phone using AsyncStorage
- **Cross-platform**: Works on iOS and Android

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. Navigate to the project directory:
```bash
cd EODApp
```

2. Install dependencies:
```bash
npm install
```

### Running the App

#### For iOS (macOS only):
```bash
npm run ios
```

#### For Android:
```bash
npm run android
```

#### For Web:
```bash
npm run web
```

#### Using Expo Go (easiest for testing):
```bash
npm start
```

Then scan the QR code with Expo Go app (available on both iOS and Android app stores).

## Project Structure

```
EODApp/
├── app/                      # Expo Router app screens
│   ├── (tabs)/
│   │   ├── index.tsx        # Daily check-in screen
│   │   ├── trends.tsx       # Trends & statistics screen
│   │   └── settings.tsx     # Settings screen
│   └── _layout.tsx
├── src/
│   ├── components/          # Reusable React components
│   │   ├── QuestionForm.tsx # Main form for daily questions
│   │   └── TrendChart.tsx   # Trend display component
│   ├── storage/             # AsyncStorage utilities
│   │   └── storage.ts       # Data persistence logic
│   └── types/               # TypeScript type definitions
├── assets/                  # App icons and images
└── package.json
```

## Default Questions

The app comes with 5 default questions:

1. How many times did you poop today? (Number)
2. Did you have sex today? (Yes/No)
3. Did you drink alcohol today? (Yes/No)
4. How many hours did you sleep? (Number)
5. Did you exercise today? (Yes/No)

You can add more custom questions in the Settings tab.

## Data Storage

All responses are stored locally on your device using React Native's AsyncStorage:

- **Questions**: Stored in `@eod_questions` key
- **Daily Responses**: Stored in `@eod_responses_YYYY-MM-DD` format

No data is sent to any server - everything stays on your device.

## Features Overview

### Daily Check-in Tab
- View all questions for the day
- Answer yes/no questions, numeric questions, or text questions
- Save responses with one tap
- Edit responses anytime during the day

### Trends Tab
- View statistics for the last 30 days
- See response rates and aggregated data
- Monitor patterns and trends over time

### Settings Tab
- View all your questions
- Add new custom questions (yes/no or numeric)
- Delete questions you no longer want to track

## Building for Production

### iOS:
```bash
eas build --platform ios
```

### Android:
```bash
eas build --platform android
```

(Requires EAS CLI setup: `npm install -g eas-cli`)

## Technologies Used

- **React Native**: Cross-platform mobile app framework
- **Expo**: Build system and development tools
- **TypeScript**: Type-safe JavaScript
- **AsyncStorage**: Local data persistence
- **React Navigation**: Tab-based navigation

## Future Enhancements

- Cloud backup and sync
- Export data to CSV
- Graphs and charts
- Notifications and reminders
- Dark mode support
- Data analysis and insights

## License

This project is open source and available under the MIT License.

## Support

For issues or feature requests, please create an issue in the repository.
