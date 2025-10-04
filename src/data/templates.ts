export interface Template {
  id: string;
  title: string;
  description: string;
  category: 'media' | 'sports' | 'video' | 'social' | 'utility' | 'crypto' | 'finance' | 'other';
  icon: string;
  prompt: string;
  features: string[];
  previewImage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const templateCategories = [
  { id: 'media', name: 'Media', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'from-blue-500 to-cyan-500' },
  { id: 'video', name: 'Video', icon: '🎬', color: 'from-purple-500 to-violet-500' },
  { id: 'social', name: 'Social', icon: '👥', color: 'from-green-500 to-emerald-500' },
  { id: 'utility', name: 'Utility', icon: '🔧', color: 'from-orange-500 to-amber-500' },
  { id: 'crypto', name: 'Crypto', icon: '₿', color: 'from-yellow-500 to-yellow-400' },
  { id: 'finance', name: 'Finance', icon: '💰', color: 'from-indigo-500 to-blue-500' },
  { id: 'other', name: 'Other', icon: '✨', color: 'from-slate-500 to-gray-500' },
] as const;

export const templates: Template[] = [
  // Media Templates
  {
    id: 'photo-gallery',
    title: 'Photo Gallery',
    description: 'Beautiful image gallery with lightbox and filtering',
    category: 'media',
    icon: '📸',
    difficulty: 'beginner',
    prompt: 'Create a responsive photo gallery app with image upload, grid layout, lightbox modal, and category filtering. Include smooth animations and modern design.',
    features: ['Image Upload', 'Grid Layout', 'Lightbox Modal', 'Category Filtering', 'Responsive Design'],
  },
  {
    id: 'music-player',
    title: 'Music Player',
    description: 'Streaming music player with playlists and controls',
    category: 'media',
    icon: '🎵',
    difficulty: 'intermediate',
    prompt: 'Build a music streaming app with playlist management, audio controls, progress bar, shuffle/repeat modes, and beautiful waveform visualizations.',
    features: ['Audio Streaming', 'Playlist Management', 'Waveform Viz', 'Audio Controls', 'Queue System'],
  },
  {
    id: 'podcast-app',
    title: 'Podcast Player',
    description: 'Podcast streaming app with episodes and subscriptions',
    category: 'media',
    icon: '🎙️',
    difficulty: 'advanced',
    prompt: 'Create a podcast app with episode browsing, subscription management, offline downloads, playback speed controls, and show notes.',
    features: ['Episode Browse', 'Subscriptions', 'Offline Mode', 'Speed Control', 'Show Notes'],
  },

  // Sports Templates
  {
    id: 'sports-scores',
    title: 'Live Sports Scores',
    description: 'Real-time sports scores and team statistics',
    category: 'sports',
    icon: '📊',
    difficulty: 'intermediate',
    prompt: 'Build a live sports scores app with real-time updates, team statistics, match schedules, and interactive standings table.',
    features: ['Live Scores', 'Team Stats', 'Match Schedule', 'League Standings', 'Push Notifications'],
  },
  {
    id: 'fantasy-sports',
    title: 'Fantasy League',
    description: 'Fantasy sports league management platform',
    category: 'sports',
    icon: '🏆',
    difficulty: 'advanced',
    prompt: 'Create a fantasy sports league app with team management, player drafting, scoring system, league standings, and trade functionality.',
    features: ['Team Management', 'Player Draft', 'Scoring System', 'Trade System', 'League Chat'],
  },

  // Video Templates
  {
    id: 'video-streaming',
    title: 'Video Streaming',
    description: 'Video streaming platform with playlists and recommendations',
    category: 'video',
    icon: '📺',
    difficulty: 'advanced',
    prompt: 'Build a video streaming platform with video upload, playlist creation, recommendation engine, comments, and subscription system.',
    features: ['Video Upload', 'Playlists', 'Recommendations', 'Comments', 'Subscriptions'],
  },
  {
    id: 'video-editor',
    title: 'Video Editor',
    description: 'Browser-based video editing with timeline and effects',
    category: 'video',
    icon: '✂️',
    difficulty: 'advanced',
    prompt: 'Create a web-based video editor with timeline interface, video trimming, effects library, text overlays, and export functionality.',
    features: ['Timeline Editor', 'Video Trimming', 'Effects Library', 'Text Overlays', 'Export Options'],
  },

  // Social Templates
  {
    id: 'social-feed',
    title: 'Social Feed',
    description: 'Instagram-style social media feed with posts and interactions',
    category: 'social',
    icon: '📱',
    difficulty: 'intermediate',
    prompt: 'Build a social media feed app with photo/video posts, likes, comments, stories, direct messaging, and user profiles.',
    features: ['Photo/Video Posts', 'Like & Comments', 'Stories', 'Direct Messages', 'User Profiles'],
  },
  {
    id: 'community-forum',
    title: 'Community Forum',
    description: 'Discussion forum with threads, voting, and moderation',
    category: 'social',
    icon: '💬',
    difficulty: 'intermediate',
    prompt: 'Create a community forum with threaded discussions, upvoting/downvoting, user karma, moderation tools, and topic categories.',
    features: ['Threaded Discussions', 'Voting System', 'User Karma', 'Moderation', 'Categories'],
  },

  // Utility Templates
  {
    id: 'task-manager',
    title: 'Task Manager',
    description: 'Productivity app with projects, deadlines, and team collaboration',
    category: 'utility',
    icon: '✅',
    difficulty: 'beginner',
    prompt: 'Build a task management app with project organization, deadline tracking, team collaboration, priority levels, and progress visualization.',
    features: ['Project Organization', 'Deadline Tracking', 'Team Collaboration', 'Priority Levels', 'Progress Charts'],
  },
  {
    id: 'weather-app',
    title: 'Weather Dashboard',
    description: 'Weather forecast with maps, alerts, and location tracking',
    category: 'utility',
    icon: '🌤️',
    difficulty: 'beginner',
    prompt: 'Create a weather app with current conditions, 7-day forecast, weather maps, severe weather alerts, and location-based updates.',
    features: ['Current Weather', '7-Day Forecast', 'Weather Maps', 'Weather Alerts', 'Location Tracking'],
  },

  // Crypto Templates
  {
    id: 'crypto-tracker',
    title: 'Crypto Portfolio',
    description: 'Cryptocurrency portfolio tracker with real-time prices',
    category: 'crypto',
    icon: '📈',
    difficulty: 'intermediate',
    prompt: 'Build a crypto portfolio tracker with real-time price updates, portfolio analytics, profit/loss calculations, and market news.',
    features: ['Real-time Prices', 'Portfolio Analytics', 'P&L Tracking', 'Market News', 'Price Alerts'],
  },
  {
    id: 'nft-marketplace',
    title: 'NFT Marketplace',
    description: 'NFT trading platform with wallet integration',
    category: 'crypto',
    icon: '🖼️',
    difficulty: 'advanced',
    prompt: 'Create an NFT marketplace with wallet connection, NFT browsing, buying/selling, auction system, and collection management.',
    features: ['Wallet Integration', 'NFT Browse', 'Buy/Sell', 'Auction System', 'Collections'],
  },

  // Finance Templates
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    description: 'Personal finance management with budgets and analytics',
    category: 'finance',
    icon: '💳',
    difficulty: 'beginner',
    prompt: 'Build a personal expense tracker with budget creation, category-based spending, financial analytics, and goal setting.',
    features: ['Budget Creation', 'Expense Categories', 'Financial Analytics', 'Goal Setting', 'Receipt Scanning'],
  },
  {
    id: 'investment-dashboard',
    title: 'Investment Dashboard',
    description: 'Stock market portfolio with real-time data and analysis',
    category: 'finance',
    icon: '📊',
    difficulty: 'advanced',
    prompt: 'Create an investment dashboard with stock portfolio tracking, real-time market data, technical analysis charts, and investment research.',
    features: ['Portfolio Tracking', 'Real-time Data', 'Technical Charts', 'Investment Research', 'Risk Analysis'],
  },
];