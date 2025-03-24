import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">개인정보 처리방침</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. 개인정보의 처리 목적</h2>
            <p className="text-gray-600 dark:text-gray-400">
              빌런은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 mt-4 text-gray-600 dark:text-gray-400">
              <li>회원 가입 및 관리</li>
              <li>게시판 서비스 제공 및 관리</li>
              <li>불량 회원의 부정 이용 방지</li>
              <li>게시판 운영을 위한 통계·분석</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. 개인정보의 처리 및 보유기간</h2>
            <p className="text-gray-600 dark:text-gray-400">
              빌런은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. 정보주체의 권리·의무 및 행사방법</h2>
            <p className="text-gray-600 dark:text-gray-400">
              이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc pl-5 mt-4 text-gray-600 dark:text-gray-400">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정·삭제 요구</li>
              <li>개인정보 처리정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. 처리하는 개인정보 항목</h2>
            <p className="text-gray-600 dark:text-gray-400">
              빌런은 다음의 개인정보 항목을 처리하고 있습니다.
            </p>
            <ul className="list-disc pl-5 mt-4 text-gray-600 dark:text-gray-400">
              <li>필수항목: 이메일 주소, 비밀번호</li>
              <li>자동수집항목: 서비스 이용 기록, IP 주소</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. 개인정보의 파기</h2>
            <p className="text-gray-600 dark:text-gray-400">
              빌런은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy; 