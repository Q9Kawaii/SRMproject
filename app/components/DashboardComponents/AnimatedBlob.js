// components/AnimatedBlob.jsx
"use client";
import { motion } from "framer-motion";

export default function AnimatedBlob() {
  return (
    <motion.div
      className="absolute w-72 lg:w-92 h-72 lg:h-92 bg-[#6bc5e0]  rounded-full mix-blend-multiply filter opacity-40 animate-blob lg:mr-10"
      initial={{ borderRadius: "42% 58% 70% 30% / 30% 30% 70% 70%" }}
      animate={{
        borderRadius: [
          "42% 58% 58% 42% / 42% 42% 58% 58%",
          "50% 50% 40% 60% / 60% 40% 50% 50%",
          "58% 42% 42% 58% / 58% 58% 42% 42%",
          "42% 58% 58% 42% / 42% 42% 58% 58%",
          "50% 50% 40% 60% / 60% 40% 50% 50%",
          "58% 42% 42% 58% / 58% 58% 42% 42%",
        ],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
