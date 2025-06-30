import Image from 'next/image';

export default function NavBar({ onHamClick }) {
  return (
    <div className="w-[100%] ">
      <div className="flex justify-center items-center text-white h-6 bg-[#0c4da2] text-xs text-center">
        समाधान – SRM Institute of Science and Technology, Chennai
      </div>
      <div className="bg-white flex sm:flex-row justify-between items-center px-3 py-3 gap-2 ">
        <div className="h-12 w-25 overflow-hidden flex justify-center items-center">
          <Image src="/SRMlogo.png" width={100} height={36} className="h-9 w-25" alt="Logo" />
        </div>
        <span className="text-3xl text-[#0c4da2] font-extrabold cursor-pointer shadow-2xl shadow-neutral-950" onClick={onHamClick} >&#9776;</span>
      </div>
    </div>
  );
}
