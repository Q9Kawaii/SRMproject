import React from 'react';
import Image from "next/image";

export default function Footer() {
  return (
    <div className="bg-neutral-300 p-6 md:px-72 md:py-7 flex flex-col md:flex-row justify-between items-center gap-6 bottom-0 z-10 mt-50 lg:mt-10">
      <span className='flex justify-between items-center gap-6'>
        <Image src="/SRMlogo.png" width={80} height={80} className="h-10 md:h-20" alt="SRM Logo" />
        <Image src="/SAMADHAN transparent english.png" width={160} height={80} className='h-20 md:h-20' alt="Samadhan Logo" />
      </span>

      <div className='flex justify-between item-center gap-4 text-xl'>
        <Image src="/mail.png" width={36} height={36} className='h-9' alt="Mail" />
        <p>yashxxxxxxx17@gmail.com</p>
      </div>

      <div className="flex flex-col gap-3 text-base md:text-xl">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <Image src="/phone-call.png" width={24} height={24} className="h-5 md:h-6" alt="Phone" />
            <span>+91 70X76XXX02</span>
          </div>
        ))}
      </div>
    </div>
  );
}
