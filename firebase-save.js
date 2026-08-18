const config = window.FUR_FIREBASE_CONFIG || {};
const requiredConfig = ["apiKey", "authDomain", "projectId", "appId"];

function dispatch(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function hasFirebaseConfig() {
  return requiredConfig.every((key) => typeof config[key] === "string" && config[key].trim());
}

if (!hasFirebaseConfig()) {
  window.FurCloudSave = {
    configured: false,
    currentUser: null,
    signIn: async () => { throw new Error("Firebase 설정값이 필요합니다."); },
    loadCurrent: async () => null,
    queueSave: () => false,
    saveNow: async () => false,
  };
  dispatch("fur-cloud-status", { state: "setup", text: "Firebase 설정 필요" });
} else {
  startFirebase().catch((error) => {
    console.warn("Firebase SDK failed to load", error);
    window.FurCloudSave = {
      configured: true,
      currentUser: null,
      signIn: async () => { throw error; },
      loadCurrent: async () => null,
      queueSave: () => false,
      saveNow: async () => false,
    };
    dispatch("fur-cloud-status", { state: "error", text: "로컬 저장 중" });
  });
}

async function startFirebase() {
  const SDK_VERSION = "12.16.0";
  const [{ initializeApp }, authSdk, firestoreSdk] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
  ]);

  const app = initializeApp(config);
  const auth = authSdk.getAuth(app);
  const db = firestoreSdk.getFirestore(app);
  const provider = new authSdk.GoogleAuthProvider();
  let saveTimer = 0;
  let pendingSnapshot = null;

  await authSdk.setPersistence(auth, authSdk.browserLocalPersistence);

  async function loadFor(uid) {
    const reference = firestoreSdk.doc(db, "playerSaves", uid);
    const result = await firestoreSdk.getDoc(reference);
    if (!result.exists()) return null;
    const data = result.data();
    return {
      profile: data.profile || null,
      unlocked: Number(data.unlocked) || 0,
      updatedAt: Number(data.clientUpdatedAt) || 0,
    };
  }

  async function saveNow(snapshot = pendingSnapshot) {
    pendingSnapshot = null;
    if (!auth.currentUser || !snapshot) return false;
    const reference = firestoreSdk.doc(db, "playerSaves", auth.currentUser.uid);
    await firestoreSdk.setDoc(reference, {
      schemaVersion: 1,
      profile: snapshot.profile,
      unlocked: snapshot.unlocked,
      clientUpdatedAt: snapshot.updatedAt,
      updatedAt: firestoreSdk.serverTimestamp(),
    }, { merge: true });
    dispatch("fur-cloud-status", { state: "saved", text: "클라우드 저장됨" });
    return true;
  }

  function queueSave(snapshot) {
    if (!auth.currentUser) return false;
    pendingSnapshot = structuredClone(snapshot);
    window.clearTimeout(saveTimer);
    dispatch("fur-cloud-status", { state: "saving", text: "저장 중…" });
    saveTimer = window.setTimeout(() => {
      saveNow().catch((error) => {
        console.warn("Cloud save failed", error);
        dispatch("fur-cloud-status", { state: "error", text: "로컬 저장 중" });
      });
    }, 700);
    return true;
  }

  async function signIn() {
    dispatch("fur-cloud-status", { state: "saving", text: "로그인 중…" });
    return authSdk.signInWithPopup(auth, provider);
  }

  const bridge = {
    configured: true,
    currentUser: null,
    signIn,
    loadCurrent: () => auth.currentUser ? loadFor(auth.currentUser.uid) : Promise.resolve(null),
    queueSave,
    saveNow,
  };
  window.FurCloudSave = bridge;

  authSdk.onAuthStateChanged(auth, (user) => {
    bridge.currentUser = user;
    if (user) {
      dispatch("fur-cloud-status", { state: "online", text: "클라우드 연결됨" });
      dispatch("fur-cloud-ready", { uid: user.uid });
    } else {
      dispatch("fur-cloud-status", { state: "offline", text: "Google 저장 연결" });
    }
  });
}
