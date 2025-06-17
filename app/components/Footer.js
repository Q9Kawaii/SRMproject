import React from 'react';

export default function Footer() {
  return (
    <div className="bg-neutral-300 p-6 md:px-72 md:py-7 flex flex-col md:flex-row justify-between items-center gap-6 bottom-0 z-10 mt-50 lg:mt-10">
      <img src="SRMlogo.png" className="h-10 md:h-20" alt="SRM Logo" />

        <div className='flex justify-between item-center gap-4 text-xl'>
            <img src="mail.png" className='h-9' />
            <p>yashxxxxxxx17@gmail.com</p>
        </div>

      <div className="flex flex-col gap-3 text-base md:text-xl">
        <div className="flex items-center gap-2">
            <img src="phone-call.png" className="h-5 md:h-6" alt="Phone" />
            <span>+91 70X76XXX02</span>
          </div>
        <div className="flex items-center gap-2">
            <img src="phone-call.png" className="h-5 md:h-6" alt="Phone" />
            <span>+91 70X76XXX02</span>
          </div>
        <div className="flex items-center gap-2">
            <img src="phone-call.png" className="h-5 md:h-6" alt="Phone" />
            <span>+91 70X76XXX02</span>
          </div>
      </div>
    </div>
  );
}
