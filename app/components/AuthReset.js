"use client";

import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AuthReset() {
  useEffect(() => {
    const auth = getAuth(app);
    auth.signOut().then(() => {
      console.log("🔒 Logged out on refresh");
    });
  }, []);

  return null;
}
