"use client";

import { useState } from "react";
import { saveSiteContentAction } from "@/app/admin/actions";
import { AdminImageUpload } from "@/components/admin-image-upload";
import type {
  AnnouncementItem,
  GalleryItem,
  MassScheduleItem,
  NewsItem,
  PastoralUnit,
  PriestProfile,
  ReflectionItem,
  SiteContent
} from "@/lib/content";

type AdminSectionKey =
  | "general"
  | "mass"
  | "announcements"
  | "news"
  | "reflections"
  | "pastoral"
  | "priests"
  | "gallery";

type AdminSectionEditorProps = {
  initialContent: SiteContent;
  section: AdminSectionKey;
  redirectTo: string;
  uploadsEnabled: boolean;
};

const galleryTones = ["gold", "stone", "olive", "rose"];

function toLines(value: string[]) {
  return value.join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createMassDraft(): MassScheduleItem {
  return {
    id: `mass-${Date.now()}`,
    title: "",
    day: "",
    time: "",
    detail: ""
  };
}

function createAnnouncementDraft(): AnnouncementItem {
  return {
    id: `announcement-${Date.now()}`,
    title: "",
    detail: "",
    date: "",
    tag: ""
  };
}

function createNewsDraft(): NewsItem {
  return {
    id: `news-${Date.now()}`,
    slug: "",
    label: "News",
    title: "",
    description: "",
    excerpt: "",
    content: "",
    date: "",
    location: "",
    image: "",
    published: true,
    likes: 0
  };
}

function createReflectionDraft(): ReflectionItem {
  return {
    id: `reflection-${Date.now()}`,
    category: "",
    title: "",
    excerpt: "",
    date: "",
    author: ""
  };
}

function createPastoralDraft(): PastoralUnit {
  return {
    slug: `pastoral-${Date.now()}`,
    shortName: "",
    name: "",
    description: "",
    lead: "",
    focus: []
  };
}

function createPriestDraft(): PriestProfile {
  return {
    id: `priest-${Date.now()}`,
    name: "",
    title: "",
    motto: "",
    bio: [],
    image: ""
  };
}

function createGalleryDraft(): GalleryItem {
  return {
    id: `gallery-${Date.now()}`,
    title: "",
    period: "",
    detail: "",
    tone: "gold"
  };
}

function hasValue(values: string[]) {
  return values.some((value) => value.trim().length > 0);
}

function SectionEmptyState({ label }: { label: string }) {
  return (
    <div className="admin-card admin-card--empty">
      <p className="admin-hint">No {label.toLowerCase()} added yet.</p>
    </div>
  );
}

function ImagePreview({ image, title }: { image?: string; title: string }) {
  if (!image) {
    return null;
  }

  return (
    <div
      className="admin-image-preview"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(21, 14, 9, 0.08), rgba(21, 14, 9, 0.18)), url(${image})` }}
      aria-label={title}
    />
  );
}

export function AdminSectionEditor({
  initialContent,
  section,
  redirectTo,
  uploadsEnabled
}: AdminSectionEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [massDraft, setMassDraft] = useState(createMassDraft);
  const [announcementDraft, setAnnouncementDraft] = useState(createAnnouncementDraft);
  const [newsDraft, setNewsDraft] = useState(createNewsDraft);
  const [reflectionDraft, setReflectionDraft] = useState(createReflectionDraft);
  const [pastoralDraft, setPastoralDraft] = useState(createPastoralDraft);
  const [priestDraft, setPriestDraft] = useState(createPriestDraft);
  const [galleryDraft, setGalleryDraft] = useState(createGalleryDraft);

  function updateTopLevel<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateMassSchedule(index: number, key: keyof MassScheduleItem, value: string) {
    setContent((current) => ({
      ...current,
      massSchedule: current.massSchedule.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updateAnnouncement(index: number, key: keyof AnnouncementItem, value: string) {
    setContent((current) => ({
      ...current,
      announcements: current.announcements.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updateNews(index: number, key: keyof NewsItem, value: string) {
    setContent((current) => ({
      ...current,
      newsItems: current.newsItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updateReflection(index: number, key: keyof ReflectionItem, value: string) {
    setContent((current) => ({
      ...current,
      reflections: current.reflections.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updatePastoral(index: number, key: keyof PastoralUnit, value: string) {
    setContent((current) => ({
      ...current,
      pastoralUnits: current.pastoralUnits.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updatePastoralFocus(index: number, value: string) {
    setContent((current) => ({
      ...current,
      pastoralUnits: current.pastoralUnits.map((item, itemIndex) =>
        itemIndex === index ? { ...item, focus: fromLines(value) } : item
      )
    }));
  }

  function updatePriest(index: number, key: keyof PriestProfile, value: string) {
    setContent((current) => ({
      ...current,
      priests: current.priests.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updatePriestBio(index: number, value: string) {
    setContent((current) => ({
      ...current,
      priests: current.priests.map((item, itemIndex) =>
        itemIndex === index ? { ...item, bio: fromLines(value) } : item
      )
    }));
  }

  function updateGallery(index: number, key: keyof GalleryItem, value: string) {
    setContent((current) => ({
      ...current,
      gallery: current.gallery.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function removeAt<
    K extends
      | "massSchedule"
      | "announcements"
      | "newsItems"
      | "reflections"
      | "pastoralUnits"
      | "priests"
      | "gallery"
  >(key: K, index: number) {
    setContent((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function addMassScheduleItem() {
    if (!hasValue([massDraft.title, massDraft.day, massDraft.time, massDraft.detail])) {
      return;
    }

    setContent((current) => ({
      ...current,
      massSchedule: [...current.massSchedule, massDraft]
    }));
    setMassDraft(createMassDraft());
  }

  function addAnnouncement() {
    if (!hasValue([announcementDraft.title, announcementDraft.detail, announcementDraft.date])) {
      return;
    }

    setContent((current) => ({
      ...current,
      announcements: [...current.announcements, announcementDraft]
    }));
    setAnnouncementDraft(createAnnouncementDraft());
  }

  function addNews() {
    if (!hasValue([newsDraft.title, newsDraft.description, newsDraft.date, newsDraft.location])) {
      return;
    }

    setContent((current) => ({
      ...current,
      newsItems: [...current.newsItems, newsDraft]
    }));
    setNewsDraft(createNewsDraft());
  }

  function addReflection() {
    if (!hasValue([reflectionDraft.title, reflectionDraft.excerpt, reflectionDraft.author])) {
      return;
    }

    setContent((current) => ({
      ...current,
      reflections: [...current.reflections, reflectionDraft]
    }));
    setReflectionDraft(createReflectionDraft());
  }

  function addPastoralUnit() {
    if (!hasValue([pastoralDraft.name, pastoralDraft.description, pastoralDraft.lead])) {
      return;
    }

    setContent((current) => ({
      ...current,
      pastoralUnits: [...current.pastoralUnits, pastoralDraft]
    }));
    setPastoralDraft(createPastoralDraft());
  }

  function addPriest() {
    if (!hasValue([priestDraft.name, priestDraft.title, priestDraft.motto])) {
      return;
    }

    setContent((current) => ({
      ...current,
      priests: [...current.priests, priestDraft]
    }));
    setPriestDraft(createPriestDraft());
  }

  function addGalleryItem() {
    if (!hasValue([galleryDraft.title, galleryDraft.period, galleryDraft.detail])) {
      return;
    }

    setContent((current) => ({
      ...current,
      gallery: [...current.gallery, galleryDraft]
    }));
    setGalleryDraft(createGalleryDraft());
  }

  function renderGeneralSection() {
    return (
      <div className="admin-shell">
        <section className="admin-section">
          <div className="admin-section__heading">
            <div>
              <div className="eyebrow">Homepage</div>
              <h2>Front page message</h2>
              <p>Keep the homepage simple and welcoming.</p>
            </div>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Homepage Intro</span>
              <input
                value={content.homeIntro}
                onChange={(event) => updateTopLevel("homeIntro", event.target.value)}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Welcome Message</span>
              <textarea
                rows={3}
                value={content.welcomeMessage}
                onChange={(event) => updateTopLevel("welcomeMessage", event.target.value)}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Mission Statement</span>
              <textarea
                rows={3}
                value={content.mission}
                onChange={(event) => updateTopLevel("mission", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section__heading">
            <div>
              <div className="eyebrow">History</div>
              <h2>About section</h2>
              <p>Short parish story and highlights.</p>
            </div>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Heading</span>
              <input
                value={content.parishHistory.heading}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    parishHistory: {
                      ...current.parishHistory,
                      heading: event.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Summary</span>
              <textarea
                rows={3}
                value={content.parishHistory.summary}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    parishHistory: {
                      ...current.parishHistory,
                      summary: event.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Milestones</span>
              <textarea
                rows={5}
                value={toLines(content.parishHistory.milestones)}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    parishHistory: {
                      ...current.parishHistory,
                      milestones: fromLines(event.target.value)
                    }
                  }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Body</span>
              <textarea
                rows={5}
                value={toLines(content.parishHistory.body)}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    parishHistory: {
                      ...current.parishHistory,
                      body: fromLines(event.target.value)
                    }
                  }))
                }
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section__heading">
            <div>
              <div className="eyebrow">Contact</div>
              <h2>Parish details</h2>
              <p>Basic contact information used around the site.</p>
            </div>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Address</span>
              <input
                value={content.contact.address}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    contact: {
                      ...current.contact,
                      address: event.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Town</span>
              <input
                value={content.contact.town}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    contact: {
                      ...current.contact,
                      town: event.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Phone</span>
              <input
                value={content.contact.phone}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    contact: {
                      ...current.contact,
                      phone: event.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Email</span>
              <input
                value={content.contact.email}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    contact: {
                      ...current.contact,
                      email: event.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Office Hours</span>
              <textarea
                rows={4}
                value={toLines(content.contact.officeHours)}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    contact: {
                      ...current.contact,
                      officeHours: fromLines(event.target.value)
                    }
                  }))
                }
              />
            </label>
          </div>
        </section>
      </div>
    );
  }

  function renderMassSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Mass Scheduling</div>
            <h2>Mass and liturgy times</h2>
            <p>Add one schedule item at a time, then update the list below.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Schedule Item</h3>
              <p className="admin-hint">Create a new Mass, confession, or adoration entry.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addMassScheduleItem}>
              Add Schedule Item
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Title</span>
              <input
                value={massDraft.title}
                onChange={(event) => setMassDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Day</span>
              <input
                value={massDraft.day}
                onChange={(event) => setMassDraft((current) => ({ ...current, day: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Time</span>
              <input
                value={massDraft.time}
                onChange={(event) => setMassDraft((current) => ({ ...current, time: event.target.value }))}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Detail</span>
              <textarea
                rows={3}
                value={massDraft.detail}
                onChange={(event) => setMassDraft((current) => ({ ...current, detail: event.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className="admin-list">
          {content.massSchedule.length === 0 ? <SectionEmptyState label="Schedule Items" /> : null}
          {content.massSchedule.map((item, index) => (
            <article key={item.id} className="admin-card">
              <div className="admin-card__header">
                <strong>{item.title || `Schedule Item ${index + 1}`}</strong>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  onClick={() => removeAt("massSchedule", index)}
                >
                  Remove
                </button>
              </div>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updateMassSchedule(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Day</span>
                  <input
                    value={item.day}
                    onChange={(event) => updateMassSchedule(index, "day", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Time</span>
                  <input
                    value={item.time}
                    onChange={(event) => updateMassSchedule(index, "time", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Detail</span>
                  <textarea
                    rows={3}
                    value={item.detail}
                    onChange={(event) => updateMassSchedule(index, "detail", event.target.value)}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderAnnouncementsSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Announcements</div>
            <h2>Important parish notices</h2>
            <p>Quick notices that show up across the parish website.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Announcement</h3>
              <p className="admin-hint">Create a notice, reminder, or service update.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addAnnouncement}>
              Add Announcement
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Tag</span>
              <input
                value={announcementDraft.tag}
                onChange={(event) =>
                  setAnnouncementDraft((current) => ({ ...current, tag: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Date</span>
              <input
                value={announcementDraft.date}
                onChange={(event) =>
                  setAnnouncementDraft((current) => ({ ...current, date: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Title</span>
              <input
                value={announcementDraft.title}
                onChange={(event) =>
                  setAnnouncementDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Detail</span>
              <textarea
                rows={3}
                value={announcementDraft.detail}
                onChange={(event) =>
                  setAnnouncementDraft((current) => ({ ...current, detail: event.target.value }))
                }
              />
            </label>
          </div>
        </div>

        <div className="admin-list">
          {content.announcements.length === 0 ? <SectionEmptyState label="Announcements" /> : null}
          {content.announcements.map((item, index) => (
            <article key={item.id} className="admin-card">
              <div className="admin-card__header">
                <strong>{item.title || `Announcement ${index + 1}`}</strong>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  onClick={() => removeAt("announcements", index)}
                >
                  Remove
                </button>
              </div>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Tag</span>
                  <input
                    value={item.tag}
                    onChange={(event) => updateAnnouncement(index, "tag", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Date</span>
                  <input
                    value={item.date}
                    onChange={(event) => updateAnnouncement(index, "date", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updateAnnouncement(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Detail</span>
                  <textarea
                    rows={3}
                    value={item.detail}
                    onChange={(event) => updateAnnouncement(index, "detail", event.target.value)}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderNewsSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">News</div>
            <h2>Recent parish news</h2>
            <p>Add one news story at a time, including an optional image.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add News Item</h3>
              <p className="admin-hint">This is the simpler add flow for the news section.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addNews}>
              Add News
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Label</span>
              <input
                value={newsDraft.label}
                onChange={(event) => setNewsDraft((current) => ({ ...current, label: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Date</span>
              <input
                value={newsDraft.date}
                onChange={(event) => setNewsDraft((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Location</span>
              <input
                value={newsDraft.location}
                onChange={(event) =>
                  setNewsDraft((current) => ({ ...current, location: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Title</span>
              <input
                value={newsDraft.title}
                onChange={(event) => setNewsDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Description</span>
              <textarea
                rows={4}
                value={newsDraft.description}
                onChange={(event) =>
                  setNewsDraft((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Image URL</span>
              <input
                value={newsDraft.image ?? ""}
                onChange={(event) => setNewsDraft((current) => ({ ...current, image: event.target.value }))}
              />
            </label>
          </div>
          <AdminImageUpload
            enabled={uploadsEnabled}
            folder="news"
            onUploaded={(url) => setNewsDraft((current) => ({ ...current, image: url }))}
          />
          <ImagePreview image={newsDraft.image} title={newsDraft.title || "News preview"} />
        </div>

        <div className="admin-list">
          {content.newsItems.length === 0 ? <SectionEmptyState label="News Items" /> : null}
          {content.newsItems.map((item, index) => (
            <article key={item.id} className="admin-card">
              <div className="admin-card__header">
                <strong>{item.title || `News ${index + 1}`}</strong>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  onClick={() => removeAt("newsItems", index)}
                >
                  Remove
                </button>
              </div>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Label</span>
                  <input
                    value={item.label}
                    onChange={(event) => updateNews(index, "label", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Date</span>
                  <input
                    value={item.date}
                    onChange={(event) => updateNews(index, "date", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Location</span>
                  <input
                    value={item.location}
                    onChange={(event) => updateNews(index, "location", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updateNews(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(event) => updateNews(index, "description", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Image URL</span>
                  <input
                    value={item.image ?? ""}
                    onChange={(event) => updateNews(index, "image", event.target.value)}
                  />
                </label>
              </div>
              <AdminImageUpload
                enabled={uploadsEnabled}
                folder="news"
                onUploaded={(url) => updateNews(index, "image", url)}
              />
              <ImagePreview image={item.image} title={item.title || `News ${index + 1}`} />
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderReflectionsSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Reflections</div>
            <h2>Reflections and faith notes</h2>
            <p>Add short reflections, faith notes, or pastoral writing.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Reflection</h3>
              <p className="admin-hint">Create a new reflection entry.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addReflection}>
              Add Reflection
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Category</span>
              <input
                value={reflectionDraft.category}
                onChange={(event) =>
                  setReflectionDraft((current) => ({ ...current, category: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Author</span>
              <input
                value={reflectionDraft.author}
                onChange={(event) =>
                  setReflectionDraft((current) => ({ ...current, author: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Date Label</span>
              <input
                value={reflectionDraft.date}
                onChange={(event) =>
                  setReflectionDraft((current) => ({ ...current, date: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Title</span>
              <input
                value={reflectionDraft.title}
                onChange={(event) =>
                  setReflectionDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Excerpt</span>
              <textarea
                rows={4}
                value={reflectionDraft.excerpt}
                onChange={(event) =>
                  setReflectionDraft((current) => ({ ...current, excerpt: event.target.value }))
                }
              />
            </label>
          </div>
        </div>

        <div className="admin-list">
          {content.reflections.length === 0 ? <SectionEmptyState label="Reflections" /> : null}
          {content.reflections.map((item, index) => (
            <article key={item.id} className="admin-card">
              <div className="admin-card__header">
                <strong>{item.title || `Reflection ${index + 1}`}</strong>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  onClick={() => removeAt("reflections", index)}
                >
                  Remove
                </button>
              </div>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Category</span>
                  <input
                    value={item.category}
                    onChange={(event) => updateReflection(index, "category", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Author</span>
                  <input
                    value={item.author}
                    onChange={(event) => updateReflection(index, "author", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Date Label</span>
                  <input
                    value={item.date}
                    onChange={(event) => updateReflection(index, "date", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updateReflection(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Excerpt</span>
                  <textarea
                    rows={4}
                    value={item.excerpt}
                    onChange={(event) => updateReflection(index, "excerpt", event.target.value)}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderPastoralSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Pastoral Organisation</div>
            <h2>Parish groups and units</h2>
            <p>Manage groups one at a time with a simpler add flow.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Pastoral Unit</h3>
              <p className="admin-hint">Create a ministry, group, or parish unit.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addPastoralUnit}>
              Add Pastoral Unit
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Slug</span>
              <input
                value={pastoralDraft.slug}
                onChange={(event) =>
                  setPastoralDraft((current) => ({ ...current, slug: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Short Name</span>
              <input
                value={pastoralDraft.shortName}
                onChange={(event) =>
                  setPastoralDraft((current) => ({ ...current, shortName: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Lead</span>
              <input
                value={pastoralDraft.lead}
                onChange={(event) =>
                  setPastoralDraft((current) => ({ ...current, lead: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Name</span>
              <input
                value={pastoralDraft.name}
                onChange={(event) =>
                  setPastoralDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Description</span>
              <textarea
                rows={3}
                value={pastoralDraft.description}
                onChange={(event) =>
                  setPastoralDraft((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Focus Items</span>
              <textarea
                rows={5}
                value={toLines(pastoralDraft.focus)}
                onChange={(event) =>
                  setPastoralDraft((current) => ({ ...current, focus: fromLines(event.target.value) }))
                }
              />
            </label>
          </div>
        </div>

        <div className="admin-list">
          {content.pastoralUnits.length === 0 ? <SectionEmptyState label="Pastoral Units" /> : null}
          {content.pastoralUnits.map((item, index) => (
            <article key={item.slug} className="admin-card">
              <div className="admin-card__header">
                <strong>{item.name || `Pastoral Unit ${index + 1}`}</strong>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  onClick={() => removeAt("pastoralUnits", index)}
                >
                  Remove
                </button>
              </div>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Slug</span>
                  <input
                    value={item.slug}
                    onChange={(event) => updatePastoral(index, "slug", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Short Name</span>
                  <input
                    value={item.shortName}
                    onChange={(event) => updatePastoral(index, "shortName", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Lead</span>
                  <input
                    value={item.lead}
                    onChange={(event) => updatePastoral(index, "lead", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Name</span>
                  <input
                    value={item.name}
                    onChange={(event) => updatePastoral(index, "name", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(event) => updatePastoral(index, "description", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Focus Items</span>
                  <textarea
                    rows={5}
                    value={toLines(item.focus)}
                    onChange={(event) => updatePastoralFocus(index, event.target.value)}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderPriestsSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Priests</div>
            <h2>Add or remove priests</h2>
            <p>Create a priest profile, then manage the list below.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Priest</h3>
              <p className="admin-hint">Add a simple priest profile for the website.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addPriest}>
              Add Priest
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Name</span>
              <input
                value={priestDraft.name}
                onChange={(event) => setPriestDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Title</span>
              <input
                value={priestDraft.title}
                onChange={(event) => setPriestDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Motto</span>
              <input
                value={priestDraft.motto}
                onChange={(event) => setPriestDraft((current) => ({ ...current, motto: event.target.value }))}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Biography Lines</span>
              <textarea
                rows={5}
                value={toLines(priestDraft.bio)}
                onChange={(event) => setPriestDraft((current) => ({ ...current, bio: fromLines(event.target.value) }))}
              />
            </label>
          </div>
        </div>

        <div className="admin-list">
          {content.priests.length === 0 ? <SectionEmptyState label="Priests" /> : null}
          {content.priests.map((item, index) => (
            <article key={item.id} className="admin-card">
              <div className="admin-card__header">
                <strong>{item.name || `Priest ${index + 1}`}</strong>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  onClick={() => removeAt("priests", index)}
                >
                  Remove
                </button>
              </div>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Name</span>
                  <input
                    value={item.name}
                    onChange={(event) => updatePriest(index, "name", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updatePriest(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Motto</span>
                  <input
                    value={item.motto}
                    onChange={(event) => updatePriest(index, "motto", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Biography Lines</span>
                  <textarea
                    rows={5}
                    value={toLines(item.bio)}
                    onChange={(event) => updatePriestBio(index, event.target.value)}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderGallerySection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Gallery</div>
            <h2>Photos and captions</h2>
            <p>Manage the gallery text that sits on the photo cards.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Gallery Item</h3>
              <p className="admin-hint">Add a new gallery card caption.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addGalleryItem}>
              Add Gallery Item
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Title</span>
              <input
                value={galleryDraft.title}
                onChange={(event) => setGalleryDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Period Label</span>
              <input
                value={galleryDraft.period}
                onChange={(event) => setGalleryDraft((current) => ({ ...current, period: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Tone</span>
              <select
                value={galleryDraft.tone}
                onChange={(event) => setGalleryDraft((current) => ({ ...current, tone: event.target.value }))}
              >
                {galleryTones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field admin-field--full">
              <span>Description</span>
              <textarea
                rows={3}
                value={galleryDraft.detail}
                onChange={(event) => setGalleryDraft((current) => ({ ...current, detail: event.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className="admin-list">
          {content.gallery.length === 0 ? <SectionEmptyState label="Gallery Items" /> : null}
          {content.gallery.map((item, index) => (
            <article key={item.id} className="admin-card">
              <div className="admin-card__header">
                <strong>{item.title || `Gallery Item ${index + 1}`}</strong>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  onClick={() => removeAt("gallery", index)}
                >
                  Remove
                </button>
              </div>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updateGallery(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Period Label</span>
                  <input
                    value={item.period}
                    onChange={(event) => updateGallery(index, "period", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Tone</span>
                  <select
                    value={item.tone}
                    onChange={(event) => updateGallery(index, "tone", event.target.value)}
                  >
                    {galleryTones.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field admin-field--full">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={item.detail}
                    onChange={(event) => updateGallery(index, "detail", event.target.value)}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const sectionContent =
    section === "general"
      ? renderGeneralSection()
      : section === "mass"
        ? renderMassSection()
        : section === "announcements"
          ? renderAnnouncementsSection()
          : section === "news"
            ? renderNewsSection()
            : section === "reflections"
              ? renderReflectionsSection()
              : section === "pastoral"
                ? renderPastoralSection()
                : section === "priests"
                  ? renderPriestsSection()
                  : renderGallerySection();

  return (
    <form action={saveSiteContentAction} className="admin-shell">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <textarea
        name="payload"
        value={JSON.stringify(content)}
        readOnly
        className="sr-only"
        aria-hidden="true"
      />

      {sectionContent}

      <div className="admin-submit">
        <div>
          <strong>Save changes</strong>
          <p>Publish updates to this section.</p>
        </div>
        <button type="submit" className="button button--primary">
          Save Section
        </button>
      </div>
    </form>
  );
}
