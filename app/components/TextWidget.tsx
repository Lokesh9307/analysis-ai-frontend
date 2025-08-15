"use client";

import React, { useRef, useEffect } from "react";

type Props = {
  text: string;
  onChange: (text: string) => void;
};

export default function TextWidget({ text, onChange }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && divRef.current.innerText !== text) {
      divRef.current.innerText = text;
    }
  }, [text]);

  return (
    <div
      className="w-full min-h-[150px] bg-black text-white rounded-md p-4 text-center"
    >
      <div
        ref={divRef}
        className="w-full h-full p-3 leading-relaxed focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLElement).innerText)}
      />
    </div>
  );
}
