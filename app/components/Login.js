"use client";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
  const provider = new GoogleAuthProvider();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Prompt or assign role, here we hardcode as student for example
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          role: "student" // Change logic to decide or ask role if needed
        });
      }

      router.refresh();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login to Continue</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-blue-600 text-white rounded-md shadow"
      >
        Sign in with Google
      </button>
    </div>
  );
}