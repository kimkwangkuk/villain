import React from 'react';

function Terms() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">서비스 이용약관</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">제1조 (목적)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              이 약관은 빌런이 제공하는 서비스의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">제2조 (정의)</h2>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
              <li>
                "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.
              </li>
              <li>
                "이용자"란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
              </li>
              <li>
                "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">제3조 (약관의 효력 및 변경)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공지합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">제4조 (서비스의 제공)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              회사는 다음과 같은 서비스를 제공합니다.
            </p>
            <ul className="list-disc pl-5 mt-4 text-gray-600 dark:text-gray-400">
              <li>게시물 작성, 수정, 삭제 기능</li>
              <li>회원 간 커뮤니케이션 기능</li>
              <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">제5조 (서비스의 중단)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms; 