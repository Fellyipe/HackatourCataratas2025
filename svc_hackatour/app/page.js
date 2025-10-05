// app/page.js
"use client";

import { useEffect, useState, useRef } from "react";

const mockPartners = [
  {
    id: 1,
    name: "Restaurante Sabor Regional",
    category: "Gastronomia",
    discount: "20% OFF no Almoço Executivo",
    logoText: "SR",
    logoClass: "bg-amber-500",
  },
  {
    id: 2,
    name: "Cânions Expedições",
    category: "Passeios",
    discount: "30% OFF",
    logoText: "CE",
    logoClass: "bg-[#10b981]",
  },
  {
    id: 3,
    name: "Transfer VIP Foz",
    category: "Transporte",
    discount: "R$15 OFF",
    logoText: "TV",
    logoClass: "bg-[#1b324f]",
  },
  {
    id: 4,
    name: "Loja de Artesanato Local",
    category: "Compras",
    discount: "10% desconto",
    logoText: "LA",
    logoClass: "bg-purple-500",
  },
];

export default function Page() {
  const [page, setPage] = useState("home");
  const [currentGuestLink, setCurrentGuestLink] = useState("");
  const [currentQrSrc, setCurrentQrSrc] = useState(null);
  const [voucherInventory, setVoucherInventory] = useState({
    monthlyQuota: 1000,
    quotaRemaining: 400,
    batchSize: 50,
    totalIssued: 600,
    totalRedeemed: 528,
    partners: {
      1: { issued: 200, redeemed: 154, codePrefix: "REST-SR" },
      2: { issued: 100, redeemed: 89, codePrefix: "CAN-EXP" },
      3: { issued: 250, redeemed: 210, codePrefix: "TRANS-F" },
      4: { issued: 50, redeemed: 75, codePrefix: "LOJA-ART" },
    },
  });
  const [toast, setToast] = useState(null);
  const [partnerValidateMsg, setPartnerValidateMsg] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  function toastShow(message, success = true) {
    // setToast({ message, success });
    // setTimeout(() => setToast(null), 2800);
  }

  // HOTEL
  function generateBatch() {
    const batch = voucherInventory.batchSize;
    if (voucherInventory.quotaRemaining < batch) {
      toastShow("Quota insuficiente para gerar este lote", false);
      return;
    }
    const lotId = "INICIO" + Math.floor(100 + Math.random() * 900);
    const newLink = `https://elotur.com/resgate/?id=${lotId}`;

    // atualiza o estado do inventário (mock)
    setVoucherInventory((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.quotaRemaining -= batch;
      next.totalIssued += batch;
      const per = Math.floor(batch / Object.keys(next.partners).length);
      Object.keys(next.partners).forEach(
        (k) => (next.partners[k].issued += per)
      );
      return next;
    });

    // seta link e gera URL do QR usando api.qrserver.com
    setCurrentGuestLink(newLink);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      newLink
    )}`;
    setCurrentQrSrc(qrUrl);

    toastShow(`Lote de ${batch} vouchers gerado (ID: ${lotId})`);
  }

  // PARTNER
  function validateCode(code) {
    const c = (code || "").toUpperCase().trim();
    if (!c) {
      setPartnerValidateMsg("Digite o código");
      toastShow("Código vazio", false);
      return;
    }
    if (c.startsWith("REST-SR-")) {
      const isUsed = c.endsWith("USED");
      if (isUsed) {
        setPartnerValidateMsg("❌ Voucher já resgatado");
        toastShow("Voucher já usado", false);
      } else {
        setVoucherInventory((prev) => {
          const n = JSON.parse(JSON.stringify(prev));
          n.totalRedeemed += 1;
          n.partners[1].redeemed += 1;
          return n;
        });
        setPartnerValidateMsg(`✅ Voucher válido (ID: ${c})`);
        toastShow("Voucher validado", true);
      }
    } else {
      setPartnerValidateMsg("❌ Código inválido");
      toastShow("Código inválido", false);
    }
  }

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toastShow("Câmera não suportada", false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(s);
      const v = videoRef.current;
      if (v) {
        v.srcObject = s;
        try {
          await v.play();
        } catch (err) {
          console.warn("Play bloqueado, tentando com muted", err);
          v.muted = true;
          v.play().catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
      toastShow("Falha ao acessar câmera", false);
    }
  }
  function closeCamera() {
    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    const v = document.getElementById("camera-stream");
    if (v) v.srcObject = null;
  }

  // GUEST - generate PDF (uses external QR service and jsPDF loaded by CDN)
  async function generateGuestPdf(partnerName, discount, codePrefix) {
    const voucherCode = `${codePrefix}-KORE${Math.floor(
      100 + Math.random() * 900
    )}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=elotur-voucher-${voucherCode}`;
    toastShow("Gerando PDF...", true);
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64 = reader.result;
        const { jsPDF } = window.jspdf || {};
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Voucher Digital EloTur", 105, 20, null, null, "center");
        doc.setFontSize(16);
        doc.text(partnerName, 105, 40, null, null, "center");
        doc.setFontSize(18);
        doc.setTextColor(16, 185, 129);
        doc.text(discount, 105, 55, null, null, "center");
        doc.setTextColor(0, 0, 0);
        doc.addImage(base64, "PNG", 75, 70, 60, 60);
        doc.setFontSize(12);
        doc.text(
          "Apresente este QR Code ao atendente ou informe o código:",
          105,
          145,
          null,
          null,
          "center"
        );
        doc.setFontSize(18);
        doc.setFont("courier", "bold");
        doc.rect(50, 155, 110, 20);
        doc.text(voucherCode, 105, 168, null, null, "center");
        doc.save(`Voucher-${partnerName.replace(/\s/g, "_")}.pdf`);
        toastShow("PDF gerado");
      };
    } catch (err) {
      console.error(err);
      toastShow("Erro ao gerar PDF", false);
    }
  }

  async function downloadQr(qrUrl) {
    if (!qrUrl) {
      toastShow("Nenhum QR para baixar", false);
      return;
    }
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `qr-voucher.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastShow("QR baixado");
    } catch (err) {
      console.error(err);
      toastShow("Erro ao baixar QR", false);
    }
  }

  // helpers for stats
  const totalIssued = voucherInventory.totalIssued;
  const totalRedeemed = voucherInventory.totalRedeemed;
  const redemptionRate =
    totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0;

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#f3f4f6] text-white shadow-md mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            className="text-2xl font-extrabold cursor-pointer"
            onClick={() => setPage("home")}
          >
            <img
              src="logo.png"
              alt="EloTur"
              className="h-14 w-auto inline-block"
            />
          </h1>
          <nav className="space-x-4">
            <button
              onClick={() => setPage("hotel-dashboard")}
              className="text-gray-800 hover:text-gray-500"
            >
              Hotel
            </button>
            <button
              onClick={() => setPage("partner-dashboard")}
              className="text-gray-800 hover:text-gray-500"
            >
              Parceiro
            </button>
            <button
              onClick={() => setPage("guest-app")}
              className="text-gray-800 hover:text-gray-500"
            >
              Hóspede
            </button>
          </nav>
        </div>
      </header>

      {/* HOME */}
      {page === "home" && (
        <section className="page-content active-page card text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1b324f] mb-4">
            Gestão de Vouchers Digitais
          </h2>
          <p className="text-gray-600 mb-6">
            Use as abas para navegar entre as três visões: Hotel, Parceiro e
            Hóspede.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setPage("hotel-dashboard")}
              className="btn btn-primary"
            >
              Painel do Hotel
            </button>
            <button
              onClick={() => setPage("partner-dashboard")}
              className="btn btn-muted"
            >
              Painel do Parceiro
            </button>
            <button
              onClick={() => setPage("guest-app")}
              className="btn btn-secondary"
            >
              Acesso do Hóspede
            </button>
          </div>
        </section>
      )}

      {/* HOTEL */}
      {page === "hotel-dashboard" && (
        <section className="page-content active-page space-y-6">
          <h2 className="text-2xl font-bold text-[#1b324f]">Painel do Hotel</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500">Quota Mensal</p>
              <div className="text-3xl font-extrabold text-[#1b324f]">
                {voucherInventory.monthlyQuota.toLocaleString()}
              </div>
            </div>
            <div className="card flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500">Vouchers Restantes</p>
              <div className="text-3xl font-extrabold text-[#10b981]">
                {voucherInventory.quotaRemaining.toLocaleString()}
              </div>
            </div>
            <div className="card flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500">Vouchers Resgatados</p>
              <div className="text-3xl font-extrabold text-[#1b324f]">
                {voucherInventory.totalRedeemed.toLocaleString()}
              </div>
            </div>
            <div className="card flex flex-col justify-between flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500">Gerar Lote de vouchers</p>
              <div>
                <button
                  id="generate-lote-button"
                  onClick={() => generateBatch()}
                  className="w-full btn btn-primary mt-2"
                >
                  Gerar Link de Distribuição
                </button>
                <div className="mt-4 " id="qr-code-display">
                  {currentGuestLink ? (
                    <div className="text-center flex flex-col items-center justify-center text-center">
                      <div className="qr-placeholder mb-2">
                        {currentQrSrc ? (
                          <img
                            src={currentQrSrc}
                            alt="QR do link"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          "QR"
                        )}
                      </div>

                      <p className="truncate text-sm text-elotur-primary">
                        {currentGuestLink}
                      </p>

                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(currentGuestLink);
                            toastShow("Link copiado");
                          }}
                          className="btn btn-muted flex-1"
                        >
                          Copiar link
                        </button>
                        <button
                          onClick={() =>
                            downloadQr(
                              currentQrSrc ||
                                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                                  currentGuestLink
                                )}`
                            )
                          }
                          className="btn btn-primary flex-1"
                        >
                          Baixar QR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-500">
                      Aguardando lote
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-[#1b324f]">
              Distribuição por Parceiro
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Taxa de Resgate</p>
                <div className="text-2xl font-bold text-[#10b981] mb-4">
                  {redemptionRate.toFixed(1)}%
                </div>
                <div id="usage-chart">
                  {mockPartners.map((p) => {
                    const inv = voucherInventory.partners[p.id];
                    const totalUsed = Object.values(
                      voucherInventory.partners
                    ).reduce((s, x) => s + x.redeemed, 0);
                    const percent =
                      totalUsed > 0 ? (inv.redeemed / totalUsed) * 100 : 0;
                    return (
                      <div key={p.id} className="mb-3">
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>{p.category}</span>
                          <span>
                            {inv.redeemed} ({percent.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`${
                              p.category === "Gastronomia"
                                ? "bg-amber-500"
                                : p.category === "Passeios"
                                ? "bg-[#10b981]"
                                : p.category === "Transporte"
                                ? "bg-[#1b324f]"
                                : "bg-purple-500"
                            } h-2.5 rounded-full`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1b324f] mb-2">
                  Tabela de Inventário
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-xs text-gray-500">
                          Parceiro
                        </th>
                        <th className="p-3 text-center text-xs text-gray-500">
                          Emitidos
                        </th>
                        <th className="p-3 text-center text-xs text-gray-500">
                          Resgatados
                        </th>
                        <th className="p-3 text-center text-xs text-gray-500">
                          Taxa
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPartners.map((p) => {
                        const inv = voucherInventory.partners[p.id];
                        const rate =
                          inv.issued > 0
                            ? (inv.redeemed / inv.issued) * 100
                            : 0;
                        return (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{p.name}</td>
                            <td className="p-3 text-center">{inv.issued}</td>
                            <td className="p-3 text-center text-[#10b981] font-bold">
                              {inv.redeemed}
                            </td>
                            <td className="p-3 text-center">
                              {rate.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PARTNER */}
      {page === "partner-dashboard" && (
        <section className="page-content active-page space-y-6">
          <h2 className="text-2xl font-bold text-[#1b324f]">
            Painel do Parceiro
          </h2>
          <div className="card text-center">
            <p className="text-sm text-gray-500">Vouchers Resgatados (mês)</p>
            <div className="text-4xl font-extrabold text-[#10b981]">
              {voucherInventory.partners[1].redeemed}
            </div>
            <p className="text-gray-600 mt-2">
              Cada resgate confirma uma visita trazida pelo sistema.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Validação de Voucher</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                validateCode(e.target["validation-code"].value);
                e.target["validation-code"].value = "";
              }}
            >
              <label className="block text-sm mb-2">Código do voucher</label>
              <div className="flex gap-2">
                <input
                  id="validation-code"
                  className="flex-1 p-3 border rounded-lg text-center tracking-widest uppercase"
                  placeholder="CÓDIGO..."
                />
                <button
                  type="button"
                  onClick={openCamera}
                  className="p-3 bg-gray-200 rounded-lg"
                >
                  📷
                </button>
              </div>
              <button type="submit" className="mt-4 btn btn-primary w-full">
                Resgatar Voucher
              </button>
            </form>
            {partnerValidateMsg && (
              <p className="mt-3 text-center">{partnerValidateMsg}</p>
            )}
          </div>
        </section>
      )}

      {/* GUEST */}
      {page === "guest-app" && (
        <section className="page-content active-page">
          <div className="max-w-md mx-auto card">
            <div className="bg-[#10b981] text-black p-4 rounded-t-lg">
              <div className="text-sm">Vouchers Digitais EloTur</div>
              <div className="text-xl font-bold">Olá, Hóspede!</div>
            </div>

            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#1b324f]">
                Seus Vouchers
              </h3>
              <div className="space-y-3">
                {mockPartners.map((p) => {
                  const voucherCode = `${
                    voucherInventory.partners[p.id].codePrefix
                  }-KORE769`;
                  return (
                    <div key={p.id} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${p.logoClass}`}
                        >
                          {p.logoText}
                        </div>
                        <div>
                          <div className="font-bold text-[#1b324f]">
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {p.category}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-lg font-extrabold text-[#10b981]">
                          {p.discount}
                        </div>
                        <div className="text-xs text-gray-500">
                          Uso único durante a estadia
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          generateGuestPdf(p.name, p.discount, voucherCode)
                        }
                        className="w-full btn btn-secondary"
                      >
                        Gerar PDF do Voucher
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Camera modal */}
      {cameraStream && (
        <div
          id="camera-view"
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white p-4 rounded-lg w-full max-w-lg">
            <h3 className="font-bold mb-3">Aponte para o QR Code</h3>
            <video
              id="camera-stream"
              autoPlay
              playsInline
              muted
              className="w-full rounded-md bg-black"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
              }}
            />
            <button
              onClick={closeCamera}
              className="mt-3 btn btn-primary w-full"
            >
              Fechar Câmera
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="toast"
          style={{
            background: toast.success ? "var(--[#10b981])" : "#ef4444",
          }}
        >
          {toast.message}
        </div>
      )}

      <footer className="mt-8 text-center text-sm text-gray-500">
        © 2025 EloTur — Protótipo
      </footer>
    </main>
  );
}
