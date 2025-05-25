import React from 'react';

interface IconProps {
  className?: string;
}

export const LogoIcon: React.FC<IconProps> = ({ className = "w-auto h-8" }) => (
  <svg 
    viewBox="0 0 609 224" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M74.5 41H0L99.3333 224H128.306L149 178.25L74.5 41Z" fill="currentColor"/>
    <rect x="75" y="41" width="25" height="9" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M178.681 0H182.321C182.321 24.1232 201.877 43.6791 226 43.68V47.32C201.877 47.321 182.321 66.8768 182.321 91L178.681 91C178.681 66.8762 159.124 47.32 135 47.32V43.68C159.124 43.68 178.681 24.1238 178.681 0Z" fill="currentColor"/>
    <path d="M536.779 45.4155V106.656H476.384V127.562C506.159 127.35 527.065 126.506 550.083 122.916L552.195 144.455C525.798 148.468 502.147 149.101 465.403 149.101H449.354V86.1718H509.96V66.7439H449.143V45.4155H536.779ZM604.143 32.7451V174.231H577.324V101.587H546.493V78.7807H577.324V32.7451H604.143ZM609 199.783V221.322H475.539V162.616H502.358V199.783H609Z" fill="currentColor"/>
    <path d="M415.988 32.5342V131.363H389.169V32.5342H415.988ZM416.2 139.599V190.491H313.992V202.739H421.479V223.434H287.595V171.275H389.381V160.082H287.173V139.599H416.2ZM291.608 40.5587V62.7319H331.942V40.5587H358.761V125.45H265V40.5587H291.608ZM291.608 104.122H331.942V83.4268H291.608V104.122Z" fill="currentColor"/>
  </svg>
);

export const LogoIconSimple: React.FC<IconProps> = ({ className = "w-auto h-6" }) => (
  <svg 
    viewBox="0 0 30 28" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M9.80007 5.46582H0.733398L12.8223 27.5992H16.3482L18.8667 22.0658L9.80007 5.46582Z" fill="currentColor"/>
    <rect x="9.7998" y="5.46582" width="3.06667" height="0.933333" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M23.5122 0.399414H23.9549C23.9549 3.33308 26.333 5.7113 29.2667 5.71142V6.15409C26.333 6.1542 23.9549 8.53242 23.9549 11.4661L23.5122 11.4661C23.5122 8.53234 21.1339 6.15409 18.2002 6.15409V5.71142C21.1339 5.71142 23.5122 3.33315 23.5122 0.399414Z" fill="currentColor"/>
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const MessageIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z" />
  </svg>
);

export const LikeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.3604 20H6C4.89543 20 4 19.1046 4 18V10H7.92963C8.59834 10 9.2228 9.6658 9.59373 9.1094L12.1094 5.3359C12.6658 4.5013 13.6025 4 14.6056 4H14.8195C15.4375 4 15.9075 4.55487 15.8059 5.1644L15 10H18.5604C19.8225 10 20.7691 11.1547 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20Z" />
    <path d="M8 10V20" />
  </svg>
);

export const EllipsisIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

/* --- 새로운 아이콘 추가 --- */

/* '전체' 카테고리 전용 아이콘 */
export const AllCategoryIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
  </svg>
);

/* 임의의 카테고리 아이콘 1: 별 모양 */
export const CategoryIcon1: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    width="31" 
    height="30" 
    viewBox="0 0 31 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_417_1317)">
      <rect width="30" height="30" transform="translate(0.5)" fill="white"/>
      <path d="M22.7141 13.9286C25.5545 13.9286 27.857 11.0504 27.857 7.49998C27.857 3.94958 25.5545 1.07141 22.7141 1.07141C19.8738 1.07141 17.5713 3.94958 17.5713 7.49998C17.5713 11.0504 19.8738 13.9286 22.7141 13.9286Z" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22.7129 13.9286V28.9286" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.49902 1.07141V28.9286" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.8569 1.07141V6.42855C12.8569 7.13206 12.7183 7.82869 12.4491 8.47864C12.1799 9.1286 11.7852 9.71917 11.2878 10.2166C10.7903 10.7141 10.1998 11.1087 9.54981 11.3779C8.89985 11.6471 8.20323 11.7857 7.49972 11.7857V11.7857C6.07892 11.7857 4.71631 11.2213 3.71165 10.2166C2.70699 9.21197 2.14258 7.84936 2.14258 6.42855V1.07141" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_417_1317">
        <rect width="30" height="30" fill="white" transform="translate(0.5)"/>
      </clipPath>
    </defs>
  </svg>
);

/* 임의의 카테고리 아이콘 2: 원 모양 */
export const CategoryIcon2: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

/* 임의의 카테고리 아이콘 3: 삼각형 모양 */
export const CategoryIcon3: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <polygon points="12,2 22,22 2,22" />
  </svg>
);

export const CategoryIcon4: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <rect x="4" y="4" width="16" height="16" />
  </svg>
);

export const CategoryIcon5: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
             2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const CategoryIcon6: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
  </svg>
);

export const CategoryIcon7: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M7 2v20l5-5 5 5V2z"/>
  </svg>
);

export const CategoryIcon8: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <circle cx="12" cy="12" r="5"/>
  </svg>
);

export const CategoryIcon9: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const HospitalIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    width="31" 
    height="30" 
    viewBox="0 0 31 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_417_1317)">
      <rect width="30" height="30" transform="translate(0.5)" fill="white"/>
      <path d="M22.7141 13.9286C25.5545 13.9286 27.857 11.0504 27.857 7.49998C27.857 3.94958 25.5545 1.07141 22.7141 1.07141C19.8738 1.07141 17.5713 3.94958 17.5713 7.49998C17.5713 11.0504 19.8738 13.9286 22.7141 13.9286Z" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22.7129 13.9286V28.9286" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.49902 1.07141V28.9286" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.8569 1.07141V6.42855C12.8569 7.13206 12.7183 7.82869 12.4491 8.47864C12.1799 9.1286 11.7852 9.71917 11.2878 10.2166C10.7903 10.7141 10.1998 11.1087 9.54981 11.3779C8.89985 11.6471 8.20323 11.7857 7.49972 11.7857V11.7857C6.07892 11.7857 4.71631 11.2213 3.71165 10.2166C2.70699 9.21197 2.14258 7.84936 2.14258 6.42855V1.07141" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_417_1317">
        <rect width="30" height="30" fill="white" transform="translate(0.5)"/>
      </clipPath>
    </defs>
  </svg>
);

export const SchoolIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    width="31" 
    height="30" 
    viewBox="0 0 31 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_417_1317)">
      <rect width="30" height="30" transform="translate(0.5)" fill="white"/>
      <path d="M15.5 3L28.5 10L15.5 17L2.5 10L15.5 3Z" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22.5 13.5V22.5" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 13.5V22.5" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 10V27" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28.5 10V27" stroke="#000001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_417_1317">
        <rect width="30" height="30" fill="white" transform="translate(0.5)"/>
      </clipPath>
    </defs>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const EmailIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const DropdownArrowIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
); 