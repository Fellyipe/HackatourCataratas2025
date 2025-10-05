// app/page.js
"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

const mockPartners = [
  {
    id: 1,
    name: "Restaurante Sabor Regional",
    category: "Gastronomia",
    discount: "20% OFF no Almoço Executivo",
    logoText: "SR",
    logoColor: "bg-amber-500",
  },
  {
    id: 2,
    name: "Cânions Expedições",
    category: "Passeios",
    discount: "30% OFF em qualquer trilha guiada",
    logoText: "CE",
    logoColor: "bg-elotur-secondary",
  },
  {
    id: 3,
    name: "Transfer VIP Foz",
    category: "Transporte",
    discount: "R$ 15 OFF em corridas para o aeroporto",
    logoText: "TV",
    logoColor: "bg-elotur-primary",
  },
  {
    id: 4,
    name: "Loja de Artesanato Local",
    category: "Compras",
    discount: "10% de desconto em toda a loja",
    logoText: "LA",
    logoColor: "bg-purple-500",
  },
];

export default function Page() {
  const [page, setPage] = useState("home");
  const [currentGuestLink, setCurrentGuestLink] = useState(
    "elotur.com/resgate/?id=INICIO123"
  );
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
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [providerMessage, setProviderMessage] = useState("");
  const [partnerValidateMsg, setPartnerValidateMsg] = useState("");
  const [cameraStream, setCameraStream] = useState(null);

  useEffect(() => {
    // quando trocar páginas, scroll top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  function showFeedback(msg, isSuccess = true) {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(""), 2500);
  }

  // --- HOTEL ---
  function renderStats() {
    const totalIssued = voucherInventory.totalIssued;
    const totalRedeemed = voucherInventory.totalRedeemed;
    const redemptionRate =
      totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0;
    return { totalIssued, totalRedeemed, redemptionRate };
  }

  function handleGenerateVoucherLote() {
    const batch = voucherInventory.batchSize;
    if (voucherInventory.quotaRemaining < batch) {
      showFeedback(
        "❌ ERRO: Quota mensal insuficiente para gerar este lote.",
        false
      );
      return;
    }
    const lotId = "INICIO" + Math.floor(100 + Math.random() * 900);
    const newLink = `https://elotur.com/resgate/?id=${lotId}`;
    // distribuir emitidos igualmente (mock)
    setVoucherInventory((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.quotaRemaining -= batch;
      updated.totalIssued += batch;
      const perPartner = Math.floor(
        batch / Object.keys(updated.partners).length
      );
      Object.keys(updated.partners).forEach((k) => {
        updated.partners[k].issued += perPartner;
      });
      return updated;
    });
    setCurrentGuestLink(newLink);
    showFeedback(`✅ Lote de ${batch} Vouchers gerados! Link: ${lotId}`, true);
  }

  function copyToClipboard(text, elId) {
    navigator.clipboard?.writeText?.(text).then(
      () => {
        showFeedback("✅ Link copiado para a área de transferência!", true);
        const btn = document.getElementById(elId);
        if (btn) {
          const originalText = btn.textContent;
          btn.textContent = "COPIADO!";
          setTimeout(() => (btn.textContent = originalText), 1500);
        }
      },
      () => {
        showFeedback(
          "❌ Falha ao copiar. Selecione e copie manualmente.",
          false
        );
      }
    );
  }

  // --- PARTNER ---
  function handleValidateCode(e) {
    e.preventDefault();
    const codeInput = document.getElementById("validation-code");
    const code = (codeInput?.value || "").toUpperCase().trim();
    if (!code) {
      setPartnerValidateMsg("Digite o código do voucher para validar.");
      showFeedback("❌ Código vazio", false);
      return;
    }
    // regra simples de mock: começa com REST-SR- => válido (simulamos)
    if (code.startsWith("REST-SR-")) {
      const isUsed = code.endsWith("USED");
      if (isUsed) {
        setPartnerValidateMsg("❌ VOUCHER JÁ RESGATADO. Uso Duplo Bloqueado.");
        showFeedback("❌ Voucher já usado!", false);
      } else {
        // atualiza estado mock
        setVoucherInventory((prev) => {
          const upd = JSON.parse(JSON.stringify(prev));
          upd.totalRedeemed += 1;
          upd.partners[1].redeemed += 1;
          return upd;
        });
        setPartnerValidateMsg(
          `✅ VOUCHER VÁLIDO! Desconto aplicado (ID: ${code}).`
        );
        showFeedback("✅ Voucher validado!", true);
      }
    } else {
      setPartnerValidateMsg("❌ Código inválido.");
      showFeedback("❌ Código inválido!", false);
    }
    if (codeInput) codeInput.value = "";
  }

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showFeedback("❌ Câmera não suportada neste navegador.", false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(s);
      const video = document.getElementById("camera-stream");
      if (video) video.srcObject = s;
      // câmera mostrada via modal area (see below)
    } catch (err) {
      console.error(err);
      showFeedback("❌ Falha ao acessar câmera.", false);
    }
  }

  function closeCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  }

  // --- GUEST (PDF generation) ---
  async function handleGenerateGuestVoucher(partnerName, discount, codePrefix) {
    // cria um código mock e QR via serviço externo
    const voucherCode = `${codePrefix}-KORE${Math.floor(
      100 + Math.random() * 900
    )}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=elotur-voucher-${voucherCode}`;
    showFeedback("Gerando PDF do voucher...", true);

    try {
      // pega imagem do qr
      const res = await fetch(qrCodeUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Voucher Digital EloTur", 105, 20, null, null, "center");

        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        doc.text(partnerName, 105, 40, null, null, "center");

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text(discount, 105, 55, null, null, "center");
        doc.setTextColor(0, 0, 0);

        doc.addImage(base64data, "PNG", 75, 70, 60, 60);

        doc.setFontSize(12);
        doc.text(
          "Apresente este QR Code ao atendente ou informe o código abaixo:",
          105,
          145,
          null,
          null,
          "center"
        );

        doc.setFontSize(24);
        doc.setFont("courier", "bold");
        doc.rect(50, 155, 110, 20);
        doc.text(voucherCode, 105, 168, null, null, "center");

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          "Este voucher é de uso único e intransferível.",
          105,
          190,
          null,
          null,
          "center"
        );

        doc.save(`Voucher-${partnerName.replace(/\s/g, "_")}.pdf`);
        showFeedback("✅ PDF gerado e baixado.", true);
      };
    } catch (err) {
      console.error(err);
      showFeedback("❌ Erro ao gerar PDF.", false);
    }
  }

  // --- PROVIDER / FEEDBACK MOCKS (simular envio) ---
  async function handleProviderSubmit(e) {
    e.preventDefault();
    const name = e.target["provider-name"]?.value || "Novo Prestador";
    setProviderMessage(`✅ Cadastro de ${name} enviado. (simulado)`);
    setTimeout(() => {
      setProviderMessage("");
      e.target.reset();
      setPage("home");
    }, 1500);
  }

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    const usage = e.target.usage?.value || "";
    setFeedbackMessage(`Obrigado! Uso: "${usage}" (simulado).`);
    setTimeout(() => {
      setFeedbackMessage("");
      e.target.reset();
      setPage("home");
    }, 1500);
  }

  const stats = renderStats();

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="bg-elotur-primary text-white shadow-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-3xl font-extrabold cursor-pointer"
            onClick={() => setPage("home")}
          >
            <span className="text-elotur-secondary">Elo</span>Tur
          </h1>
          <nav className="space-x-4">
            <button
              className="text-gray-300 hover:text-white font-medium"
              onClick={() => setPage("hotel-dashboard")}
            >
              Hotel (Gestão)
            </button>
            <button
              className="text-gray-300 hover:text-white font-medium"
              onClick={() => setPage("partner-dashboard")}
            >
              Parceiro (Validação)
            </button>
            <button
              className="text-gray-300 hover:text-white font-medium"
              onClick={() => setPage("guest-app")}
            >
              Hóspede (Simulação)
            </button>
          </nav>
        </div>
      </header>

      {/* Home */}
      {page === "home" && (
        <section className="page-content active-page py-16 text-center bg-white rounded-xl shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <p className="text-elotur-secondary font-bold text-lg mb-2">
              ✅ Eficiência e ROI
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-elotur-primary mb-6 leading-tight">
              Gestão de Vouchers Digitais:{" "}
              <span className="text-elotur-secondary">
                Simples, Centralizada
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Clique nas abas acima para simular a dinâmica: Hotel, Parceiro e
              Hóspede.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setPage("hotel-dashboard")}
                className="bg-elotur-primary hover:bg-elotur-primary/90 text-white font-bold py-4 rounded-xl"
              >
                1. Painel do Hotel
              </button>
              <button
                onClick={() => setPage("partner-dashboard")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 rounded-xl"
              >
                2. Painel do Parceiro
              </button>
              <button
                onClick={() => setPage("guest-app")}
                className="bg-elotur-secondary hover:bg-elotur-secondary/90 text-white font-bold py-4 rounded-xl"
              >
                3. Acesso do Hóspede
              </button>
            </div>
          </div>
        </section>
      )}

      {/* HOTEL */}
      {page === "hotel-dashboard" && (
        <section className="page-content active-page">
          <h2 className="text-3xl font-extrabold text-elotur-primary mb-6">
            Painel do Hotel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-elotur-primary">
              <p className="text-sm font-semibold text-gray-500">
                Quota Mensal (Total)
              </p>
              <h3
                id="monthly-quota-card"
                className="text-4xl font-extrabold text-elotur-primary"
              >
                {voucherInventory.monthlyQuota.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-elotur-secondary">
              <p className="text-sm font-semibold text-gray-500">
                Vouchers a Gerar (Restantes)
              </p>
              <h3
                id="quota-remaining-card"
                className="text-4xl font-extrabold text-elotur-secondary"
              >
                {voucherInventory.quotaRemaining.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-elotur-primary">
              <p className="text-sm font-semibold text-gray-500">
                Vouchers Resgatados (Mês)
              </p>
              <h3
                id="total-uses-card"
                className="text-4xl font-extrabold text-elotur-primary"
              >
                {stats.totalRedeemed.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center">
              <p
                id="batch-size-info"
                className="text-sm text-gray-600 mb-2 font-medium text-center"
              >
                Gerar Lote de {voucherInventory.batchSize} Vouchers
              </p>
              <button
                id="generate-lote-button"
                onClick={handleGenerateVoucherLote}
                className="w-full bg-elotur-primary text-white font-bold py-3 rounded-lg"
              >
                Gerar Link Único de Distribuição
              </button>
              <div id="qr-code-display" className="mt-4 w-full">
                {currentGuestLink &&
                currentGuestLink !== "elotur.com/resgate/?id=INICIO123" ? (
                  <div className="text-center p-4 bg-gray-50 border border-gray-300 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">
                      LINK DE DISTRIBUIÇÃO
                    </p>
                    <div className="qr-placeholder mx-auto mb-2">
                      QR {currentGuestLink.slice(-7)}
                    </div>
                    <p
                      className="mt-2 text-elotur-primary text-sm font-semibold truncate"
                      title={currentGuestLink}
                    >
                      {currentGuestLink}
                    </p>
                    <button
                      id="copy-link-btn"
                      onClick={() =>
                        copyToClipboard(currentGuestLink, "copy-link-btn")
                      }
                      className="w-full mt-2 bg-gray-800 text-white text-xs font-bold py-2 rounded-lg"
                    >
                      COPIAR LINK
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm text-red-500">Aguardando novo lote</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Controle de Inventário por Parceiro
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm font-semibold text-gray-500">
                    Taxa de Resgate
                  </p>
                  <h3 className="text-3xl font-extrabold text-elotur-secondary">
                    {stats.redemptionRate.toFixed(1)}%
                  </h3>
                </div>
                <h4 className="text-lg font-semibold text-elotur-secondary mb-3">
                  Distribuição do Resgate
                </h4>
                <div id="usage-chart" className="p-2">
                  {mockPartners.map((p) => {
                    const inv = voucherInventory.partners[p.id];
                    const totalUsed = Object.values(
                      voucherInventory.partners
                    ).reduce((s, x) => s + x.redeemed, 0);
                    const percent =
                      totalUsed > 0 ? (inv.redeemed / totalUsed) * 100 : 0;
                    return (
                      <div key={p.id} className="mb-4">
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
                                ? "bg-elotur-secondary"
                                : p.category === "Transporte"
                                ? "bg-elotur-primary"
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
                <h4 className="text-lg font-semibold text-elotur-primary mb-3">
                  Tabela de Inventário por Parceiro
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Parceiro
                        </th>
                        <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase">
                          Emitidos
                        </th>
                        <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase">
                          Resgatados
                        </th>
                        <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase">
                          Taxa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockPartners.map((p) => {
                        const inv = voucherInventory.partners[p.id];
                        const rate =
                          inv.issued > 0
                            ? (inv.redeemed / inv.issued) * 100
                            : 0;
                        return (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 text-gray-800 font-medium">
                              {p.name}
                            </td>
                            <td className="p-4 text-center text-lg font-bold">
                              {inv.issued}
                            </td>
                            <td className="p-4 text-center text-lg font-bold text-elotur-secondary">
                              {inv.redeemed}
                            </td>
                            <td className="p-4 text-center font-bold text-sm">
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
        <section className="page-content active-page">
          <h2 className="text-3xl font-extrabold text-elotur-primary mb-6">
            Painel do Parceiro
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl font-bold text-center text-gray-800 mb-6">
              Bem-vindo(a),{" "}
              <span id="partner-name-display" className="text-elotur-primary">
                Parceiro Exemplo
              </span>
            </p>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center mb-8 border-t-4 border-elotur-secondary">
              <p className="text-sm font-semibold text-gray-500 uppercase">
                Vouchers Resgatados no Mês
              </p>
              <h3
                id="partner-metric-main"
                className="text-7xl font-extrabold text-elotur-secondary my-4"
              >
                {voucherInventory.partners[1].redeemed}
              </h3>
              <p className="text-gray-600">
                Cada resgate confirma uma nova visita trazida pelo sistema.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Validação de Voucher Digital
              </h3>
              <p className="text-gray-600 mb-4">
                Insira o código do voucher ou use a câmera para escanear o QR
                Code.
              </p>
              <form onSubmit={handleValidateCode}>
                <label
                  htmlFor="validation-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Código do Voucher
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="validation-code"
                    type="text"
                    required
                    className="w-full p-4 border-2 border-gray-300 rounded-lg text-xl text-center tracking-widest uppercase"
                    placeholder="CÓDIGO..."
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={openCamera}
                    className="p-4 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    📷
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-elotur-primary text-white font-bold py-3 rounded-lg"
                >
                  Resgatar Voucher
                </button>
              </form>
              {partnerValidateMsg && (
                <p id="validation-message" className="text-center mt-3">
                  {partnerValidateMsg}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* GUEST */}
      {page === "guest-app" && (
        <section className="page-content active-page">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl">
            <div className="bg-elotur-secondary text-white p-6 rounded-t-xl text-center">
              <p className="text-sm font-semibold mb-1">
                Vouchers Digitais EloTur
              </p>
              <h2 className="text-2xl font-extrabold">
                Olá, Hóspede do Hotel!
              </h2>
            </div>
            <div className="bg-yellow-100 text-yellow-800 p-3 text-center font-medium flex justify-center items-center space-x-2">
              <span className="text-lg">🔗</span>
              <p className="text-sm truncate">
                Acessando via link:{" "}
                <span id="guest-current-link" className="font-bold">
                  {currentGuestLink}
                </span>
              </p>
            </div>
            <div className="p-4 space-y-4 guest-card-container">
              <h3 className="text-xl font-bold text-elotur-primary mb-3">
                Seus Vouchers Disponíveis:
              </h3>
              <div id="guest-benefits-list" className="space-y-4">
                {mockPartners.map((p) => {
                  const voucherCode = `${
                    voucherInventory.partners[p.id].codePrefix
                  }-KORE769`;
                  return (
                    <div
                      key={p.id}
                      className="bg-white p-4 rounded-xl shadow-lg border border-gray-100"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl">
                          {p.category === "Gastronomia"
                            ? "🍽️"
                            : p.category === "Passeios"
                            ? "🏞️"
                            : p.category === "Transporte"
                            ? "🚌"
                            : "🎁"}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-elotur-primary">
                            {p.name}
                          </h3>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-2xl font-extrabold text-elotur-secondary">
                          {p.discount}
                        </p>
                        <p className="text-xs text-gray-500">
                          Voucher digital para uso único durante sua estadia.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleGenerateGuestVoucher(
                            p.name,
                            p.discount,
                            voucherCode
                          )
                        }
                        className="w-full rounded-lg bg-elotur-secondary hover:bg-elotur-secondary/90 text-white font-bold py-2"
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
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white p-4 rounded-lg shadow-xl relative max-w-lg w-full">
            <h3 className="text-lg font-bold mb-2 text-gray-800">
              Aponte para o QR Code
            </h3>
            <video
              id="camera-stream"
              className="w-full h-auto max-h-[60vh] rounded-md bg-gray-900"
              autoPlay
              playsInline
            ></video>
            <button
              onClick={closeCamera}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg"
            >
              Fechar Câmera
            </button>
          </div>
        </div>
      )}

      {/* Feedback little toast */}
      {feedbackMessage && (
        <div
          id="feedback-modal"
          className="fixed top-6 right-6 z-50 p-4 rounded-md shadow-md bg-elotur-secondary text-white"
        >
          {feedbackMessage}
        </div>
      )}

      {/* Provider feedback */}
      {providerMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-md shadow-md bg-elotur-secondary text-white">
          {providerMessage}
        </div>
      )}

      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm">
          <p>© 2025 EloTur. Protótipo</p>
        </div>
      </footer>
    </main>
  );
}
