import React from "react";

interface HeadingProps {
  text: string;
  size?: "small" | "medium" | "large" | "xlarge";
}

const Heading: React.FC<HeadingProps> = ({ text, size = "medium" }) => {
  const sizeClasses = {
    small: "text-sm md:text-base",
    medium: "text-lg md:text-xl",
    large: "text-2xl md:text-3xl",
    xlarge: "text-4xl md:text-5xl",
  };

  return (
    <h1
      className={`font-bold ${sizeClasses[size]} text-gray-800 tracking-wide`}
    >
      {text}
    </h1>
  );
};

export default Heading;
