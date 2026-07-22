import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // 로컬 개발용 CORS 우회 프록시.
    // 브라우저는 같은 주소(localhost:3000)의 /api 로 요청 → Vite가 실제 배포 서버로 대신 전달.
    // (배포 서버는 CORS에 localhost가 없어서 브라우저 직접 호출은 막힘. dev 전용이며 운영 빌드엔 영향 없음)
    proxy: {
      '/api': {
        target: 'https://api.wish-connect.com', // .env의 VITE_API_BASE_URL 호스트와 동일
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          // 서버 CORS 필터가 localhost origin을 403(Invalid CORS request)으로 막으므로,
          // 프록시에서 Origin 헤더를 떼고 보내 서버가 non-CORS 요청으로 정상 처리하게 함.
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
          });
        },
      },
    },
  },
});
