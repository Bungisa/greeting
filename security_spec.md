# Firestore Security Specification

## 1. Access Control Model
- **Bootstrapped Admin**: `mohamedshabani751@gmail.com` (verified email) or user with `role == 'admin'` in `/users/{uid}`.
- **`/documents/{docId}`**:
  - `get`, `list`: Allowed for everyone so students across Tanzania can browse and download NECTA past papers, TIE textbooks, and marking schemes immediately.
  - `create`, `update`: Allowed for authenticated users with valid schema (admin/teacher uploads).
  - `delete`: Allowed for admins only.
- **`/mockExams/{attemptId}`**:
  - `get`, `list`: Allowed for authenticated users.
  - `create`, `update`: Allowed if authenticated and `request.resource.data.uid == request.auth.uid` (or admin), with strict field validation (`totalScore >= 0 && totalScore <= 100`).
  - `delete`: Allowed for owner or admin.
- **`/leaderboard/{userId}`**:
  - `get`, `list`: Allowed for everyone so the national leaderboard is visible.
  - `create`, `update`: Allowed if authenticated and `userId == request.auth.uid` (or admin), with valid numeric `xp`.
  - `delete`: Allowed for admin only.
- **`/users/{userId}`**:
  - `get`: Allowed for owner (`userId == request.auth.uid`) or admin.
  - `list`: Allowed for admin only.
  - `create`: Allowed for owner if `role in ['student', 'teacher']` or if user is bootstrapped admin.
  - `update`: Allowed for owner if `role` is unchanged, or by admin.
  - `delete`: Allowed for admin only.
