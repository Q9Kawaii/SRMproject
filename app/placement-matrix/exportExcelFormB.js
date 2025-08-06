import * as XLSX from "xlsx";
import { fetchFormBData } from "../../lib/fetchFormB"; 

export async function exportFormBtoExcel() {
  const firebaseData = await fetchFormBData();

  const allFieldSet = new Set();
  Object.values(firebaseData).forEach(userForms => {
    userForms.forEach(form => {
      Object.keys(form).forEach(field => {
        if (field !== "id") allFieldSet.add(field);
      });
    });
  });

  const allFields = Array.from(allFieldSet);

  const excelData = [
    ["User ID", "Form Document ID", ...allFields],
  ];

  for (const [userId, forms] of Object.entries(firebaseData)) {
    forms.forEach(form => {
      const row = [
        userId,
        form.id,
        ...allFields.map(field => form[field] || "")
      ];
      excelData.push(row);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "FormB");

  // Use XLSX.write with type: "array" to get a Blob, then trigger download
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "formB-data.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
