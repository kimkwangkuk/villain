export const HomeIcon = ({ className = "w-6 h-6" }) => (
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

export const UserIcon = ({ className = "w-6 h-6" }) => (
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

export const MessageIcon = ({ className = "w-6 h-6" }) => (
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

export const LikeIcon = ({ className = "w-6 h-6" }) => (
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

export const EllipsisIcon = ({ className = "w-6 h-6" }) => (
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
export const AllCategoryIcon = ({ className = "w-6 h-6" }) => (
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
export const CategoryIcon1 = ({ className = "w-6 h-6" }) => (
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
export const CategoryIcon2 = ({ className = "w-6 h-6" }) => (
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
export const CategoryIcon3 = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <polygon points="12,2 22,22 2,22" />
  </svg>
);

export const CategoryIcon4 = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <rect x="4" y="4" width="16" height="16" />
  </svg>
);

export const CategoryIcon5 = ({ className = "w-6 h-6" }) => (
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

export const CategoryIcon6 = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <polygon points="12,2 19,7 19,17 12,22 5,17 5,7" />
  </svg>
);

export const CategoryIcon7 = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19 16.58A5.002 5.002 0 0 0 15 8h-1a7 7 0 0 0-13 3.8A4.992 4.992 0 0 0 5 18h14a4 4 0 0 0 0-5.42z"/>
  </svg>
);

export const CategoryIcon8 = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const CategoryIcon9 = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const SendIcon = ({ className = "w-6 h-6" }) => (
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
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </svg>
);

export const ShareIcon = ({ className = "w-6 h-6" }) => (
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
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" x2="12" y1="2" y2="15" />
  </svg>
);

/* 새 아이콘: HospitalIcon 추가 */
export const HospitalIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 6v4"/>
    <path d="M14 14h-4"/>
    <path d="M14 18h-4"/>
    <path d="M14 8h-4"/>
    <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/>
    <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>
  </svg>
);

export const SchoolIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 22v-4a2 2 0 1 0-4 0v4"/>
    <path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/>
    <path d="M18 5v17"/>
    <path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/>
    <path d="M6 5v17"/>
    <circle cx="12" cy="9" r="2"/>
  </svg>
);






