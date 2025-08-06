"use client";

import { exportFormBtoExcel } from "./exportExcelFormB";

export default function ExportButtonFormB() {
  return (
    <button
      onClick={exportFormBtoExcel}
      className="cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 px-4 py-2 font-semibold shadow"
    >
      Download Format B
    </button>
  );
}
