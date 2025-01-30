/**
 * @typedef {Object} Post
 * @property {string} title - 게시글 제목
 * @property {string} content - 게시글 내용
 * @property {string} authorId - 작성자 ID (Firebase Auth uid)
 * @property {string} authorName - 작성자 이름
 * @property {string} authorPhotoURL - 작성자 프로필 이미지 URL
 * @property {string} categoryId - 카테고리 ID
 * @property {Date} createdAt - 생성일
 * @property {Date} updatedAt - 수정일
 * @property {number} likes - 좋아요 수
 * @property {string[]} likedBy - 좋아요한 사용자 ID 목록
 * @property {number} commentCount - 댓글 수
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - 댓글 ID
 * @property {string} content - 댓글 내용
 * @property {string} postId - 게시글 ID
 * @property {string} userId - 작성자 ID
 * @property {string} author - 작성자 이메일 또는 이름
 * @property {Date} createdAt - 작성일
 * @property {Date} updatedAt - 수정일
 */

/**
 * @typedef {Object} VillainCategory
 * @property {string} name - 카테고리 이름
 * @property {string} description - 카테고리 설명
 * @property {Date} createdAt - 생성일
 */

/**
 * @typedef {Object} User
 * @property {string} email - 이메일
 * @property {string} username - 사용자 이름
 * @property {string} photoURL - 프로필 이미지 URL
 * @property {string} bio - 자기소개
 * @property {Date} createdAt - 가입일
 */ 