"use client";

import { useState } from "react";

type Props = {
  numeroLaudo: string;
  /** ID do elemento a ser capturado. Default: "laudo-article". */
  elementId?: string;
};

export function DownloadLaudoPDF({ numeroLaudo, elementId = "laudo-article" }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    const el = document.getElementById(elementId);
    if (!el) {
      console.error(`Elemento #${elementId} não encontrado`);
      return;
    }
    setLoading(true);
    try {
      // Lazy import — só carrega ~250KB quando o usuário clica.
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imgRatio = canvas.height / canvas.width;
      const imgWidth = usableWidth;
      const imgHeight = imgWidth * imgRatio;

      if (imgHeight <= pageHeight - margin * 2) {
        // Cabe numa página
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        // Quebra em múltiplas páginas
        let position = 0;
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          if (position > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", margin, margin - position, imgWidth, imgHeight);
          position += pageHeight - margin * 2;
          remainingHeight -= pageHeight - margin * 2;
        }
      }

      pdf.save(`Laudo-${numeroLaudo}.pdf`);
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      alert("Não foi possível gerar o PDF. Tente novamente ou use Imprimir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="rounded-md bg-agua px-3 py-2 text-xs font-medium text-white hover:bg-petroleo disabled:opacity-60"
    >
      {loading ? "Gerando..." : "↓ Baixar PDF"}
    </button>
  );
}
