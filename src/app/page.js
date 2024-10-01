"use client";

import React from "react";
import Standings from "./components/Standings";
import { Michroma } from "next/font/google";

const michroma = Michroma({ weight: "400", subsets: ["latin"] });

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          <Standings />
        </div>
        <div className="lg:col-span-4 flex justify-center lg:justify-end w-full">
          {" "}
          {/* Centering for small screens, aligning right for larger */}
          <div className="space-y-6 w-full">
            {" "}
            {/* Set a max width for larger screens */}
            <h1
              className={`${michroma.className} text-xl md:text-3xl text-center mb-4`}
            >
              Maçlar
            </h1>
            <div className="bg-zinc-800 p-10 shadow rounded-lg w-full">
              <h3 className="text-center">...</h3>
              <p className="text-center">...</p>
            </div>
            <div className="bg-zinc-800 p-10 shadow rounded-lg w-full">
              <h3 className="text-center">...</h3>
              <p className="text-center">...</p>
            </div>
            <div className="bg-zinc-800 p-10 shadow rounded-lg w-full">
              <h3 className="text-center">...</h3>
              <p className="text-center">...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
