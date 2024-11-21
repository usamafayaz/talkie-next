"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Button
        variant={"destructive"}
        onClick={() => {
          console.log("Hey");
        }}
      >
        Cancel
      </Button>
    </div>
  );
}
