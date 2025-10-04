// app/page.js
"use client";
import { useEffect, useState } from "react";

const mockProviders = [
  {
    id: 1,
    name: "Passeios Aventura Max",
    category: "Passeios",
    description: "Trilhas guiadas, rapel e tirolesa na natureza exuberante.",
    contact: "(45) 99123-4567 (WhatsApp)",
    logoText: "AV",
    logoColor: "bg-elotur-green",
  },
  {
    id: 2,
    name: "Transporte VIP Prime",
    category: "Transporte",
    description: "Frota executiva com carros de luxo e motoristas bilíngues.",
    contact: "contato@vip-prime.com",
    logoText: "TX",
    logoColor: "bg-elotur-blue",
  },
  {
    id: 3,
    name: "Sabor Regional Gourmet",
    category: "Gastronomia",
    description: "Restaurante com foco em culinária regional inovadora.",
    contact: "(45) 3578-1234",
    logoText: "RS",
    logoColor: "bg-amber-500",
  },
  {
    id: 4,
    name: "Guias Certificados Local",
    category: "Guias",
    description:
      "Guias credenciados para Foz e Região. Pacotes personalizados.",
    contact: "guias@local.com",
    logoText: "GS",
    logoColor: "bg-red-500",
  },
  {
    id: 5,
    name: "Mega Eventos Corporativos",
    category: "Eventos",
    description:
      "Organização de congressos, feiras e shows com estrutura completa.",
    contact: "(45) 98765-4321",
    logoText: "EV",
    logoColor: "bg-indigo-500",
  },
  {
    id: 6,
    name: "Transfer Rápido e Seguro",
    category: "Transporte",
    description: "Serviço de transfer aeroporto/hotel 24h.",
    contact: "(45) 99999-0000",
    logoText: "TR",
    logoColor: "bg-elotur-blue",
  },
  {
    id: 7,
    name: "Cicloturismo Verde",
    category: "Passeios",
    description: "Aluguel de bicicletas e roteiros de cicloturismo.",
    contact: "(45) 98888-1111",
    logoText: "CT",
    logoColor: "bg-elotur-green",
  },
];

export default function Page() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [providerMessage, setProviderMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    // quando trocar p/ hotel, já poderíamos pré-renderizar lista etc.
  }, [page]);

  function navigate(to) {
    setPage(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function filteredProviders() {
    return mockProviders.filter((p) => {
      const catMatch =
        categoryFilter === "Todos" || p.category === categoryFilter;
      const s = search.trim().toLowerCase();
      const searchMatch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s);
      return catMatch && searchMatch;
    });
  }

  function handleContact(name, isPremium, contact) {
    const messageType = isPremium
      ? `diretamente: ${contact}`
      : "via formulário de pré-contato (simulado)";
    alert(`Iniciando contato com ${name} ${messageType}`);
  }

  async function handleProviderSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form["provider-name"].value,
      category: form["provider-category"].value,
      description: form["provider-description"].value,
      contact: form["provider-contact"].value,
      // is_premium: false // opcional
    };

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao salvar");
      setProviderMessage("✅ Cadastro enviado com sucesso!");
      setTimeout(() => {
        setProviderMessage("");
        form.reset();
        navigate("home");
      }, 1500);
    } catch (err) {
      setProviderMessage("Erro: " + err.message);
    }
  }

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      usage: form["usage"]?.value || "",
      most_liked: form["most-liked"]?.value || "",
      to_change: form["to-change"]?.value || "",
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao enviar feedback");
      setFeedbackMessage("✅ Feedback enviado com sucesso!");
      setTimeout(() => {
        setFeedbackMessage("");
        form.reset();
        navigate("home");
      }, 1500);
    } catch (err) {
      setFeedbackMessage("Erro: " + err.message);
    }
  }

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-3xl font-extrabold text-elotur-blue cursor-pointer"
            onClick={() => navigate("home")}
          >
            <span className="text-elotur-green">Elo</span>Tur
          </h1>
          <nav className="space-x-4">
            <button
              className="nav-link text-gray-600 hover:text-elotur-blue font-medium"
              onClick={() => navigate("home")}
            >
              Home
            </button>
            <button
              className="nav-link text-gray-600 hover:text-elotur-blue font-medium"
              onClick={() => navigate("hotel")}
            >
              Sou Hotel
            </button>
            <button
              className="nav-link text-gray-600 hover:text-elotur-blue font-medium"
              onClick={() => navigate("provider")}
            >
              Sou Prestador
            </button>
            <button
              className="nav-link text-gray-600 hover:text-elotur-blue font-medium hidden sm:inline"
              onClick={() => navigate("about")}
            >
              Sobre
            </button>
            <button
              className="nav-link text-gray-600 hover:text-elotur-blue font-medium hidden sm:inline"
              onClick={() => navigate("feedback")}
            >
              Feedback
            </button>
          </nav>
        </div>
      </header>

      {/* Home */}
      {page === "home" && (
        <section className="py-16 text-center bg-white rounded-xl shadow-lg">
          <div className="max-w-3xl mx-auto">
            <p className="text-elotur-green font-semibold text-lg mb-2">
              🤝 Parcerias que fortalecem o destino
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
              <span className="text-elotur-blue">Conectando</span> o turismo
              local.
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              A EloTur é a sua plataforma de networking e cooperação no trade
              turístico.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => navigate("hotel")}
                className="w-full sm:w-auto bg-elotur-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              >
                Sou Hotel & Buscar Prestadores
              </button>
              <button
                onClick={() => navigate("provider")}
                className="w-full sm:w-auto bg-elotur-green hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              >
                Sou Prestador de Serviço & Cadastrar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Hotel - Lista */}
      {page === "hotel" && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Diretório de Prestadores
          </h2>
          <p className="text-gray-600 mb-8">
            Encontre e contate parceiros locais de confiança.
          </p>

          <div className="bg-white p-4 rounded-xl shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-elotur-blue focus:border-elotur-blue"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full md:w-auto bg-white"
            >
              <option value="Todos">Todas as Categorias</option>
              <option value="Passeios">Passeios e Aventura</option>
              <option value="Transporte">Transporte e Transfer</option>
              <option value="Gastronomia">Gastronomia</option>
              <option value="Eventos">Eventos e Shows</option>
              <option value="Guias">Guias de Turismo</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders().length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-500 bg-gray-100 rounded-lg">
                Nenhum prestador encontrado com os filtros aplicados.
              </div>
            ) : (
              filteredProviders().map((provider) => {
                const isPremium = provider.id < 3;
                const premiumBadge = isPremium ? (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    PREMIUM
                  </span>
                ) : null;
                const contactBtnClass = isPremium
                  ? "bg-elotur-blue hover:bg-blue-600"
                  : "bg-elotur-green hover:bg-emerald-600";
                const premiumStyle = isPremium
                  ? "border-elotur-blue ring-4 ring-elotur-blue/20 transform hover:scale-[1.03]"
                  : "border-gray-200 hover:shadow-lg";

                return (
                  <div
                    key={provider.id}
                    className={`bg-white p-6 rounded-xl shadow-md border ${premiumStyle} transition duration-300 relative`}
                  >
                    {premiumBadge}
                    <div className="flex items-start space-x-4 mb-4">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${provider.logoColor} flex-shrink-0 shadow-lg`}
                      >
                        {provider.logoText}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-elotur-green font-medium">
                          {provider.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                      {provider.description}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Localização:{" "}
                      <span className="font-semibold">
                        Centro/Região Turística
                      </span>
                    </p>
                    <button
                      onClick={() =>
                        handleContact(
                          provider.name,
                          isPremium,
                          provider.contact
                        )
                      }
                      className={`w-full text-white font-bold py-2 rounded-lg transition duration-300 ${contactBtnClass}`}
                    >
                      {isPremium
                        ? `📞 Contato Direto: ${provider.contact}`
                        : "Entrar em Contato (via EloTur)"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Provider - Cadastro */}
      {page === "provider" && (
        <section>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Cadastre-se na EloTur
            </h2>
            <p className="text-gray-600 mb-8">Aumente sua visibilidade...</p>

            <form id="provider-form" onSubmit={handleProviderSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <input
                  name="provider-name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-elotur-green focus:border-elotur-green"
                  placeholder="Ex: Cânions Expedições"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria de Serviço
                </label>
                <select
                  name="provider-category"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-elotur-green focus:border-elotur-green bg-white"
                >
                  <option value="">Selecione uma Categoria</option>
                  <option value="Passeios">Passeios e Aventura</option>
                  <option value="Transporte">Transporte e Transfer</option>
                  <option value="Gastronomia">Gastronomia</option>
                  <option value="Eventos">Eventos e Shows</option>
                  <option value="Guias">Guias de Turismo</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Curta
                </label>
                <textarea
                  name="provider-description"
                  required
                  maxLength="100"
                  rows="2"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="O que sua empresa oferece de melhor?"
                ></textarea>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contato (WhatsApp/Email)
                </label>
                <input
                  name="provider-contact"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: (99) 99999-9999 ou contato@empresa.com"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto/Logo (Simulação de Upload)
                </label>
                <input
                  type="file"
                  name="provider-logo"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-elotur-green hover:bg-emerald-600 text-white font-bold py-3 rounded-lg"
              >
                Enviar Cadastro para Avaliação
              </button>
              {providerMessage && (
                <p className="mt-4 text-center text-sm font-medium text-elotur-green">
                  {providerMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      )}

      {/* About */}
      {page === "about" && (
        <section>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-elotur-blue mb-4">
              Nossa Missão: Fortalecer o Destino
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              A EloTur nasceu da necessidade de transformar o cenário turístico
              local...
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-elotur-green mr-3 text-3xl">🎯</span>{" "}
                  Integração e Cooperação
                </h3>
                <p className="text-gray-600">
                  Nosso objetivo é integrar hotéis e prestadores de serviços...
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-elotur-green mr-3 text-3xl">🚀</span>{" "}
                  Modelo de Negócio
                </h3>
                <p className="text-gray-600">
                  A plataforma opera com um modelo freemium...
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feedback */}
      {page === "feedback" && (
        <section>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Diga-nos o que você achou!
            </h2>
            <form id="feedback-form" onSubmit={handleFeedbackSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Você usaria essa plataforma no seu dia a dia?
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="usage"
                      value="Sim, com certeza"
                      required
                      className="form-radio text-elotur-blue h-5 w-5 rounded-full"
                    />
                    <span className="ml-2 text-gray-700">Sim, com certeza</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="usage"
                      value="Talvez, se tiver mais parceiros"
                      className="form-radio text-elotur-blue h-5 w-5 rounded-full"
                    />
                    <span className="ml-2 text-gray-700">
                      Talvez, se tiver mais parceiros
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="usage"
                      value="Não, prefiro métodos tradicionais"
                      className="form-radio text-elotur-blue h-5 w-5 rounded-full"
                    />
                    <span className="ml-2 text-gray-700">
                      Não, prefiro métodos tradicionais
                    </span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. O que mais gostou na proposta?
                </label>
                <textarea
                  id="most-liked"
                  required
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="A clareza, a lista de parceiros..."
                ></textarea>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. O que você mudaria?
                </label>
                <textarea
                  id="to-change"
                  required
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Sugestões..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-elotur-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg"
              >
                Enviar Feedback
              </button>
              {feedbackMessage && (
                <p className="mt-4 text-center text-sm font-medium text-elotur-blue">
                  {feedbackMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
          <div className="mb-4 sm:mb-0">
            <h4 className="text-xl font-bold">EloTur</h4>
            <p className="text-gray-400 text-sm">
              © 2025 EloTur. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-300 hover:text-elotur-green transition duration-300"
            >
              Contato: contato@elotur.com
            </a>
            <button
              onClick={() => navigate("about")}
              className="text-gray-300 hover:text-elotur-green transition duration-300"
            >
              Política de Privacidade
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
