"use client";

import { CheckCircle2, ImagePlus, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Mode = "free" | "premium" | "premium_plus";
type AgeLevel = "3-5" | "6-8" | "9+";
type Status = "queued" | "processing" | "completed" | "failed";

type Generation = {
  id: string;
  mode: Mode;
  age_level: AgeLevel;
  story: string | null;
  status: Status;
  png_url: string | null;
  pdf_url: string | null;
  error_message: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const stories = ["Принцесса", "Супергерой", "Космонавт", "Рыцарь", "Волшебник", "Единорог", "Дракон", "Пират", "Балерина", "Гонщик"];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("free");
  const [ageLevel, setAgeLevel] = useState<AgeLevel>("6-8");
  const [story, setStory] = useState(stories[0]);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!generationId) return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`${API_BASE_URL}/api/generations/${generationId}`);
      if (!response.ok) return;
      const next = (await response.json()) as Generation;
      setGeneration(next);
      if (next.status === "completed" || next.status === "failed") {
        window.clearInterval(timer);
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [generationId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Загрузите изображение.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setGeneration(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("mode", mode);
    formData.append("age_level", ageLevel);
    if (mode === "premium_plus") {
      formData.append("story", story);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/generations`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail ?? "Не удалось создать раскраску.");
      }
      const created = (await response.json()) as { id: string; status: Status };
      setGenerationId(created.id);
      setGeneration({
        id: created.id,
        mode,
        age_level: ageLevel,
        story: mode === "premium_plus" ? story : null,
        status: created.status,
        png_url: null,
        pdf_url: null,
        error_message: null,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ошибка генерации.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = isSubmitting || generation?.status === "queued" || generation?.status === "processing";

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">AI Coloring Book</div>
        <div>PNG 300 DPI + PDF A4</div>
      </header>

      <div className="shell">
        <section className="hero">
          <div className="intro">
            <h1>Раскраска из фото за несколько секунд</h1>
            <p>
              Загрузите фотографию ребенка, питомца, игрушки или семейного кадра. Сервис сам подготовит чистую
              черно-белую страницу для печати без промптов и сложных настроек.
            </p>
            <ul className="features">
              <li><CheckCircle2 size={20} /> Белый фон и черные контуры без серых заливок</li>
              <li><CheckCircle2 size={20} /> Уровни детализации для 3-5, 6-8 и 9+ лет</li>
              <li><CheckCircle2 size={20} /> Free, Premium cartoon и Premium+ сюжетные режимы</li>
            </ul>
          </div>

          <form className="panel form" onSubmit={submit}>
            <div className="field">
              <label>Изображение</label>
              <input
                ref={fileInput}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button className="dropzone" type="button" onClick={() => fileInput.current?.click()}>
                <ImagePlus size={36} />
                <span>
                  <strong>Выберите фото</strong> JPEG, PNG или WEBP до 20 МБ
                </span>
                {file ? <span>{file.name}</span> : null}
              </button>
            </div>

            <div className="field">
              <label>Режим</label>
              <div className="segmented">
                <button className="choice" data-active={mode === "free"} type="button" onClick={() => setMode("free")}>
                  Бесплатный
                  <small>Классическая раскраска</small>
                </button>
                <button className="choice" data-active={mode === "premium"} type="button" onClick={() => setMode("premium")}>
                  Premium
                  <small>Мультяшный стиль</small>
                </button>
                <button className="choice" data-active={mode === "premium_plus"} type="button" onClick={() => setMode("premium_plus")}>
                  Premium+
                  <small>Сюжет и роль</small>
                </button>
              </div>
            </div>

            <div className="field">
              <label>Возраст</label>
              <select className="select" value={ageLevel} onChange={(event) => setAgeLevel(event.target.value as AgeLevel)}>
                <option value="3-5">3-5 лет: толстые линии, минимум деталей</option>
                <option value="6-8">6-8 лет: средняя детализация</option>
                <option value="9+">9+: больше деталей</option>
              </select>
            </div>

            {mode === "premium_plus" ? (
              <div className="field">
                <label>Сюжет</label>
                <select className="select" value={story} onChange={(event) => setStory(event.target.value)}>
                  {stories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            ) : null}

            <button className="button" disabled={isBusy} type="submit">
              {isBusy ? <Loader2 size={18} /> : null}
              Создать раскраску
            </button>

            {error ? <div className="error">{error}</div> : null}

            {generation ? (
              <div className="result">
                <strong>Статус: {generation.status}</strong>
                {generation.error_message ? <div className="error">{generation.error_message}</div> : null}
                {generation.png_url ? <img alt="Готовая раскраска" src={generation.png_url} /> : null}
                {generation.status === "completed" ? (
                  <div className="links">
                    {generation.png_url ? <a className="link-button" href={generation.png_url} download>Скачать PNG</a> : null}
                    {generation.pdf_url ? <a className="link-button" href={generation.pdf_url} download>Скачать PDF A4</a> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>
        </section>

        <section className="admin">
          <div className="stats">
            <div className="stat"><strong>1</strong><span>бесплатная генерация</span></div>
            <div className="stat"><strong>5-15</strong><span>секунд целевое время</span></div>
            <div className="stat"><strong>A4</strong><span>PDF для печати</span></div>
            <div className="stat"><strong>3</strong><span>уровня детализации</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
