import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {db} from '../firebaseConfig';


export const addNotification = async (
  userProfileImage,
  username,
  comment,
  postStatus,
  postImage = null,
  postId = null
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userProfileImage,
      username,
      comment,
      status: postStatus,
      postImage,
      postId,
      createdAt: serverTimestamp(),
    });
    console.log('เพิ่มการแจ้งเตือนสำเร็จ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มการแจ้งเตือน:', error);
  }
};
