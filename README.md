# Profile Feedback App

A React Native mobile application that allows users to receive and view feedback on their profile content, including photos, bio, and prompt responses.

## Features

- **Photo Ratings**: View your photos ranked by user ratings
- **Bio Feedback**: Get detailed feedback on your profile bio
- **Prompt Analysis**: See how users rate your responses to profile prompts
- **Detailed Feedback**: Receive specific comments on what works and what could be improved
- **Rating Breakdown**: View the distribution of ratings across different aspects of your profile

## Screens

1. **Rate Screen**: Where users can rate others' profiles
2. **Bio Rating Screen**: For providing feedback on profile bios
3. **Feedback Screen**: Where users can view their own feedback, including:
   - Photo rankings
   - Bio ratings and comments
   - Prompt response ratings and feedback

## Feedback Types

### Positive Feedback
- "Feels authentic and genuine."
- "Shows great personality!"
- "Made me smile — love the vibe."
- "Unique and memorable."
- "This makes me want to know more."

### Constructive Feedback
- "This doesn't tell me much about you."
- "Feels a bit generic — try something more personal."
- "Too vague — give a clearer example."
- "Could show more warmth or personality."
- "Comes off a little negative or closed-off."

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/joeylane729/feedback.git
   cd feedback
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app on your physical device

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── navigation/     # Navigation configuration
├── screens/        # Screen components
├── services/       # API and service functions
└── utils/          # Utility functions
```

## Technologies Used

- React Native
- Expo
- TypeScript
- React Navigation
- React Native Paper (UI components)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 