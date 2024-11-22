"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  const array = ["Usama", "Sarmad", "Arslan", "Ayyaz", "Sohaib"];
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-5xl m-12">Welcome</h1>
      {array.map((item, index: any) => (
        <p
          key={index}
          className="text-3xl text-white p-2 bg-gray-600 m-2 rounded-md h-14 w-64 text-center hover:scale-125  duration-300"
        >
          {item}
        </p>
      ))}
      <Link
        href="/chatscreen"
        className="text-blue-600 hover:underline focus:outline-none"
      >
        <Button variant={"destructive"}>Start Chatting</Button>
      </Link>
    </div>
  );
}
