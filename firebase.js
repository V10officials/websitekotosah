// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 YOUR FIREBASE CONFIG (replace values)
const firebaseConfig = {
  apiKey: "AIzaSyAWojEnXWsiaA6T61GR7DbnfcVWYsqPFzc",
  authDomain: "sleeproject-c0de7.firebaseapp.com",
  projectId: "sleeproject-c0de7",
  storageBucket: "sleeproject-c0de7.appspot.com",
  messagingSenderId: "1070204789680",
  appId: "1:1070204789680:web:11ac89bfe22c96efedec75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   SIGN UP
========================= */
export function handleSignup(e) {
  e.preventDefault();

  const form = e.target;
  const fullname = form.fullname.value;
  const email = form.email.value;
  const password = form.password.value;
  const confirm = form.confirm_password.value;

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullname: fullname,
        email: email,
        createdAt: new Date()
      });
      //sign in
      alert("Account created successfully!");
      window.location.href = "signin.html";
    })
    .catch(err => alert(err.message));
};

/* =========================
   SIGN IN
========================= */
export function handleSignin(e) {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Signed in successfully!");
      window.location.href = "home.html";
    })
    .catch(err => alert(err.message));
};

/* =========================
   FORGOT PASSWORD
========================= */
export function handleForgotPassword(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const messageBox = document.getElementById("message");

  sendPasswordResetEmail(auth, email)
    .then(() => {
      messageBox.textContent =
        "If this email exists, a reset link has been sent.";
      messageBox.className = "message success";
      messageBox.style.display = "block";
    })
    .catch(() => {
      messageBox.textContent =
        "If this email exists, a reset link has been sent.";
      messageBox.className = "message success";
      messageBox.style.display = "block";
    });
};

// Make auth global for non-module scripts
window.firebase = { auth };

// Make handleForgotPassword global
window.handleForgotPassword = handleForgotPassword;

// Attach event listener for forgot password form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotForm');
  if (form) {
    form.addEventListener('submit', handleForgotPassword);
  }
});
