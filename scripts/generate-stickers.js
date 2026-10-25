const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'stickers');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 각 스티커별 SVG 코드 정의 (256x256 ViewBox, Transparent Background, Shadow & Outline)
const stickers = [
  // ================= 공용 3종 =================
  {
    filename: 'common-sparkle.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="40%" stop-color="#FDE047"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#F59E0B" flood-opacity="0.6"/>
        </filter>
      </defs>
      <g filter="url(#glow)">
        <!-- 큰 반짝이 -->
        <path d="M128 20 C128 80 148 108 208 128 C148 148 128 176 128 236 C128 176 108 148 48 128 C108 108 128 80 128 20 Z" fill="url(#sparkleGrad)" stroke="#B45309" stroke-width="4"/>
        <!-- 작은 반짝이 1 -->
        <path d="M190 35 C190 60 198 72 225 80 C198 88 190 100 190 125 C190 100 182 88 155 80 C182 72 190 60 190 35 Z" fill="#FDE047" stroke="#B45309" stroke-width="3"/>
        <!-- 작은 반짝이 2 -->
        <path d="M60 170 C60 185 66 195 82 200 C66 205 60 215 60 230 C60 215 54 205 38 200 C54 195 60 185 60 170 Z" fill="#FDE047" stroke="#B45309" stroke-width="3"/>
      </g>
    </svg>`
  },
  {
    filename: 'common-heart-duo.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <linearGradient id="heartGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FB7185"/>
          <stop offset="100%" stop-color="#E11D48"/>
        </linearGradient>
        <linearGradient id="heartGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F472B6"/>
          <stop offset="100%" stop-color="#DB2777"/>
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#881337" flood-opacity="0.3"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- 메인 하트 -->
        <path d="M100 70 C70 30 15 50 15 105 C15 155 85 195 100 215 C115 195 185 155 185 105 C185 50 130 30 100 70 Z" fill="url(#heartGrad1)" stroke="#881337" stroke-width="6"/>
        <!-- 하이라이트 -->
        <path d="M40 85 C40 65 60 55 75 65" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none"/>
        <!-- 서브 핑크 하트 -->
        <path d="M185 50 C165 20 130 35 130 70 C130 105 175 135 185 148 C195 135 240 105 240 70 C240 35 205 20 185 50 Z" fill="url(#heartGrad2)" stroke="#831843" stroke-width="5"/>
        <path d="M150 55 C150 45 160 40 170 45" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>
      </g>
    </svg>`
  },
  {
    filename: 'common-crown.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FDE047"/>
          <stop offset="60%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#D97706"/>
        </linearGradient>
        <filter id="crownShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#78350F" flood-opacity="0.35"/>
        </filter>
      </defs>
      <g filter="url(#crownShadow)">
        <polygon points="30,190 226,190 216,90 168,140 128,60 88,140 40,90" fill="url(#crownGrad)" stroke="#78350F" stroke-width="6" stroke-linejoin="round"/>
        <!-- 보석들 -->
        <circle cx="128" cy="55" r="14" fill="#EF4444" stroke="#78350F" stroke-width="4"/>
        <circle cx="40" cy="85" r="12" fill="#3B82F6" stroke="#78350F" stroke-width="4"/>
        <circle cx="216" cy="85" r="12" fill="#10B981" stroke="#78350F" stroke-width="4"/>
        <circle cx="128" cy="155" r="10" fill="#EC4899" stroke="#78350F" stroke-width="3"/>
        <circle cx="85" cy="165" r="8" fill="#3B82F6" stroke="#78350F" stroke-width="3"/>
        <circle cx="171" cy="165" r="8" fill="#10B981" stroke="#78350F" stroke-width="3"/>
        <rect x="25" y="190" width="206" height="20" rx="10" fill="#B45309" stroke="#78350F" stroke-width="4"/>
      </g>
    </svg>`
  },

  // ================= culture-1 (0원 코스프레) =================
  {
    filename: 'c1-sunglasses.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <filter id="glassShadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.4"/></filter>
      </defs>
      <g filter="url(#glassShadow)">
        <!-- 픽셀 힙스터 선글라스 -->
        <path d="M20 95 L115 95 L115 155 L40 155 L40 135 L20 135 Z" fill="#0F172A" stroke="#FFFFFF" stroke-width="5"/>
        <path d="M141 95 L236 95 L236 135 L216 135 L216 155 L141 155 Z" fill="#0F172A" stroke="#FFFFFF" stroke-width="5"/>
        <rect x="115" y="105" width="26" height="15" fill="#0F172A" stroke="#FFFFFF" stroke-width="4"/>
        <!-- 렌즈 화이트 하이라이트 픽셀 -->
        <rect x="35" y="105" width="20" height="15" fill="#FFFFFF"/>
        <rect x="55" y="120" width="15" height="15" fill="#FFFFFF"/>
        <rect x="155" y="105" width="20" height="15" fill="#FFFFFF"/>
        <rect x="175" y="120" width="15" height="15" fill="#FFFFFF"/>
      </g>
    </svg>`
  },
  {
    filename: 'c1-fire.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#DC2626"/>
          <stop offset="50%" stop-color="#EA580C"/>
          <stop offset="100%" stop-color="#FDE047"/>
        </linearGradient>
        <filter id="fireShadow"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#DC2626" flood-opacity="0.5"/></filter>
      </defs>
      <g filter="url(#fireShadow)">
        <path d="M128 15 C135 70 185 85 185 130 C185 175 145 235 128 240 C111 235 71 175 71 130 C71 85 121 70 128 15 Z" fill="url(#fireGrad)" stroke="#991B1B" stroke-width="5"/>
        <path d="M128 85 C145 115 160 135 160 160 C160 190 140 220 128 225 C116 220 96 190 96 160 C96 135 111 115 128 85 Z" fill="#FEF08A"/>
      </g>
    </svg>`
  },

  // ================= culture-2 (보스 레이드) =================
  {
    filename: 'c2-sword-shield.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <filter id="shieldShadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/></filter>
      </defs>
      <g filter="url(#shieldShadow)">
        <!-- 방패 -->
        <path d="M128 40 C175 40 205 55 205 110 C205 180 145 220 128 230 C111 220 51 180 51 110 C51 55 81 40 128 40 Z" fill="#2563EB" stroke="#1E293B" stroke-width="6"/>
        <path d="M128 55 C165 55 190 68 190 110 C190 170 142 205 128 215 C114 205 66 170 66 110 C66 68 91 55 128 55 Z" fill="#3B82F6"/>
        <polygon points="128,75 145,120 190,120 155,145 170,190 128,160 86,190 101,145 66,120 111,120" fill="#FDE047" stroke="#B45309" stroke-width="3"/>
      </g>
    </svg>`
  },
  {
    filename: 'c2-hp-full.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <filter id="pixelShadow"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity="0.4"/></filter>
      </defs>
      <g filter="url(#pixelShadow)">
        <!-- 픽셀 하트 3개 나열 -->
        <g transform="translate(18, 90) scale(0.65)">
          <path d="M40 10 L80 10 L80 30 L100 30 L100 70 L80 70 L80 90 L60 90 L60 110 L40 110 L40 90 L20 90 L20 70 L0 70 L0 30 L20 30 L20 10 L40 10 Z" fill="#EF4444" stroke="#991B1B" stroke-width="6"/>
          <rect x="20" y="30" width="20" height="20" fill="#FFFFFF"/>
        </g>
        <g transform="translate(88, 75) scale(0.85)">
          <path d="M40 10 L80 10 L80 30 L100 30 L100 70 L80 70 L80 90 L60 90 L60 110 L40 110 L40 90 L20 90 L20 70 L0 70 L0 30 L20 30 L20 10 L40 10 Z" fill="#EF4444" stroke="#991B1B" stroke-width="6"/>
          <rect x="20" y="30" width="20" height="20" fill="#FFFFFF"/>
        </g>
        <g transform="translate(178, 90) scale(0.65)">
          <path d="M40 10 L80 10 L80 30 L100 30 L100 70 L80 70 L80 90 L60 90 L60 110 L40 110 L40 90 L20 90 L20 70 L0 70 L0 30 L20 30 L20 10 L40 10 Z" fill="#EF4444" stroke="#991B1B" stroke-width="6"/>
          <rect x="20" y="30" width="20" height="20" fill="#FFFFFF"/>
        </g>
      </g>
    </svg>`
  },

  // ================= culture-3 (베프 사진전) =================
  {
    filename: 'c3-friend-ribbon.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <filter id="ribbonShadow"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3"/></filter>
      </defs>
      <g filter="url(#ribbonShadow)">
        <!-- 핑크 리본 -->
        <path d="M128 115 C100 60 30 50 40 115 C45 150 110 130 128 120 Z" fill="#F43F5E" stroke="#9F1239" stroke-width="5"/>
        <path d="M128 115 C156 60 226 50 216 115 C211 150 146 130 128 120 Z" fill="#F43F5E" stroke="#9F1239" stroke-width="5"/>
        <!-- 리본 꼬리 -->
        <polygon points="128,125 90,210 115,200 135,220" fill="#E11D48" stroke="#9F1239" stroke-width="4"/>
        <polygon points="128,125 166,210 141,200 121,220" fill="#E11D48" stroke="#9F1239" stroke-width="4"/>
        <!-- 리본 매듭 -->
        <circle cx="128" cy="120" r="18" fill="#FDA4AF" stroke="#9F1239" stroke-width="5"/>
      </g>
    </svg>`
  },
  {
    filename: 'c3-clover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <filter id="cloverShadow"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3"/></filter>
      </defs>
      <g filter="url(#cloverShadow)">
        <!-- 네잎클로버 -->
        <path d="M128 128 C100 80 80 50 128 40 C176 50 156 80 128 128 Z" fill="#22C55E" stroke="#15803D" stroke-width="5"/>
        <path d="M128 128 C176 100 206 80 216 128 C206 176 176 156 128 128 Z" fill="#16A34A" stroke="#15803D" stroke-width="5"/>
        <path d="M128 128 C156 176 176 206 128 216 C80 206 100 176 128 128 Z" fill="#22C55E" stroke="#15803D" stroke-width="5"/>
        <path d="M128 128 C80 156 50 176 40 128 C50 80 80 100 128 128 Z" fill="#16A34A" stroke="#15803D" stroke-width="5"/>
        <!-- 줄기 -->
        <path d="M128 128 Q140 190 160 225" stroke="#15803D" stroke-width="6" stroke-linecap="round" fill="none"/>
        <circle cx="128" cy="128" r="8" fill="#FDE047"/>
      </g>
    </svg>`
  },

  // ================= culture-4 (청소 비포&애프터) =================
  {
    filename: 'c4-clean-bubble.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <radialGradient id="bubbleGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#38BDF8" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#0284C7" stop-opacity="0.8"/>
        </radialGradient>
      </defs>
      <!-- 큰 거품 -->
      <circle cx="110" cy="130" r="75" fill="url(#bubbleGrad)" stroke="#E0F2FE" stroke-width="4"/>
      <ellipse cx="85" cy="95" rx="20" ry="12" fill="#FFFFFF" transform="rotate(-30, 85, 95)"/>
      <!-- 보조 거품 -->
      <circle cx="185" cy="80" r="38" fill="url(#bubbleGrad)" stroke="#E0F2FE" stroke-width="3"/>
      <ellipse cx="170" cy="65" rx="10" ry="6" fill="#FFFFFF" transform="rotate(-30, 170, 65)"/>
      <circle cx="195" cy="170" r="25" fill="url(#bubbleGrad)" stroke="#E0F2FE" stroke-width="2"/>
    </svg>`
  },
  {
    filename: 'c4-sparkle-broom.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <g>
        <!-- 빗자루 손잡이 -->
        <line x1="200" y1="50" x2="100" y2="150" stroke="#78350F" stroke-width="12" stroke-linecap="round"/>
        <!-- 빗자루 털 -->
        <polygon points="100,150 50,180 60,225 110,215 120,170" fill="#F59E0B" stroke="#B45309" stroke-width="5" stroke-linejoin="round"/>
        <line x1="75" y1="185" x2="80" y2="220" stroke="#B45309" stroke-width="3"/>
        <line x1="95" y1="175" x2="98" y2="215" stroke="#B45309" stroke-width="3"/>
        <!-- 청소 별빛 -->
        <polygon points="50,120 55,135 70,140 55,145 50,160 45,145 30,140 45,135" fill="#38BDF8"/>
        <polygon points="170,170 174,180 185,185 174,190 170,200 166,190 155,185 166,180" fill="#FDE047"/>
      </g>
    </svg>`
  },

  // ================= culture-5 (숨은 명소 찾기) =================
  {
    filename: 'c5-compass.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 나침반 -->
      <circle cx="128" cy="128" r="95" fill="#FEF3C7" stroke="#92400E" stroke-width="8"/>
      <circle cx="128" cy="128" r="80" fill="#FFFBEB" stroke="#D97706" stroke-width="3" stroke-dasharray="6,4"/>
      <!-- N S E W 글자 -->
      <text x="128" y="70" font-family="sans-serif" font-weight="900" font-size="20" fill="#DC2626" text-anchor="middle">N</text>
      <text x="128" y="200" font-family="sans-serif" font-weight="900" font-size="18" fill="#1E293B" text-anchor="middle">S</text>
      <!-- 바늘 -->
      <polygon points="128,68 142,128 114,128" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <polygon points="128,188 142,128 114,128" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
      <circle cx="128" cy="128" r="10" fill="#F59E0B" stroke="#92400E" stroke-width="3"/>
    </svg>`
  },
  {
    filename: 'c5-magnifier.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E0F2FE" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      <!-- 손잡이 -->
      <line x1="150" y1="150" x2="225" y2="225" stroke="#78350F" stroke-width="22" stroke-linecap="round"/>
      <line x1="150" y1="150" x2="225" y2="225" stroke="#F59E0B" stroke-width="14" stroke-linecap="round"/>
      <!-- 렌즈 테두리 -->
      <circle cx="100" cy="100" r="70" fill="url(#lensGrad)" stroke="#1E293B" stroke-width="12"/>
      <circle cx="100" cy="100" r="62" fill="none" stroke="#FDE047" stroke-width="4"/>
      <!-- 반사광 -->
      <path d="M55 85 C55 60 75 45 100 45" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none"/>
    </svg>`
  },

  // ================= culture-6 (급식 리뷰왕) =================
  {
    filename: 'c6-chef-hat.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 요리사 모자 -->
      <path d="M70 160 C40 160 30 110 65 95 C60 60 110 40 128 70 C146 40 196 60 191 95 C226 110 216 160 186 160 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="8" stroke-linejoin="round"/>
      <rect x="70" y="160" width="116" height="40" rx="8" fill="#EA580C" stroke="#0F172A" stroke-width="8"/>
      <!-- 별 3개 -->
      <polygon points="100,180 103,186 110,187 105,191 106,197 100,194 94,197 95,191 90,187 97,186" fill="#FDE047"/>
      <polygon points="128,180 131,186 138,187 133,191 134,197 128,194 122,197 123,191 118,187 125,186" fill="#FDE047"/>
      <polygon points="156,180 159,186 166,187 161,191 162,197 156,194 150,197 151,191 146,187 153,186" fill="#FDE047"/>
    </svg>`
  },
  {
    filename: 'c6-yummy.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 밥공기 -->
      <path d="M40 120 C40 185 80 205 128 205 C176 205 216 185 216 120 Z" fill="#F97316" stroke="#9A3412" stroke-width="8"/>
      <!-- 소복한 밥 -->
      <path d="M40 120 C40 60 216 60 216 120 Z" fill="#FFFFFF" stroke="#9A3412" stroke-width="8"/>
      <!-- 김 솔솔 -->
      <path d="M90 40 Q80 25 90 10" stroke="#FB923C" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M128 35 Q118 20 128 5" stroke="#FB923C" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M166 40 Q156 25 166 10" stroke="#FB923C" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- 받침대 -->
      <rect x="95" y="205" width="66" height="15" rx="5" fill="#9A3412"/>
    </svg>`
  },

  // ================= culture-7 (학생 모델 포스터) =================
  {
    filename: 'c7-camera-flash.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 빈티지 카메라 -->
      <rect x="35" y="75" width="186" height="135" rx="20" fill="#0F172A" stroke="#FFFFFF" stroke-width="6"/>
      <rect x="80" y="50" width="50" height="25" rx="6" fill="#E2E8F0" stroke="#0F172A" stroke-width="4"/>
      <!-- 플래시 렌즈 팝 -->
      <circle cx="128" cy="142" r="48" fill="#E2E8F0" stroke="#38BDF8" stroke-width="8"/>
      <circle cx="128" cy="142" r="28" fill="#0284C7"/>
      <!-- 찰칵 플래시 빛 -->
      <polygon points="190,40 195,55 210,58 197,66 200,80 188,72 176,80 179,66 166,58 181,55" fill="#FDE047"/>
    </svg>`
  },
  {
    filename: 'c7-bar-code.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 하이틴 매거진 바코드 스티커 -->
      <rect x="25" y="65" width="206" height="126" rx="12" fill="#FFFFFF" stroke="#0F172A" stroke-width="6"/>
      <!-- 바코드 라인들 -->
      <line x1="45" y1="85" x2="45" y2="155" stroke="#0F172A" stroke-width="8"/>
      <line x1="62" y1="85" x2="62" y2="155" stroke="#0F172A" stroke-width="4"/>
      <line x1="75" y1="85" x2="75" y2="155" stroke="#0F172A" stroke-width="12"/>
      <line x1="98" y1="85" x2="98" y2="155" stroke="#0F172A" stroke-width="6"/>
      <line x1="115" y1="85" x2="115" y2="155" stroke="#0F172A" stroke-width="4"/>
      <line x1="130" y1="85" x2="130" y2="155" stroke="#0F172A" stroke-width="14"/>
      <line x1="155" y1="85" x2="155" y2="155" stroke="#0F172A" stroke-width="6"/>
      <line x1="172" y1="85" x2="172" y2="155" stroke="#0F172A" stroke-width="10"/>
      <line x1="195" y1="85" x2="195" y2="155" stroke="#0F172A" stroke-width="6"/>
      <line x1="210" y1="85" x2="210" y2="155" stroke="#0F172A" stroke-width="4"/>
      <text x="128" y="178" font-family="monospace" font-weight="bold" font-size="14" fill="#0F172A" text-anchor="middle">SCHOOL-VOGUE-2026</text>
    </svg>`
  },

  // ================= culture-8 (도플갱어 데칼코마니) =================
  {
    filename: 'c8-mirror-twin.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 쌍둥이 가면 미러 -->
      <g transform="translate(30, 70)">
        <path d="M45 10 C15 10 0 45 0 80 C0 115 25 130 45 130 C65 130 90 115 90 80 C90 45 75 10 45 10 Z" fill="#38BDF8" stroke="#0369A1" stroke-width="5"/>
        <circle cx="30" cy="65" r="8" fill="#FFFFFF"/>
        <circle cx="60" cy="65" r="8" fill="#FFFFFF"/>
      </g>
      <g transform="translate(136, 70)">
        <path d="M45 10 C15 10 0 45 0 80 C0 115 25 130 45 130 C65 130 90 115 90 80 C90 45 75 10 45 10 Z" fill="#F43F5E" stroke="#9F1239" stroke-width="5"/>
        <circle cx="30" cy="65" r="8" fill="#FFFFFF"/>
        <circle cx="60" cy="65" r="8" fill="#FFFFFF"/>
      </g>
      <line x1="128" y1="50" x2="128" y2="210" stroke="#F59E0B" stroke-width="6" stroke-dasharray="8,6"/>
    </svg>`
  },
  {
    filename: 'c8-ctrl-cv.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 복붙 스탬프 도장 -->
      <rect x="35" y="75" width="85" height="105" rx="12" fill="#E0F2FE" stroke="#0284C7" stroke-width="6"/>
      <text x="77" y="140" font-family="sans-serif" font-weight="900" font-size="28" fill="#0369A1" text-anchor="middle">Ctrl C</text>
      <rect x="135" y="75" width="85" height="105" rx="12" fill="#FEF3C7" stroke="#D97706" stroke-width="6"/>
      <text x="177" y="140" font-family="sans-serif" font-weight="900" font-size="28" fill="#B45309" text-anchor="middle">Ctrl V</text>
    </svg>`
  },

  // ================= culture-9 (가족 효도) =================
  {
    filename: 'c9-carnation.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 붉은 카네이션 -->
      <g>
        <path d="M128 50 C110 30 70 40 85 80 C60 70 50 110 80 120 C50 135 70 170 110 160 C128 175 146 160 146 160 C186 170 206 135 176 120 C206 110 196 70 171 80 C186 40 146 30 128 50 Z" fill="#E11D48" stroke="#881337" stroke-width="6"/>
        <path d="M128 75 C115 65 95 70 100 90 C85 85 80 105 100 110 C85 120 100 140 120 135 C128 145 138 135 138 135 C158 140 170 120 155 110 C175 105 170 85 155 90 C160 70 140 65 128 75 Z" fill="#FB7185"/>
        <!-- 녹색 꽃받침과 줄기 -->
        <polygon points="128,160 110,185 146,185" fill="#15803D" stroke="#14532D" stroke-width="4"/>
        <path d="M128 185 Q130 220 140 235" stroke="#15803D" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>
    </svg>`
  },
  {
    filename: 'c9-warm-hug.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 따뜻한 감동 하트 & 손길 -->
      <path d="M128 60 C105 25 45 40 45 95 C45 150 115 195 128 210 C141 195 211 150 211 95 C211 40 151 25 128 60 Z" fill="#F43F5E" stroke="#881337" stroke-width="7"/>
      <circle cx="100" cy="110" r="16" fill="#FDE047"/>
      <circle cx="156" cy="110" r="16" fill="#FDE047"/>
      <path d="M100 145 Q128 170 156 145" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" fill="none"/>
    </svg>`
  },

  // ================= culture-10 (교내 인플루언서) =================
  {
    filename: 'c10-verified-badge.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 인스타그램 파란색 공식 인증 뱃지 -->
      <path d="M128 25 L155 45 L188 40 L203 70 L233 83 L233 116 L250 143 L233 170 L233 203 L203 216 L188 246 L155 241 L128 261 L101 241 L68 246 L53 216 L23 203 L23 170 L6 143 L23 116 L23 83 L53 70 L68 40 L101 45 Z" transform="scale(0.85) translate(22, 10)" fill="#0284C7" stroke="#FFFFFF" stroke-width="6"/>
      <!-- 체크 표시 -->
      <path d="M90 130 L115 155 L170 100" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`
  },
  {
    filename: 'c10-like-heart.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 인스타 좋아요 말풍선 -->
      <path d="M40 50 L216 50 C230 50 240 60 240 75 L240 175 C240 190 230 200 216 200 L140 200 L115 235 L105 200 L40 200 C25 200 15 190 15 175 L15 75 C15 60 25 50 40 50 Z" fill="#EF4444" stroke="#991B1B" stroke-width="6"/>
      <!-- 하트 -->
      <path d="M128 90 C116 70 85 75 85 105 C85 135 120 160 128 170 C136 160 171 135 171 105 C171 75 140 70 128 90 Z" fill="#FFFFFF"/>
    </svg>`
  },

  // ================= culture-11 (국립미술관 도록) =================
  {
    filename: 'c11-gold-seal.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 미술관 공식 골드 인장 -->
      <circle cx="128" cy="128" r="95" fill="#F59E0B" stroke="#78350F" stroke-width="8"/>
      <circle cx="128" cy="128" r="82" fill="#FDE047" stroke="#B45309" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="128,65 142,105 185,105 150,130 165,170 128,145 91,170 106,130 71,105 114,105" fill="#EA580C"/>
      <text x="128" y="200" font-family="serif" font-weight="bold" font-size="16" fill="#78350F" text-anchor="middle">EXHIBITION 2026</text>
    </svg>`
  },
  {
    filename: 'c11-artist-palette.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 팔레트와 붓 -->
      <path d="M60 160 C30 110 60 50 128 50 C196 50 226 100 206 150 C186 200 130 210 110 190 C90 170 80 180 60 160 Z" fill="#FBBF24" stroke="#78350F" stroke-width="7"/>
      <!-- 물감 방울들 -->
      <circle cx="95" cy="85" r="14" fill="#EF4444"/>
      <circle cx="135" cy="75" r="14" fill="#3B82F6"/>
      <circle cx="175" cy="95" r="14" fill="#10B981"/>
      <circle cx="185" cy="140" r="14" fill="#8B5CF6"/>
      <circle cx="135" cy="180" r="16" fill="#FFFBEB" stroke="#78350F" stroke-width="4"/>
    </svg>`
  },

  // ================= culture-12 (원근법 트릭아트) =================
  {
    filename: 'c12-magic-portal.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 차원 이동 마법 포털 -->
      <ellipse cx="128" cy="128" rx="100" ry="80" fill="none" stroke="#8B5CF6" stroke-width="12" stroke-dasharray="25,15"/>
      <ellipse cx="128" cy="128" rx="75" ry="60" fill="none" stroke="#EC4899" stroke-width="10" stroke-dasharray="20,10"/>
      <ellipse cx="128" cy="128" rx="45" ry="35" fill="#FDE047" stroke="#3B82F6" stroke-width="8"/>
      <polygon points="128,105 134,120 150,128 134,136 128,151 122,136 106,128 122,120" fill="#FFFFFF"/>
    </svg>`
  },
  {
    filename: 'c12-pinch-fingers.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 원근법 핀치 제스처 손가락 -->
      <path d="M60 180 C60 140 100 110 135 110 C150 110 160 100 160 85 C160 70 145 60 120 60 C80 60 50 100 50 180 Z" fill="#FED7AA" stroke="#9A3412" stroke-width="6"/>
      <path d="M135 110 C160 110 190 125 190 145 C190 165 170 180 130 180 Z" fill="#FDBA74" stroke="#9A3412" stroke-width="6"/>
      <text x="175" y="90" font-family="sans-serif" font-weight="900" font-size="28" fill="#EA580C">👌</text>
    </svg>`
  },

  // ================= subject-1 (과학 식물도감) =================
  {
    filename: 's1-fresh-sprout.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 싱그러운 파릇파릇 새싹 -->
      <path d="M128 220 Q128 140 100 110 C65 110 40 140 70 170 C100 185 125 180 128 220 Z" fill="#22C55E" stroke="#14532D" stroke-width="6"/>
      <path d="M128 160 Q150 110 195 105 C220 135 195 170 155 170 Q135 170 128 220 Z" fill="#4ADE80" stroke="#14532D" stroke-width="6"/>
      <path d="M128 220 L128 140" stroke="#15803D" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="128" cy="225" rx="40" ry="12" fill="#78350F"/>
    </svg>`
  },
  {
    filename: 's1-butterfly.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 노랑나비 -->
      <g>
        <path d="M128 135 C110 60 40 40 35 100 C30 140 90 150 128 140 Z" fill="#FDE047" stroke="#B45309" stroke-width="5"/>
        <path d="M128 140 C100 155 50 170 65 210 C85 230 120 185 128 150 Z" fill="#F59E0B" stroke="#B45309" stroke-width="4"/>
        <path d="M128 135 C146 60 216 40 221 100 C226 140 166 150 128 140 Z" fill="#FDE047" stroke="#B45309" stroke-width="5"/>
        <path d="M128 140 C156 155 206 170 191 210 C171 230 136 185 128 150 Z" fill="#F59E0B" stroke="#B45309" stroke-width="4"/>
        <ellipse cx="128" cy="140" rx="8" ry="30" fill="#78350F"/>
      </g>
    </svg>`
  },

  // ================= subject-2 (사회 역사 탐방) =================
  {
    filename: 's2-korean-flag.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 태극 엠블럼 -->
      <circle cx="128" cy="128" r="95" fill="#FFFFFF" stroke="#0F172A" stroke-width="8"/>
      <!-- 태극 문양 -->
      <path d="M128 50 A40 40 0 0 1 128 130 A40 40 0 0 0 128 210 A80 80 0 0 1 128 50 Z" fill="#EF4444"/>
      <path d="M128 50 A80 80 0 0 0 128 210 A40 40 0 0 1 128 130 A40 40 0 0 0 128 50 Z" fill="#2563EB"/>
    </svg>`
  },
  {
    filename: 's2-scroll.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 조선 왕실 두루마리 교지 -->
      <rect x="50" y="60" width="156" height="136" rx="8" fill="#FEF3C7" stroke="#78350F" stroke-width="6"/>
      <rect x="35" y="48" width="25" height="160" rx="10" fill="#D97706" stroke="#78350F" stroke-width="5"/>
      <rect x="196" y="48" width="25" height="160" rx="10" fill="#D97706" stroke="#78350F" stroke-width="5"/>
      <rect x="105" y="95" width="46" height="46" fill="#DC2626"/>
      <text x="128" y="127" font-family="serif" font-weight="bold" font-size="24" fill="#FEF3C7" text-anchor="middle">史</text>
    </svg>`
  },

  // ================= subject-3 (수학 도형 패턴) =================
  {
    filename: 's3-golden-ratio.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 황금비율 피보나치 나선 -->
      <rect x="35" y="35" width="186" height="186" rx="16" fill="#1E1B4B" stroke="#6366F1" stroke-width="6"/>
      <path d="M35 221 A186 186 0 0 1 221 35 A115 115 0 0 1 106 150 A71 71 0 0 1 177 221" stroke="#38BDF8" stroke-width="8" stroke-linecap="round" fill="none"/>
      <text x="128" y="135" font-family="sans-serif" font-weight="900" font-size="42" fill="#FDE047" text-anchor="middle">φ</text>
    </svg>`
  },
  {
    filename: 's3-geometry-cube.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 3차원 네온 큐브 -->
      <g stroke="#0F172A" stroke-width="6" stroke-linejoin="round">
        <polygon points="128,40 208,85 128,130 48,85" fill="#818CF8"/>
        <polygon points="48,85 128,130 128,220 48,175" fill="#4F46E5"/>
        <polygon points="208,85 128,130 128,220 208,175" fill="#6366F1"/>
      </g>
    </svg>`
  },

  // ================= subject-4 (음악 악기 선율) =================
  {
    filename: 's4-music-notes.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 춤추는 무지개 음표 -->
      <path d="M85 160 L85 70 L195 45 L195 135" stroke="#9333EA" stroke-width="12" stroke-linecap="round" fill="none"/>
      <polygon points="85,70 195,45 195,75 85,100" fill="#C084FC"/>
      <ellipse cx="65" cy="165" rx="26" ry="20" fill="#EC4899" transform="rotate(-20, 65, 165)"/>
      <ellipse cx="175" cy="140" rx="26" ry="20" fill="#EC4899" transform="rotate(-20, 175, 140)"/>
    </svg>`
  },
  {
    filename: 's4-treble-clef.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 높은음자리표 -->
      <circle cx="128" cy="128" r="95" fill="#FDF4FF" stroke="#A855F7" stroke-width="8"/>
      <text x="128" y="185" font-family="serif" font-weight="900" font-size="160" fill="#9333EA" text-anchor="middle">𝄞</text>
    </svg>`
  },

  // ================= subject-5 (국어 원고지 문장) =================
  {
    filename: 's5-quill-pen.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 클래식 깃털 펜과 잉크 방울 -->
      <path d="M210 35 C160 50 110 120 70 205 L95 210 C125 165 170 110 210 35 Z" fill="#F59E0B" stroke="#78350F" stroke-width="5"/>
      <path d="M70 205 L50 230 L75 220 Z" fill="#0F172A"/>
      <circle cx="110" cy="225" r="10" fill="#0F172A"/>
    </svg>`
  },
  {
    filename: 's5-book-quote.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 감성 북마크 책갈피 -->
      <polygon points="70,40 186,40 186,215 128,175 70,215" fill="#10B981" stroke="#065F46" stroke-width="7" stroke-linejoin="round"/>
      <text x="128" y="115" font-family="serif" font-weight="bold" font-size="48" fill="#FFFFFF" text-anchor="middle">“ ”</text>
    </svg>`
  },

  // ================= subject-6 (체육 스포츠 스타) =================
  {
    filename: 's6-gold-medal.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 챔피언 골드 리본 메달 -->
      <!-- 리본 -->
      <polygon points="128,85 70,25 105,25 128,65" fill="#EF4444"/>
      <polygon points="128,85 186,25 151,25 128,65" fill="#2563EB"/>
      <!-- 골드 메달 -->
      <circle cx="128" cy="145" r="65" fill="#FDE047" stroke="#B45309" stroke-width="8"/>
      <circle cx="128" cy="145" r="50" fill="#F59E0B" stroke="#B45309" stroke-width="3"/>
      <text x="128" y="165" font-family="sans-serif" font-weight="900" font-size="52" fill="#78350F" text-anchor="middle">1</text>
    </svg>`
  },
  {
    filename: 's6-flame-trophy.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <!-- 열정의 불꽃 트로피 -->
      <path d="M70 70 C70 135 105 160 128 160 C151 160 186 135 186 70 Z" fill="#FDE047" stroke="#B45309" stroke-width="7"/>
      <!-- 손잡이 -->
      <path d="M70 85 C45 85 45 130 72 135" stroke="#B45309" stroke-width="7" fill="none"/>
      <path d="M186 85 C211 85 211 130 184 135" stroke="#B45309" stroke-width="7" fill="none"/>
      <!-- 받침대 -->
      <rect x="116" y="160" width="24" height="35" fill="#B45309"/>
      <rect x="85" y="195" width="86" height="25" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="5"/>
      <polygon points="128,90 133,103 146,105 136,114 139,127 128,120 117,127 120,114 110,105 123,103" fill="#EA580C"/>
    </svg>`
  }
];

stickers.forEach((s) => {
  const filePath = path.join(outDir, s.filename);
  fs.writeFileSync(filePath, s.svg.trim(), 'utf8');
  console.log('Created sticker:', s.filename);
});

console.log(`Successfully generated ${stickers.length} image stickers!`);
