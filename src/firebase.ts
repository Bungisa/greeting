import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PaperRecord } from './data/curriculumData';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. The client is offline.');
      return false;
    }
    return true;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  if (cred.user) {
    const isBootstrappedAdmin = cred.user.email === 'mohamedshabani751@gmail.com';
    try {
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          uid: cred.user.uid,
          displayName: (cred.user.displayName || cred.user.email || 'Elimika User').slice(0, 110),
          email: cred.user.email || '',
          role: isBootstrappedAdmin ? 'admin' : 'student',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
    }
  }
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function subscribeToFirebaseAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export interface MockExamAttemptCloudRecord {
  id: string;
  uid: string;
  studentName: string;
  school: string;
  cls: string;
  subject: string;
  sectionAScore: number;
  sectionBScore: number;
  sectionCScore: number;
  totalScore: number;
  nectaGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'S' | 'F';
  nectaDivision: string;
  durationSeconds: number;
  completedAt: string;
}

export interface CloudLeaderboardEntry {
  uid: string;
  studentName: string;
  school: string;
  cls: string;
  xp: number;
  mockExamsCount?: number;
  bestGrade?: string;
  updatedAt: string;
}

export async function saveCloudDocument(record: PaperRecord): Promise<boolean> {
  if (!auth.currentUser) return false;
  const docType: 'paper' | 'textbook' | 'syllabus' | 'notes' = record.isSyllabus
    ? 'syllabus'
    : record.isBook
    ? 'textbook'
    : 'paper';

  const safePaperUrl = (record.paperUrl || record.customContent || 'https://elimika.online').slice(0, 850000);
  const payload = {
    id: record.id.slice(0, 190),
    cls: (record.form || 'Form 4').slice(0, 55),
    subject: (record.subject || 'Basic Mathematics').slice(0, 110),
    title: (record.title || 'Elimika Document').slice(0, 290),
    year: (record.year || '2026').slice(0, 18),
    paperUrl: safePaperUrl,
    solutionUrl: (record.answersUrl || '').slice(0, 5000),
    docType,
    uploadedBy: auth.currentUser.email || auth.currentUser.uid,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'documents', record.id), payload);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `documents/${record.id}`);
    return false;
  }
}

export async function deleteCloudDocument(docId: string): Promise<boolean> {
  if (!auth.currentUser) return false;
  try {
    await deleteDoc(doc(db, 'documents', docId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `documents/${docId}`);
    return false;
  }
}

export function subscribeToCloudDocuments(onUpdate: (papers: PaperRecord[]) => void): () => void {
  const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(120));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: PaperRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const isBook = d.docType === 'textbook';
        const isSyllabus = d.docType === 'syllabus';
        const isHttp = typeof d.paperUrl === 'string' && /^https?:\/\//i.test(d.paperUrl);
        return {
          id: d.id || docSnap.id,
          title: d.title || 'Attached Document',
          form: d.cls || 'Form 4',
          subject: d.subject || 'Basic Mathematics',
          year: d.year || '2026',
          category: isSyllabus ? 'TIE Syllabus' : isBook ? 'TIE Book' : 'NECTA',
          paperUrl: isHttp ? d.paperUrl : null,
          answersUrl: d.solutionUrl && /^https?:\/\//i.test(d.solutionUrl) ? d.solutionUrl : null,
          isBook,
          isSyllabus,
          customContent: !isHttp && typeof d.paperUrl === 'string' ? d.paperUrl : '',
          isUserAttached: true,
        };
      });
      onUpdate(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    }
  );
}

export async function saveMockExamAttemptToCloud(
  attempt: Omit<MockExamAttemptCloudRecord, 'uid'>,
  earnedXp: number
): Promise<boolean> {
  if (!auth.currentUser) return false;
  const uid = auth.currentUser.uid;
  const fullRecord: MockExamAttemptCloudRecord = {
    ...attempt,
    uid,
    id: attempt.id.slice(0, 140),
    studentName: (attempt.studentName || auth.currentUser.displayName || 'Student').slice(0, 110),
    school: (attempt.school || 'Elimika Secondary School').slice(0, 110),
    cls: (attempt.cls || 'Form 4').slice(0, 55),
    subject: (attempt.subject || 'Basic Mathematics').slice(0, 110),
    totalScore: Math.max(0, Math.min(100, Math.round(attempt.totalScore))),
    completedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'mockExams', fullRecord.id), fullRecord);
    await setDoc(
      doc(db, 'leaderboard', uid),
      {
        uid,
        studentName: fullRecord.studentName,
        school: fullRecord.school,
        cls: fullRecord.cls,
        xp: Math.max(0, Math.min(10000000, earnedXp)),
        bestGrade: fullRecord.nectaGrade,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `mockExams/${fullRecord.id}`);
    return false;
  }
}

export function subscribeToNationalLeaderboard(
  onUpdate: (entries: CloudLeaderboardEntry[]) => void
): () => void {
  const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(30));
  return onSnapshot(
    q,
    (snapshot) => {
      const entries: CloudLeaderboardEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          uid: d.uid || docSnap.id,
          studentName: d.studentName || 'Student',
          school: d.school || 'Elimika Secondary',
          cls: d.cls || 'Form 4',
          xp: typeof d.xp === 'number' ? d.xp : 0,
          mockExamsCount: typeof d.mockExamsCount === 'number' ? d.mockExamsCount : 1,
          bestGrade: d.bestGrade || 'A',
          updatedAt: d.updatedAt || new Date().toISOString(),
        };
      });
      onUpdate(entries);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    }
  );
}
