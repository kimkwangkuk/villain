import axios from 'axios';

// axios 인스턴스 생성 (기본 설정)
const api = axios.create({
  baseURL: 'http://localhost:5000/api'  // 서버 기본 주소
});

// 응답 인터셉터 추가
api.interceptors.response.use(
  response => {
    console.log('API 응답:', {
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API 에러:', {
      url: error.config?.url,
      error: error.response?.data || error.message
    });
    return Promise.reject(error);
  }
);

// API 함수들
export const getPosts = () => api.get('/posts');                // 전체 게시글 조회
export const getPost = (id) => api.get(`/posts/${id}`);        // 단일 게시글 조회
export const createPost = (postData) => api.post('/posts', postData);  // 게시글 작성
export const addComment = (postId, commentData) => 
  api.post(`/posts/${postId}/comments`, commentData);          // 댓글 추가
export const updateReaction = (postId, reactionType) => 
  api.patch(`/posts/${postId}/reactions`, { type: reactionType }); // 반응 업데이트
export const getCategories = () => api.get('/categories'); 