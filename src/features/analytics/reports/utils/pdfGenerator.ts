import html2pdf from "html2pdf.js";

export const generateCertificatePDF = async (
  element: HTMLElement,
  filename: string,
) => {
  const options = {
    margin: 0,
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm" as const,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
  };

  try {
    await html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};
