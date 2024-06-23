import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'iotDetector',
  webDir: 'dist',
  plugins: {
    GoogleMaps: {
      apiKey: 'AIzaSyChpLVbwq3-Cqp5DvXqtkAcpyyubCNFNUg',
    },
  },
};

export default config;
