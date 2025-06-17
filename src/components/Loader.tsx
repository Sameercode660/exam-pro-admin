import React from "react";

interface LoaderProps {
  size?: number; 
  color?: string; 
}

const Loader: React.FC<LoaderProps> = ({ size = 24, color = "#ffffff" }) => {
  return (
    <div
      className="loader"
      style={{
        width: size,
        height: size,
        borderColor: `${color} transparent transparent transparent`,
      }}
    ></div>
  );
};

export default Loader;
