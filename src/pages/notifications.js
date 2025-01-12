import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setNotifications(notificationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        const notificationRef = doc(db, 'notifications', notification.id);
        await updateDoc(notificationRef, {
          read: true
        });
      } catch (error) {
        console.error('알림 상태 업데이트 실패:', error);
      }
    }
  };

  if (loading) return <div className="text-center py-8">로딩중...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">알림</h1>
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map(notification => (
              <Link
                key={notification.id}
                to={`/posts/${notification.postId}`}
                className={`block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow
                  ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-grow">
                    <p className="text-gray-800">
                      <span className="font-medium">{notification.senderName}</span>
                      {notification.type === 'comment' && '님이 회원님의 게시글에 댓글을 남겼습니다:'}
                      {notification.type === 'like' && '님이 회원님의 게시글을 좋아합니다.'}
                    </p>
                    {notification.content && (
                      <p className="text-gray-600 mt-1">{notification.content}</p>
                    )}
                    <span className="text-sm text-gray-500">
                      {dayjs(notification.createdAt).fromNow()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">새로운 알림이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage; 