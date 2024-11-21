"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-5xl m-12">Welcome</h1>

      <Link
        href="/chatscreen"
        className="text-blue-600 hover:underline focus:outline-none"
      >
        <Button variant={"destructive"}>Start Chatting</Button>
      </Link>
    </div>
  );
}
