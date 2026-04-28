import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FlashcardDeck } from "@/components/flashcard/FlashcardDeck";
import { EditTitleInput } from "./EditTitleInput";
import { CourseActions } from "./CourseActions";
import { RetryButton } from "./RetryButton";
import { DeleteFlashcardButton } from "./DeleteFlashcardButton";
import { DeleteGrammarButton } from "./DeleteGrammarButton";
import { DeduplicateButton } from "./DeduplicateButton";
import { ReorderControls } from "./ReorderControls";
import { GrammarLines } from "@/components/grammar/GrammarLines";
import { LangBadge } from "@/components/ui/LangBadge";
import { ArrowLeft, BookOpen, Layers, AlertTriangle, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [courseRes, flashcardsRes, grammarRes, imagesRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).single(),
    supabase.from("flashcards").select("*").eq("course_id", id).order("display_order"),
    supabase.from("grammar_notes").select("*").eq("course_id", id).order("display_order"),
    supabase.from("images").select("id, type, processed, storage_path").eq("course_id", id),
  ]);

  if (courseRes.error || !courseRes.data) notFound();

  const course = courseRes.data;
  const flashcards = flashcardsRes.data ?? [];
  const grammarNotes = grammarRes.data ?? [];
  const images = imagesRes.data ?? [];
  const failedImages = images.filter((img) => img.processed && img.type === "unknown");

  // Generate signed URLs for all processed images
  const processedImages = images.filter((img) => img.processed && img.type !== "unknown");
  const signedUrls: Record<string, string> = {};
  if (processedImages.length > 0) {
    const { data: signed } = await supabase.storage
      .from("course-images")
      .createSignedUrls(processedImages.map((img) => img.storage_path), 3600);
    signed?.forEach((s, i) => {
      if (s.signedUrl) signedUrls[processedImages[i].id] = s.signedUrl;
    });
  }

  // Group flashcards and grammar notes by image_id
  const flashcardsByImage = flashcards.reduce<Record<string, typeof flashcards>>((acc, card) => {
    const key = card.image_id ?? "__none__";
    (acc[key] ??= []).push(card);
    return acc;
  }, {});

  const grammarByImage = grammarNotes.reduce<Record<string, typeof grammarNotes>>((acc, note) => {
    const key = note.image_id ?? "__none__";
    (acc[key] ??= []).push(note);
    return acc;
  }, {});

  // Images that have extracted content
  const sourceImages = processedImages.filter(
    (img) => flashcardsByImage[img.id]?.length || grammarByImage[img.id]?.length
  );

  // Orphaned content not linked to any image
  const orphanFlashcards = flashcardsByImage["__none__"] ?? [];
  const orphanGrammar = grammarByImage["__none__"] ?? [];

  let vocabCounter = 0;

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/queue"
        className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to queue
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <EditTitleInput
          courseId={course.id}
          currentTitle={course.title}
          fallbackDate={formatDate(course.date)}
        />
        <CourseActions courseId={course.id} status={course.status} />
      </div>

      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Badge variant={course.status === "published" ? "published" : "draft"}>
          {course.status}
        </Badge>
        <span className="text-slate-400 text-sm">
          {flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""} &middot; {grammarNotes.length} grammar note{grammarNotes.length !== 1 ? "s" : ""}
        </span>
        <DeduplicateButton courseId={course.id} />
        {failedImages.length > 0 && (
          <RetryButton courseId={course.id} failedCount={failedImages.length} />
        )}
      </div>

      {/* Failed images warning */}
      {failedImages.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          {failedImages.length} image{failedImages.length !== 1 ? "s" : ""} could not be processed. Click &quot;Retry&quot; to try again.
        </div>
      )}

      {/* Flashcard deck for study */}
      {flashcards.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-600 mb-4">
            <Layers className="w-5 h-5 text-blue-400" />
            Vocabulary deck
          </h2>
          <FlashcardDeck flashcards={flashcards} />
        </section>
      )}

      {/* Per-image source sections */}
      {sourceImages.map((img) => {
        const cards = flashcardsByImage[img.id] ?? [];
        const notes = grammarByImage[img.id] ?? [];
        const url = signedUrls[img.id];

        return (
          <section key={img.id} className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* Left: source image */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                {url ? (
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={url}
                      alt="Classroom notes"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-[4/3] text-slate-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>

              {/* Right: extracted content */}
              <div className="space-y-4">

                {/* Vocabulary from this image */}
                {cards.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-2">
                      Vocabulary
                    </p>
                    <div className="space-y-1.5">
                      {cards.map((card) => {
                        vocabCounter += 1;
                        const n = vocabCounter;
                        return (
                          <div key={card.id} className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-sm">
                            <ReorderControls
                              item={{ id: card.id, display_order: card.display_order }}
                              items={flashcards.map((c) => ({ id: c.id, display_order: c.display_order }))}
                              endpoint="/api/admin/flashcards/reorder"
                            />
                            <span className="text-blue-300 font-mono text-xs pt-0.5 w-5 shrink-0">{n}.</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-blue-800">{card.word_de}</span>
                              <div className="flex flex-wrap gap-x-3 mt-0.5">
                                <span className="flex items-center gap-1 text-blue-800 text-xs"><LangBadge lang="en" />{card.translation_en}</span>
                                <span className="flex items-center gap-1 text-blue-800 text-xs"><LangBadge lang="uk" />{card.translation_uk}</span>
                              </div>
                              {card.example_de && (
                                <p className="text-blue-400 text-xs italic mt-1">{card.example_de}</p>
                              )}
                            </div>
                            <DeleteFlashcardButton id={card.id} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grammar from this image */}
                {notes.map((note) => (
                  <div key={note.id} className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <ReorderControls
                          item={{ id: note.id, display_order: note.display_order }}
                          items={grammarNotes.map((n) => ({ id: n.id, display_order: n.display_order }))}
                          endpoint="/api/admin/grammar/reorder"
                        />
                        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest">Grammar</p>
                      </div>
                      <DeleteGrammarButton id={note.id} />
                    </div>
                    <h3 className="font-bold text-red-700 text-base mb-2 ml-6">{note.title}</h3>
                    <div className="ml-6 mb-3">
                      <GrammarLines explanation={note.explanation} />
                    </div>
                    {note.structure && (
                      <div className="bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100 ml-6">
                        <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">Struktur</p>
                        <p className="font-mono text-sm text-blue-800">{note.structure}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Orphaned content (no image link) */}
      {(orphanFlashcards.length > 0 || orphanGrammar.length > 0) && (
        <section className="mb-10">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Other content</p>

          {orphanFlashcards.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {orphanFlashcards.map((card) => {
                vocabCounter += 1;
                const n = vocabCounter;
                return (
                  <div key={card.id} className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-sm">
                    <ReorderControls
                      item={{ id: card.id, display_order: card.display_order }}
                      items={flashcards.map((c) => ({ id: c.id, display_order: c.display_order }))}
                      endpoint="/api/admin/flashcards/reorder"
                    />
                    <span className="text-blue-300 font-mono text-xs pt-0.5 w-5 shrink-0">{n}.</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-blue-800">{card.word_de}</span>
                      <div className="flex flex-wrap gap-x-3 mt-0.5">
                        <span className="text-blue-600 text-xs">🇬🇧 {card.translation_en}</span>
                        <span className="text-blue-600 text-xs">🇺🇦 {card.translation_uk}</span>
                      </div>
                      {card.example_de && (
                        <p className="text-blue-400 text-xs italic mt-1">{card.example_de}</p>
                      )}
                    </div>
                    <DeleteFlashcardButton id={card.id} />
                  </div>
                );
              })}
            </div>
          )}

          {orphanGrammar.map((note) => (
            <div key={note.id} className="bg-red-50 border border-red-100 rounded-xl p-4 mb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <ReorderControls
                    item={{ id: note.id, display_order: note.display_order }}
                    items={grammarNotes.map((n) => ({ id: n.id, display_order: n.display_order }))}
                    endpoint="/api/admin/grammar/reorder"
                  />
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-widest">Grammar</p>
                </div>
                <DeleteGrammarButton id={note.id} />
              </div>
              <h3 className="font-bold text-red-700 text-base mb-2 ml-6">{note.title}</h3>
              <div className="ml-6 mb-3">
                <GrammarLines explanation={note.explanation} />
              </div>
              {note.structure && (
                <div className="bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100 ml-6">
                  <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">Struktur</p>
                  <p className="font-mono text-sm text-blue-800">{note.structure}</p>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {flashcards.length === 0 && grammarNotes.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p>No content yet. Go back and click &quot;Generate&quot; to process the uploaded images.</p>
        </div>
      )}
    </div>
  );
}
