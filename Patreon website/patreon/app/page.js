import Image from "next/image";

export default function Home() {
  return (
    <div className="flex justify-center flex-col items-center text-[#323232] h-[44vh]">
      <div className="font-bold text-3xl">Buy me a Coffee</div>
      <div>
        <button type="button" className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">Buy Now!</span></button>

      </div>
    </div>
  );
}
