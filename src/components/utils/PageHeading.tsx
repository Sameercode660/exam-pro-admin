"use client";

import React from "react";

interface PageHeadingProps {
  title: string;
}

export default function PageHeading({ title }: PageHeadingProps) {
  return (
    <div className="flex justify-center items-center w-full py-6 mb-3">
      <h1 className="text-2xl font-bold font-sans tracking-wide text-gray-800">
        {title}
      </h1>
    </div>
  );
}
