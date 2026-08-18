# Firebase 클라우드 저장 설정

게임 코드는 이미 Google 로그인과 Firestore 저장을 지원합니다. 아래 콘솔 설정만 하면 활성화됩니다.

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트를 만들고 웹 앱(`</>`)을 등록합니다.
2. 웹 앱의 `firebaseConfig` 값을 `firebase-config.js`에 복사합니다.
3. **Authentication → Sign-in method**에서 Google 로그인을 활성화합니다.
4. **Firestore Database**를 만들고 `firestore.rules` 내용을 Rules 탭에 붙여 넣어 게시합니다.
5. GitHub Pages를 사용한다면 **Authentication → Settings → Authorized domains**에 `<아이디>.github.io`를 추가합니다.

설정 전이나 네트워크 오류 시에는 기존 브라우저 `localStorage`에 계속 저장됩니다. Google 계정을 연결하면 저장 문서는 `playerSaves/{uid}`에 생성되며, 보안 규칙상 본인의 문서만 읽고 쓸 수 있습니다.
