// components/QuoteLoader.tsx
'use client';

import React, { useEffect, useState } from 'react';

const quotes = [
  {
    text: 'The only limit to our realization of tomorrow is our doubts of today.',
    author: 'Franklin D. Roosevelt',
  },
  {
    text: 'Don’t watch the clock; do what it does. Keep going.',
    author: 'Sam Levenson',
  },
  {
    text: 'It always seems impossible until it’s done.',
    author: 'Nelson Mandela',
  },
  {
    text: 'Success is not final, failure is not fatal: It is the courage to continue that counts.',
    author: 'Winston Churchill',
  },
  {
    text: 'Start where you are. Use what you have. Do what you can.',
    author: 'Arthur Ashe',
  },
];

const QuoteLoader = () => {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-white px-6 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <h2 className="text-lg sm:text-xl md:text-2xl text-gray-700 italic max-w-xl">
        “{quote.text}”
      </h2>
      <p className="mt-4 text-sm sm:text-base text-gray-500 font-semibold">— {quote.author}</p>
    </div>
  );
};

export default QuoteLoader;
