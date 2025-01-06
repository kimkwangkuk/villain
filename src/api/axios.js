import axios from 'axios';

// 환경변수 확인을 위한 로그
console.log('서버 포트:', process.env.REACT_APP_SERVER_PORT);

const api = axios.create({
  // 하드코딩된 URL로 먼저 테스트
  baseURL: 'http://localhost:5000/api'
  
  // 환경변수가 제대로 동작하지 않아서 임시로 주석 처리
  // baseURL: `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api`
});

export const getPosts = () => api.get('/posts');
export const createPost = (postData) => api.post('/posts', postData);
export const addComment = (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData);
export const updateReaction = (postId, reactionType) => api.patch(`/posts/${postId}/reactions`, { type: reactionType });
export const getPost = (id) => api.get(`/posts/${id}`); 