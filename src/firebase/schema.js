/**
 * @typedef {Object} Post
 * @property {string} title - 게시글 제목
 * @property {string} content - 게시글 내용
 * @property {string} authorId - 작성자 ID (Firebase Auth uid)
 * @property {string} authorName - 작성자 이름
 * @property {string} categoryId - 카테고리 ID
 * @property {Date} createdAt - 생성일
 * @property {Date} updatedAt - 수정일
 * @property {number} likes - 좋아요 수
 * @property {Comment[]} comments - 댓글 목록
 */

/**
 * @typedef {Object} Comment
 * @property {string} content - 댓글 내용
 * @property {string} authorId - 작성자 ID
 * @property {string} authorName - 작성자 이름
 * @property {Date} createdAt - 작성일
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
 * @property {Date} createdAt - 가입일
 */ 