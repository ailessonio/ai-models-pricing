import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const API_URL = "https://ailesson.io/llm-price/api/models";
const SITE_URL = "https://ailesson.io";
const REPOSITORY_URL = "https://github.com/ailessonio/ai-models-pricing";
const MAX_TOKEN_PRICE = 0.001;

export const LOCALES = ["en", "zh", "ja", "de", "fr", "es", "ko", "pt", "ru", "ar"];

const LANGUAGE_NAMES = {
  en: "English",
  zh: "简体中文",
  ja: "日本語",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  ko: "한국어",
  pt: "Português",
  ru: "Русский",
  ar: "العربية",
};

const COPY = {
  en: {
    tagline: "Daily-updated AI model and LLM API pricing in one searchable list.",
    intro: "Compare input and output token prices, context windows, providers, modalities, and release dates. Prices are shown in USD per 1 million tokens.",
    cta: "Compare models and calculate costs on AILesson",
    updated: "Data last changed",
    source: "Source",
    models: "paid models",
    providers: "providers",
    model: "Model",
    provider: "Provider",
    input: "Input / 1M tokens",
    output: "Output / 1M tokens",
    context: "Context",
    modalities: "Input modalities",
    released: "Released",
    notes: "Notes",
    noteText: "The list follows the paid-model view on AILesson. Prices can change and may exclude provider-specific fees, discounts, caching, tools, images, or other usage charges. Check the linked model page before making cost decisions.",
    data: "Download the normalized JSON snapshot",
  },
  zh: {
    tagline: "每日更新的 AI 模型与 LLM API 价格列表。",
    intro: "比较输入与输出 Token 价格、上下文窗口、提供商、模态和发布日期。价格单位为每 100 万 Token 的美元价格。",
    cta: "在 AILesson 比较模型并计算成本",
    updated: "数据最近变化",
    source: "来源",
    models: "个付费模型",
    providers: "个提供商",
    model: "模型",
    provider: "提供商",
    input: "输入 / 100 万 Token",
    output: "输出 / 100 万 Token",
    context: "上下文",
    modalities: "输入模态",
    released: "发布日期",
    notes: "说明",
    noteText: "列表与 AILesson 的付费模型视图保持一致。价格可能变化，也可能不包含提供商费用、折扣、缓存、工具、图片或其他用量费用。做成本决策前请检查链接中的模型页面。",
    data: "下载规范化 JSON 快照",
  },
  ja: {
    tagline: "毎日更新されるAIモデルとLLM APIの料金一覧です。",
    intro: "入力・出力トークン料金、コンテキスト長、プロバイダー、モダリティ、公開日を比較できます。料金は100万トークンあたりの米ドルです。",
    cta: "AILessonでモデルを比較し、コストを計算",
    updated: "データの最終変更日",
    source: "データ元",
    models: "有料モデル",
    providers: "プロバイダー",
    model: "モデル",
    provider: "プロバイダー",
    input: "入力 / 100万トークン",
    output: "出力 / 100万トークン",
    context: "コンテキスト",
    modalities: "入力モダリティ",
    released: "公開日",
    notes: "注意事項",
    noteText: "一覧はAILessonの有料モデル表示に準拠します。料金は変更される場合があり、プロバイダー固有の手数料、割引、キャッシュ、ツール、画像などの料金を含まないことがあります。判断前にリンク先をご確認ください。",
    data: "正規化済みJSONスナップショットをダウンロード",
  },
  de: {
    tagline: "Täglich aktualisierte Preise für KI-Modelle und LLM-APIs in einer Liste.",
    intro: "Vergleiche Ein- und Ausgabetokenpreise, Kontextfenster, Anbieter, Modalitäten und Veröffentlichungsdaten. Alle Preise sind in USD pro 1 Million Token angegeben.",
    cta: "Modelle vergleichen und Kosten auf AILesson berechnen",
    updated: "Letzte Datenänderung",
    source: "Quelle",
    models: "kostenpflichtige Modelle",
    providers: "Anbieter",
    model: "Modell",
    provider: "Anbieter",
    input: "Eingabe / 1 Mio. Token",
    output: "Ausgabe / 1 Mio. Token",
    context: "Kontext",
    modalities: "Eingabemodalitäten",
    released: "Veröffentlicht",
    notes: "Hinweise",
    noteText: "Die Liste entspricht der Ansicht kostenpflichtiger Modelle auf AILesson. Preise können sich ändern und zusätzliche Gebühren, Rabatte, Caching, Tools oder Bilder ausschließen. Prüfe vor Kostenentscheidungen die verlinkte Modellseite.",
    data: "Normalisierten JSON-Snapshot herunterladen",
  },
  fr: {
    tagline: "Liste des tarifs des modèles d’IA et API LLM, mise à jour chaque jour.",
    intro: "Comparez les prix des jetons d’entrée et de sortie, les fenêtres de contexte, les fournisseurs, les modalités et les dates de sortie. Les prix sont en USD par million de jetons.",
    cta: "Comparer les modèles et calculer les coûts sur AILesson",
    updated: "Dernière modification des données",
    source: "Source",
    models: "modèles payants",
    providers: "fournisseurs",
    model: "Modèle",
    provider: "Fournisseur",
    input: "Entrée / 1 M de jetons",
    output: "Sortie / 1 M de jetons",
    context: "Contexte",
    modalities: "Modalités d’entrée",
    released: "Sortie",
    notes: "Remarques",
    noteText: "La liste suit la vue des modèles payants d’AILesson. Les prix peuvent changer et exclure certains frais, remises, coûts de cache, d’outils ou d’images. Consultez la page du modèle avant toute décision de coût.",
    data: "Télécharger l’instantané JSON normalisé",
  },
  es: {
    tagline: "Precios de modelos de IA y API de LLM actualizados a diario.",
    intro: "Compara precios de tokens de entrada y salida, ventanas de contexto, proveedores, modalidades y fechas de lanzamiento. Los precios están en USD por 1 millón de tokens.",
    cta: "Comparar modelos y calcular costes en AILesson",
    updated: "Último cambio de datos",
    source: "Fuente",
    models: "modelos de pago",
    providers: "proveedores",
    model: "Modelo",
    provider: "Proveedor",
    input: "Entrada / 1 M de tokens",
    output: "Salida / 1 M de tokens",
    context: "Contexto",
    modalities: "Modalidades de entrada",
    released: "Lanzamiento",
    notes: "Notas",
    noteText: "La lista sigue la vista de modelos de pago de AILesson. Los precios pueden cambiar y excluir tarifas, descuentos, caché, herramientas, imágenes u otros cargos. Revisa la página enlazada antes de tomar decisiones de coste.",
    data: "Descargar la instantánea JSON normalizada",
  },
  ko: {
    tagline: "매일 업데이트되는 AI 모델 및 LLM API 가격 목록입니다.",
    intro: "입출력 토큰 가격, 컨텍스트 길이, 제공업체, 모달리티와 출시일을 비교하세요. 가격은 100만 토큰당 미국 달러입니다.",
    cta: "AILesson에서 모델 비교 및 비용 계산",
    updated: "데이터 최종 변경일",
    source: "출처",
    models: "유료 모델",
    providers: "제공업체",
    model: "모델",
    provider: "제공업체",
    input: "입력 / 100만 토큰",
    output: "출력 / 100만 토큰",
    context: "컨텍스트",
    modalities: "입력 모달리티",
    released: "출시일",
    notes: "참고",
    noteText: "목록은 AILesson의 유료 모델 보기를 따릅니다. 가격은 변경될 수 있으며 제공업체별 수수료, 할인, 캐시, 도구, 이미지 등의 비용을 포함하지 않을 수 있습니다. 비용 결정 전에 연결된 모델 페이지를 확인하세요.",
    data: "정규화된 JSON 스냅샷 다운로드",
  },
  pt: {
    tagline: "Preços de modelos de IA e APIs LLM atualizados diariamente.",
    intro: "Compare preços de tokens de entrada e saída, janelas de contexto, fornecedores, modalidades e datas de lançamento. Os preços são apresentados em USD por 1 milhão de tokens.",
    cta: "Comparar modelos e calcular custos no AILesson",
    updated: "Última alteração dos dados",
    source: "Fonte",
    models: "modelos pagos",
    providers: "fornecedores",
    model: "Modelo",
    provider: "Fornecedor",
    input: "Entrada / 1 M de tokens",
    output: "Saída / 1 M de tokens",
    context: "Contexto",
    modalities: "Modalidades de entrada",
    released: "Lançamento",
    notes: "Notas",
    noteText: "A lista segue a vista de modelos pagos do AILesson. Os preços podem mudar e excluir taxas, descontos, cache, ferramentas, imagens ou outros custos. Consulte a página do modelo antes de tomar decisões de custo.",
    data: "Baixar o snapshot JSON normalizado",
  },
  ru: {
    tagline: "Ежедневно обновляемый список цен на модели ИИ и LLM API.",
    intro: "Сравнивайте цены входных и выходных токенов, контекст, поставщиков, модальности и даты выпуска. Цены указаны в долларах США за 1 миллион токенов.",
    cta: "Сравнить модели и рассчитать стоимость на AILesson",
    updated: "Последнее изменение данных",
    source: "Источник",
    models: "платных моделей",
    providers: "поставщиков",
    model: "Модель",
    provider: "Поставщик",
    input: "Вход / 1 млн токенов",
    output: "Выход / 1 млн токенов",
    context: "Контекст",
    modalities: "Входные модальности",
    released: "Выпуск",
    notes: "Примечания",
    noteText: "Список соответствует платным моделям на AILesson. Цены могут меняться и не включать отдельные комиссии, скидки, кэширование, инструменты или изображения. Перед решением проверьте страницу модели.",
    data: "Скачать нормализованный снимок JSON",
  },
  ar: {
    tagline: "قائمة أسعار نماذج الذكاء الاصطناعي وواجهات LLM تُحدَّث يوميًا.",
    intro: "قارن أسعار رموز الإدخال والإخراج وسعة السياق والمزودين والوسائط وتواريخ الإصدار. الأسعار بالدولار الأمريكي لكل مليون رمز.",
    cta: "قارن النماذج واحسب التكلفة على AILesson",
    updated: "آخر تغيير للبيانات",
    source: "المصدر",
    models: "نموذجًا مدفوعًا",
    providers: "مزودين",
    model: "النموذج",
    provider: "المزود",
    input: "الإدخال / مليون رمز",
    output: "الإخراج / مليون رمز",
    context: "السياق",
    modalities: "وسائط الإدخال",
    released: "الإصدار",
    notes: "ملاحظات",
    noteText: "تتبع القائمة عرض النماذج المدفوعة في AILesson. قد تتغير الأسعار وقد لا تشمل رسوم المزود أو الخصومات أو التخزين المؤقت أو الأدوات أو الصور. راجع صفحة النموذج المرتبطة قبل اتخاذ قرارات التكلفة.",
    data: "نزّل لقطة JSON المنظّمة",
  },
};

const PROVIDER_NAMES = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  qwen: "Qwen",
  mistralai: "Mistral AI",
  deepseek: "DeepSeek",
  "z-ai": "Z.ai",
  nvidia: "NVIDIA",
  minimax: "MiniMax",
  "meta-llama": "Meta",
  meta: "Meta",
  moonshotai: "Moonshot AI",
  openrouter: "OpenRouter",
  "x-ai": "xAI",
  cohere: "Cohere",
  amazon: "Amazon",
  perplexity: "Perplexity",
  microsoft: "Microsoft",
  tencent: "Tencent",
  baidu: "Baidu",
};

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function tokenPrice(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= MAX_TOKEN_PRICE ? number : null;
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export function normalizePayload(value) {
  const data = Array.isArray(record(value)?.data) ? value.data : [];
  const models = [];
  const ids = new Set();
  for (const item of data) {
    const source = record(item);
    const pricing = record(source?.pricing);
    const architecture = record(source?.architecture);
    const topProvider = record(source?.top_provider);
    const inputPrice = tokenPrice(pricing?.prompt);
    const outputPrice = tokenPrice(pricing?.completion);
    if (
      !source ||
      typeof source.id !== "string" ||
      !/^[A-Za-z0-9~_.:-]+\/[A-Za-z0-9~_.:%+-]+$/.test(source.id) ||
      typeof source.name !== "string" ||
      !source.name.trim() ||
      source.name.length > 160 ||
      inputPrice === null ||
      outputPrice === null ||
      ids.has(source.id)
    ) {
      continue;
    }
    ids.add(source.id);
    models.push({
      id: source.id,
      name: source.name.trim(),
      created: finiteNumber(source.created),
      contextLength: finiteNumber(source.context_length),
      inputModalities: stringArray(architecture?.input_modalities),
      outputModalities: stringArray(architecture?.output_modalities),
      inputPrice,
      outputPrice,
      maxCompletionTokens: topProvider?.max_completion_tokens == null ? null : finiteNumber(topProvider.max_completion_tokens),
    });
  }
  if (!models.length) throw new Error("AILesson returned no valid model pricing records.");
  return models.sort((left, right) => left.id.localeCompare(right.id));
}

function providerId(modelId) {
  return (modelId.split("/")[0] || "unknown").replace(/^~/, "").toLowerCase();
}

function providerName(modelId) {
  const id = providerId(modelId);
  return PROVIDER_NAMES[id] ?? id.split("-").filter(Boolean).map((part) => part === "ai" ? "AI" : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
}

function modelPath(modelId) {
  return modelId.replace(/[/.:]|%/g, "-");
}

function readmeFilename(locale) {
  if (locale === "en") return "README.md";
  if (locale === "zh") return "README.zh-CN.md";
  return `README.${locale}.md`;
}

function localizedPath(locale, suffix = "") {
  return `${SITE_URL}${locale === "en" ? "" : `/${locale}`}/llm-price${suffix}`;
}

function escapeCell(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function formatPrice(price) {
  const value = price * 1_000_000;
  return `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(value)}`;
}

function formatInteger(value) {
  return value ? new Intl.NumberFormat("en-US").format(value) : "—";
}

function releaseDate(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp * 1000);
  return Number.isNaN(date.valueOf()) ? "—" : date.toISOString().slice(0, 10);
}

function languageSwitcher(locale) {
  return `**${locale === "zh" ? "语言" : "Languages"}:** ${LOCALES.map((item) => `[${LANGUAGE_NAMES[item]}](${readmeFilename(item)})`).join(" · ")}`;
}

export function renderReadme(locale, snapshot) {
  const copy = COPY[locale];
  const paid = snapshot.models
    .filter((model) => model.inputPrice > 0 || model.outputPrice > 0)
    .sort((left, right) => right.created - left.created || left.id.localeCompare(right.id));
  const providers = new Set(paid.map((model) => providerId(model.id))).size;
  const rows = paid.map((model) => {
    const href = localizedPath(locale, `/model/${encodeURIComponent(modelPath(model.id))}`);
    const modalities = model.inputModalities.length ? model.inputModalities.join(", ") : "—";
    return `| [${escapeCell(model.name)}](${href}) | ${escapeCell(providerName(model.id))} | ${formatPrice(model.inputPrice)} | ${formatPrice(model.outputPrice)} | ${formatInteger(model.contextLength)} | ${escapeCell(modalities)} | ${releaseDate(model.created)} |`;
  });
  return [
    "<!-- Generated by scripts/update.mjs. Do not edit pricing rows manually. -->",
    "",
    "# AI Models Pricing — LLM API Price List",
    "",
    languageSwitcher(locale),
    "",
    `[![Daily pricing update](${REPOSITORY_URL}/actions/workflows/update-pricing.yml/badge.svg)](${REPOSITORY_URL}/actions/workflows/update-pricing.yml)`,
    "",
    copy.tagline,
    "",
    copy.intro,
    "",
    `**[${copy.cta}](${localizedPath(locale)})**`,
    "",
    `**${copy.updated}:** ${snapshot.updatedAt.slice(0, 10)} · **${paid.length} ${copy.models}** · **${providers} ${copy.providers}**`,
    "",
    `| ${copy.model} | ${copy.provider} | ${copy.input} | ${copy.output} | ${copy.context} | ${copy.modalities} | ${copy.released} |`,
    "| --- | --- | ---: | ---: | ---: | --- | ---: |",
    ...rows,
    "",
    `## ${copy.notes}`,
    "",
    copy.noteText,
    "",
    `**${copy.source}:** [AILesson LLM Price API](${API_URL}) · [${copy.data}](data/models.json)`,
    "",
    "Code and documentation are available under the [MIT License](LICENSE). Pricing data remains subject to its source terms.",
    "",
  ].join("\n");
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeIfChanged(file, content) {
  let current = null;
  try {
    current = await readFile(file, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (current === content) return false;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  return true;
}

export async function updateRepository({
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  fetchImpl = fetch,
  now = new Date(),
} = {}) {
  const response = await fetchImpl(API_URL, {
    headers: { Accept: "application/json", "User-Agent": "ailesson-ai-models-pricing" },
  });
  if (!response.ok) throw new Error(`AILesson pricing API returned ${response.status}.`);
  const models = normalizePayload(await response.json());
  const snapshotFile = path.join(root, "data", "models.json");
  const previous = await readJson(snapshotFile);
  const unchanged = previous && JSON.stringify(previous.models) === JSON.stringify(models);
  const snapshot = {
    schemaVersion: 1,
    source: API_URL,
    updatedAt: unchanged ? previous.updatedAt : now.toISOString(),
    modelCount: models.length,
    paidModelCount: models.filter((model) => model.inputPrice > 0 || model.outputPrice > 0).length,
    models,
  };
  const changed = [];
  if (await writeIfChanged(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`)) changed.push("data/models.json");
  for (const locale of LOCALES) {
    const filename = readmeFilename(locale);
    if (await writeIfChanged(path.join(root, filename), renderReadme(locale, snapshot))) changed.push(filename);
  }
  return { changed, snapshot };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  updateRepository()
    .then(({ changed, snapshot }) => {
      console.log(`Models: ${snapshot.modelCount}; paid: ${snapshot.paidModelCount}; changed files: ${changed.length}`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
