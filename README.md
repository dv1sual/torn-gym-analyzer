# 🏋️ Torn Gym Analyzer

A comprehensive React + TypeScript web application for optimizing training gains in Torn City. Calculate optimal gym selection, energy allocation, and track your training progress with precision using the **Vladar Formula**.

![Torn Gym Analyzer](https://img.shields.io/badge/Torn-Gym%20Analyzer-green?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎯 **Core Calculator**
- **Precise Calculations**: Uses the authoritative Vladar Formula for accurate training predictions
- **All Gym Support**: Compare gains across all Torn gyms (Balboas, Frontline, etc.)
- **Energy Allocation**: Optimize energy distribution across different stats
- **Real-time Results**: Instant calculations with detailed breakdowns

### 🔗 **Torn API Integration**
- **Auto-Fill Stats**: Automatically populate your current stats from Torn API
- **Live Data Sync**: Real-time happy, energy, and perk detection
- **Secure API Key Management**: Safe storage with connection validation
- **Faction Integration**: Auto-detect Steadfast bonuses

### 📊 **Advanced Analytics**
- **Training History**: Track your progress over time with detailed logs
- **Progress Charts**: Visual representation of stat improvements
- **Goal Tracking**: Set targets and monitor progress
- **Export Data**: Download training history as CSV/JSON

### 🎨 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with professional styling
- **Mobile Optimized**: iPhone-friendly interface with compact layouts
- **Tooltips & Help**: Comprehensive guidance throughout the app

### 🔧 **Perks & Bonuses System**
- **Property Perks**: Pool, Sauna, and other property bonuses
- **Education Bonuses**: Stat-specific and general education multipliers
- **Job Perks**: Gym-related job bonuses
- **Book Bonuses**: Training book multipliers
- **Faction Steadfast**: Up to 20% per stat faction bonuses

## 🚀 Quick Start

### Requirements
- **Node.js** ≥16
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/dv1sual/torn-gym-analyzer.git
cd torn-gym-analyzer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5174`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Quick How To

### **Basic Usage (30 seconds)**
1. **Enter your stats** (STR, DEF, SPD, DEX) - use commas for big numbers
2. **Set your happy and energy** - current levels you have
3. **Click "🔥 Compute Maximum Gains 🔥"**
4. **Check Results tab** - see which gym is best for you

### **Auto-Fill Setup (Optional)**
1. **Get API key**: Go to [Torn Preferences → API](https://www.torn.com/preferences.php#tab=api)
2. **Settings tab**: Paste your API key
3. **Click "🔄 Auto-Fill"**: Automatically fills your stats/happy/energy

### **Common Questions**
- **Bonuses**: Enter percentages (e.g., "15" for 15% bonus)
- **Energy Allocation**: Set how much energy goes to each stat (default is equal split)
- **Results**: Green gym = best choice, numbers show total stat gains
- **Mobile**: All buttons work the same, just smaller layout

**That's it!** Everything else is optional extras for advanced users.

## 🧪 Testing

The project includes comprehensive unit tests for all components and calculations:

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Current Test Coverage**: 87 tests across 17 test files (100% passing)

### Test Categories
- **Calculation Tests**: Verify formula accuracy against spreadsheet
- **Component Tests**: UI component behavior and rendering
- **Hook Tests**: Custom hook functionality and state management
- **Integration Tests**: API integration and data flow

## 🏗️ Architecture

### **Modern React Architecture**
```
src/
├── components/          # Reusable UI components
│   ├── __tests__/      # Component unit tests
│   └── charts/         # Data visualization components
├── hooks/              # Custom React hooks
│   ├── __tests__/      # Hook unit tests
│   ├── useGymCalculator.ts    # Main business logic
│   ├── useApiContext.tsx      # API integration
│   ├── useLocalStorage.ts     # Persistent storage
│   └── useResponsive.ts       # Responsive design
├── services/           # External service integrations
├── utils/              # Calculation utilities
│   └── __tests__/      # Calculation tests
├── types/              # TypeScript type definitions
└── data/               # Static data (gym information)
```

### **Key Technologies**
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Vitest**: Fast unit testing framework
- **Axios**: HTTP client for API integration

## 🔧 Technical Features

### **Performance Optimizations**
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Responsive Design**: Optimized for all screen sizes
- **Local Storage**: Persistent user preferences

### **Error Handling**
- **Error Boundaries**: Graceful error recovery
- **API Fallbacks**: Manual input when API unavailable
- **Validation**: Input validation and sanitization
- **User Feedback**: Clear error messages and notifications

### **Mobile Optimization**
- **Touch-Friendly**: Optimized button sizes and spacing
- **Compact Layout**: Efficient use of screen space
- **Fast Loading**: Optimized bundle size
- **Offline Support**: Works without internet connection

## 🎯 Formula Accuracy

This calculator implements the **Vladar Formula** with precision:

### **Core Calculation**
```
Gain = (Energy × GymDots × Multipliers × CoreFormula) / 200,000
```

### **Core Formula Components**
- **S**: Effective stat (with stat cap applied)
- **Happy Multiplier**: `ln(1 + happy/250)` 
- **Stat Constants**: A and B values per stat type
- **Gym Multipliers**: Property, education, job, book, and faction bonuses

### **Stat Cap Implementation**
For stats above 50M, the effective stat is calculated as:
```
S = 50,000,000 + (baseStat - 50,000,000) / (3.8115 × ln(baseStat))
```

### **Validation**
- Calculations match the authoritative spreadsheet exactly
- Comprehensive test suite prevents regression
- Regular validation against known training results

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### **Code Standards**
- **TypeScript**: Full type coverage required
- **Testing**: Unit tests for all new features
- **Documentation**: Update README for new features
- **Formatting**: Consistent code style

## 📝 Changelog

### **v1.0.0** - Current Release
- ✅ Complete refactoring from monolithic to modular architecture
- ✅ Torn API integration with auto-fill capabilities
- ✅ Comprehensive unit testing (87 tests, 100% passing)
- ✅ Mobile UI optimization for iPhone and Android
- ✅ Training history and progress tracking
- ✅ Critical calculation formula fixes for accuracy
- ✅ Enhanced error handling and user feedback
- ✅ Responsive design for all screen sizes

### **Recent Updates**
- **Mobile UI Fixes**: Optimized for iPhone with compact layouts
- **API Integration**: Full Torn API support with secure key management
- **Testing Suite**: Comprehensive test coverage for reliability
- **Performance**: Optimized calculations and rendering
- **Accessibility**: Improved tooltips and user guidance

## 🙏 Credits

This project wouldn't be possible without:

- **[Vladar[1996140]](https://www.torn.com/profiles.php?XID=1996140)** - Creator of the authoritative training formula
- **[Training Gains Explained 2.0](https://www.torn.com/forums.php#/p=threads&f=61&t=16182535&b=0&a=0)** - Comprehensive training mechanics guide
- **[Same_Sura[2157732]](https://www.torn.com/profiles.php?XID=2157732)** - Extensive testing and validation
- **Torn Community** - Feedback and feature suggestions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [Torn Gym Analyzer](https://your-demo-url.com)
- **GitHub**: [dv1sual/torn-gym-analyzer](https://github.com/dv1sual/torn-gym-analyzer)
- **Torn Profile**: [dv1sual[3616352]](https://www.torn.com/profiles.php?XID=3616352)
- **Bug Reports**: [GitHub Issues](https://github.com/dv1sual/torn-gym-analyzer/issues)

---

**Made with ❤️ for the Torn Community**

*Calculate smarter, train harder, dominate the gyms!* 🏋️‍♂️
