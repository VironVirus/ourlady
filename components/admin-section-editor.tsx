"use client";

import { useState } from "react";
import { saveSiteContentAction } from "@/app/admin/actions";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { newsCategoryOptions } from "@/lib/news-categories";
import {
  getThemePresetPalette,
  themePresetOptions,
  type ThemePresetKey
} from "@/lib/theme-presets";
import type {
  AnnouncementItem,
  AssociationItem,
  GalleryItem,
  MassScheduleItem,
  NewsItem,
  PastoralUnit,
  PrayerItem,
  PriestProfile,
  ReflectionItem,
  SaintItem,
  SiteContent,
  ThemeScheduleItem
} from "@/lib/content";

type AdminSectionKey =
  | "general"
  | "mass"
  | "associations"
  | "announcements"
  | "news"
  | "saints"
  | "prayers"
  | "reflections"
  | "pastoral"
  | "priests"
  | "gallery";

type EditableCollectionKey =
  | "themeSchedule"
  | "massSchedule"
  | "associations"
  | "announcements"
  | "newsItems"
  | "saints"
  | "prayers"
  | "reflections"
  | "pastoralUnits"
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

function createThemeScheduleDraft(): ThemeScheduleItem {
  return {
    id: `theme-${Date.now()}`,
    label: "",
    preset: "gold",
    startDate: "",
    endDate: "",
    enabled: true
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
    label: "General",
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

function createAssociationDraft(): AssociationItem {
  return {
    slug: `association-${Date.now()}`,
    shortName: "",
    name: "",
    description: "",
    lead: "",
    meeting: "",
    focus: [],
    image: ""
  };
}

function createSaintDraft(): SaintItem {
  return {
    id: `saint-${Date.now()}`,
    slug: "",
    name: "",
    title: "",
    feastDay: "",
    displayDate: "",
    excerpt: "",
    story: "",
    image: "",
    published: true
  };
}

function createPrayerDraft(): PrayerItem {
  return {
    id: `prayer-${Date.now()}`,
    title: "",
    category: "",
    excerpt: "",
    body: "",
    published: true
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

type ExpandableAdminItemProps = {
  title: string;
  meta?: string;
  isOpen: boolean;
  onToggle: () => void;
  onRemove: () => void;
  children: React.ReactNode;
};

function ExpandableAdminItem({
  title,
  meta,
  isOpen,
  onToggle,
  onRemove,
  children
}: ExpandableAdminItemProps) {
  return (
    <article className="admin-card">
      <div className="admin-card__header">
        <div>
          <strong>{title}</strong>
          {meta ? <p className="admin-hint">{meta}</p> : null}
        </div>
        <div className="admin-card__actions">
          <button type="button" className="admin-link" onClick={onToggle}>
            {isOpen ? "Close" : "Edit"}
          </button>
          <button type="button" className="admin-link admin-link--danger" onClick={onRemove}>
            Delete
          </button>
        </div>
      </div>
      {isOpen ? <div className="admin-card__editor">{children}</div> : null}
    </article>
  );
}

export function AdminSectionEditor({
  initialContent,
  section,
  redirectTo,
  uploadsEnabled
}: AdminSectionEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [themeScheduleDraft, setThemeScheduleDraft] = useState(createThemeScheduleDraft);
  const [massDraft, setMassDraft] = useState(createMassDraft);
  const [announcementDraft, setAnnouncementDraft] = useState(createAnnouncementDraft);
  const [newsDraft, setNewsDraft] = useState(createNewsDraft);
  const [associationDraft, setAssociationDraft] = useState(createAssociationDraft);
  const [saintDraft, setSaintDraft] = useState(createSaintDraft);
  const [prayerDraft, setPrayerDraft] = useState(createPrayerDraft);
  const [reflectionDraft, setReflectionDraft] = useState(createReflectionDraft);
  const [pastoralDraft, setPastoralDraft] = useState(createPastoralDraft);
  const [priestDraft, setPriestDraft] = useState(createPriestDraft);
  const [galleryDraft, setGalleryDraft] = useState(createGalleryDraft);
  const [openEditors, setOpenEditors] = useState<
    Partial<Record<EditableCollectionKey, number | null>>
  >({});

  function isEditorOpen(key: EditableCollectionKey, index: number) {
    return openEditors[key] === index;
  }

  function toggleEditor(key: EditableCollectionKey, index: number) {
    setOpenEditors((current) => ({
      ...current,
      [key]: current[key] === index ? null : index
    }));
  }

  function applyThemePreset(preset: ThemePresetKey) {
    updateTopLevel("themePreset", preset);
    updateTopLevel("theme", getThemePresetPalette(preset, content.theme));
  }

  function updateThemeSchedule(
    index: number,
    key: keyof ThemeScheduleItem,
    value: string | boolean
  ) {
    setContent((current) => ({
      ...current,
      themeSchedule: current.themeSchedule.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

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

  function updateNews(index: number, key: keyof NewsItem, value: string | boolean | number) {
    setContent((current) => ({
      ...current,
      newsItems: current.newsItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
              ...(key === "excerpt" && typeof value === "string"
                ? { description: value }
                : {})
            }
          : item
      )
    }));
  }

  function updateAssociation(index: number, key: keyof AssociationItem, value: string) {
    setContent((current) => ({
      ...current,
      associations: current.associations.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updateAssociationFocus(index: number, value: string) {
    setContent((current) => ({
      ...current,
      associations: current.associations.map((item, itemIndex) =>
        itemIndex === index ? { ...item, focus: fromLines(value) } : item
      )
    }));
  }

  function updateSaint(index: number, key: keyof SaintItem, value: string | boolean) {
    setContent((current) => ({
      ...current,
      saints: current.saints.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updatePrayer(index: number, key: keyof PrayerItem, value: string | boolean) {
    setContent((current) => ({
      ...current,
      prayers: current.prayers.map((item, itemIndex) =>
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
      | "themeSchedule"
      | "associations"
      | "announcements"
      | "newsItems"
      | "saints"
      | "prayers"
      | "reflections"
      | "pastoralUnits"
      | "priests"
      | "gallery"
  >(key: K, index: number) {
    setContent((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index)
    }));
    setOpenEditors((current) => ({
      ...current,
      [key]: null
    }));
  }

  function addThemeScheduleItem() {
    if (!themeScheduleDraft.startDate) {
      return;
    }

    setContent((current) => ({
      ...current,
      themeSchedule: [...current.themeSchedule, themeScheduleDraft]
    }));
    setOpenEditors((current) => ({
      ...current,
      themeSchedule: content.themeSchedule.length
    }));
    setThemeScheduleDraft(createThemeScheduleDraft());
  }

  function addMassScheduleItem() {
    if (!hasValue([massDraft.title, massDraft.day, massDraft.time, massDraft.detail])) {
      return;
    }

    setContent((current) => ({
      ...current,
      massSchedule: [...current.massSchedule, massDraft]
    }));
    setOpenEditors((current) => ({
      ...current,
      massSchedule: content.massSchedule.length
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
    setOpenEditors((current) => ({
      ...current,
      announcements: content.announcements.length
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
    setOpenEditors((current) => ({
      ...current,
      newsItems: content.newsItems.length
    }));
    setNewsDraft(createNewsDraft());
  }

  function addAssociation() {
    if (
      !hasValue([
        associationDraft.shortName,
        associationDraft.name,
        associationDraft.description,
        associationDraft.lead
      ])
    ) {
      return;
    }

    setContent((current) => ({
      ...current,
      associations: [...current.associations, associationDraft]
    }));
    setOpenEditors((current) => ({
      ...current,
      associations: content.associations.length
    }));
    setAssociationDraft(createAssociationDraft());
  }

  function addSaint() {
    if (!hasValue([saintDraft.name, saintDraft.title, saintDraft.excerpt, saintDraft.story])) {
      return;
    }

    setContent((current) => ({
      ...current,
      saints: [...current.saints, saintDraft]
    }));
    setOpenEditors((current) => ({
      ...current,
      saints: content.saints.length
    }));
    setSaintDraft(createSaintDraft());
  }

  function addPrayer() {
    if (!hasValue([prayerDraft.title, prayerDraft.body])) {
      return;
    }

    setContent((current) => ({
      ...current,
      prayers: [...current.prayers, prayerDraft]
    }));
    setOpenEditors((current) => ({
      ...current,
      prayers: content.prayers.length
    }));
    setPrayerDraft(createPrayerDraft());
  }

  function addReflection() {
    if (!hasValue([reflectionDraft.title, reflectionDraft.excerpt, reflectionDraft.author])) {
      return;
    }

    setContent((current) => ({
      ...current,
      reflections: [...current.reflections, reflectionDraft]
    }));
    setOpenEditors((current) => ({
      ...current,
      reflections: content.reflections.length
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
    setOpenEditors((current) => ({
      ...current,
      pastoralUnits: content.pastoralUnits.length
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
    setOpenEditors((current) => ({
      ...current,
      priests: content.priests.length
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
    setOpenEditors((current) => ({
      ...current,
      gallery: content.gallery.length
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
            <label className="admin-field admin-field--full">
              <span>Weekly Church Times Note</span>
              <textarea
                rows={3}
                value={content.churchTimesNote}
                onChange={(event) => updateTopLevel("churchTimesNote", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section__heading">
            <div>
              <div className="eyebrow">Church Colors</div>
              <h2>Seasonal colors</h2>
              <p>Choose a color season now, or schedule the next one ahead of time.</p>
            </div>
          </div>
          <div className="admin-subsection">
            <div className="admin-subsection__head">
              <div>
                <h3>Current Theme</h3>
                <p className="admin-hint">If no schedule is active, this is the color the website uses.</p>
              </div>
            </div>
            <div className="admin-grid">
              <label className="admin-field">
                <span>Season Color</span>
                <select
                  value={content.themePreset}
                  onChange={(event) => applyThemePreset(event.target.value as ThemePresetKey)}
                >
                  {themePresetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-field admin-field--full">
                <span>Available Colors</span>
                <p className="admin-hint">Gold, white, red, green, and purple are ready to switch instantly.</p>
              </div>
            </div>
          </div>

          <div className="admin-subsection">
            <div className="admin-subsection__head">
              <div>
                <h3>Schedule a Theme</h3>
                <p className="admin-hint">Set a future season so the color changes automatically on the date.</p>
              </div>
              <button type="button" className="button button--secondary" onClick={addThemeScheduleItem}>
                Add Theme Schedule
              </button>
            </div>
            <div className="admin-grid">
              <label className="admin-field">
                <span>Season Label</span>
                <input
                  value={themeScheduleDraft.label}
                  onChange={(event) =>
                    setThemeScheduleDraft((current) => ({ ...current, label: event.target.value }))
                  }
                />
              </label>
              <label className="admin-field">
                <span>Color</span>
                <select
                  value={themeScheduleDraft.preset}
                  onChange={(event) =>
                    setThemeScheduleDraft((current) => ({
                      ...current,
                      preset: event.target.value as ThemePresetKey
                    }))
                  }
                >
                  {themePresetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span>Start Date</span>
                <input
                  type="date"
                  value={themeScheduleDraft.startDate}
                  onChange={(event) =>
                    setThemeScheduleDraft((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>
              <label className="admin-field">
                <span>End Date</span>
                <input
                  type="date"
                  value={themeScheduleDraft.endDate}
                  onChange={(event) =>
                    setThemeScheduleDraft((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </label>
              <label className="admin-field">
                <span>Status</span>
                <select
                  value={themeScheduleDraft.enabled ? "enabled" : "disabled"}
                  onChange={(event) =>
                    setThemeScheduleDraft((current) => ({
                      ...current,
                      enabled: event.target.value === "enabled"
                    }))
                  }
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </label>
            </div>
          </div>

          <div className="admin-list">
            {content.themeSchedule.length === 0 ? <SectionEmptyState label="Theme Schedules" /> : null}
            {content.themeSchedule.map((item, index) => (
              <ExpandableAdminItem
                key={item.id}
                title={item.label || `${item.preset.toUpperCase()} theme`}
                meta={`${item.preset.toUpperCase()} · ${item.startDate || "No start"}${item.endDate ? ` to ${item.endDate}` : ""}`}
                isOpen={isEditorOpen("themeSchedule", index)}
                onToggle={() => toggleEditor("themeSchedule", index)}
                onRemove={() => removeAt("themeSchedule", index)}
              >
                <div className="admin-grid">
                  <label className="admin-field">
                    <span>Season Label</span>
                    <input
                      value={item.label}
                      onChange={(event) => updateThemeSchedule(index, "label", event.target.value)}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Color</span>
                    <select
                      value={item.preset}
                      onChange={(event) =>
                        updateThemeSchedule(index, "preset", event.target.value as ThemePresetKey)
                      }
                    >
                      {themePresetOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Start Date</span>
                    <input
                      type="date"
                      value={item.startDate}
                      onChange={(event) => updateThemeSchedule(index, "startDate", event.target.value)}
                    />
                  </label>
                  <label className="admin-field">
                    <span>End Date</span>
                    <input
                      type="date"
                      value={item.endDate}
                      onChange={(event) => updateThemeSchedule(index, "endDate", event.target.value)}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Status</span>
                    <select
                      value={item.enabled ? "enabled" : "disabled"}
                      onChange={(event) =>
                        updateThemeSchedule(index, "enabled", event.target.value === "enabled")
                      }
                    >
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </label>
                </div>
              </ExpandableAdminItem>
            ))}
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
            <h2>Weekly church times</h2>
            <p>Add one schedule item at a time, then update the list below for each week.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Weekly Timing Note</h3>
              <p className="admin-hint">Use this to announce changes for the current week.</p>
            </div>
          </div>
          <label className="admin-field">
            <span>Current Week Note</span>
            <textarea
              rows={3}
              value={content.churchTimesNote}
              onChange={(event) => updateTopLevel("churchTimesNote", event.target.value)}
            />
          </label>
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
            <ExpandableAdminItem
              key={item.id}
              title={item.title || `Schedule Item ${index + 1}`}
              meta={`${item.day || "No day"} · ${item.time || "No time"}`}
              isOpen={isEditorOpen("massSchedule", index)}
              onToggle={() => toggleEditor("massSchedule", index)}
              onRemove={() => removeAt("massSchedule", index)}
            >
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
            </ExpandableAdminItem>
          ))}
        </div>
      </section>
    );
  }

  function renderAssociationsSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Associations</div>
            <h2>Association pages</h2>
            <p>Manage CYON, CMO, CWO, altar servers, and other parish associations.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Association</h3>
              <p className="admin-hint">Each one gets its own page and navigation link.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addAssociation}>
              Add Association
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Slug</span>
              <input
                value={associationDraft.slug}
                onChange={(event) =>
                  setAssociationDraft((current) => ({ ...current, slug: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Short Name</span>
              <input
                value={associationDraft.shortName}
                onChange={(event) =>
                  setAssociationDraft((current) => ({ ...current, shortName: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Lead</span>
              <input
                value={associationDraft.lead}
                onChange={(event) =>
                  setAssociationDraft((current) => ({ ...current, lead: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Meeting Info</span>
              <input
                value={associationDraft.meeting}
                onChange={(event) =>
                  setAssociationDraft((current) => ({ ...current, meeting: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Name</span>
              <input
                value={associationDraft.name}
                onChange={(event) =>
                  setAssociationDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Description</span>
              <textarea
                rows={3}
                value={associationDraft.description}
                onChange={(event) =>
                  setAssociationDraft((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Focus Items</span>
              <textarea
                rows={4}
                value={toLines(associationDraft.focus)}
                onChange={(event) =>
                  setAssociationDraft((current) => ({
                    ...current,
                    focus: fromLines(event.target.value)
                  }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Image URL</span>
              <input
                value={associationDraft.image ?? ""}
                onChange={(event) =>
                  setAssociationDraft((current) => ({ ...current, image: event.target.value }))
                }
              />
            </label>
          </div>
          <AdminImageUpload
            enabled={uploadsEnabled}
            folder="associations"
            onUploaded={(url) => setAssociationDraft((current) => ({ ...current, image: url }))}
          />
          <ImagePreview image={associationDraft.image} title={associationDraft.name || "Association preview"} />
        </div>

        <div className="admin-list">
          {content.associations.length === 0 ? <SectionEmptyState label="Associations" /> : null}
          {content.associations.map((item, index) => (
            <ExpandableAdminItem
              key={item.slug}
              title={item.name || `Association ${index + 1}`}
              meta={item.meeting || item.lead}
              isOpen={isEditorOpen("associations", index)}
              onToggle={() => toggleEditor("associations", index)}
              onRemove={() => removeAt("associations", index)}
            >
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Slug</span>
                  <input
                    value={item.slug}
                    onChange={(event) => updateAssociation(index, "slug", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Short Name</span>
                  <input
                    value={item.shortName}
                    onChange={(event) =>
                      updateAssociation(index, "shortName", event.target.value)
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Lead</span>
                  <input
                    value={item.lead}
                    onChange={(event) => updateAssociation(index, "lead", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Meeting Info</span>
                  <input
                    value={item.meeting}
                    onChange={(event) => updateAssociation(index, "meeting", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Name</span>
                  <input
                    value={item.name}
                    onChange={(event) => updateAssociation(index, "name", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(event) =>
                      updateAssociation(index, "description", event.target.value)
                    }
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Focus Items</span>
                  <textarea
                    rows={4}
                    value={toLines(item.focus)}
                    onChange={(event) => updateAssociationFocus(index, event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Image URL</span>
                  <input
                    value={item.image ?? ""}
                    onChange={(event) => updateAssociation(index, "image", event.target.value)}
                  />
                </label>
              </div>
              <AdminImageUpload
                enabled={uploadsEnabled}
                folder="associations"
                onUploaded={(url) => updateAssociation(index, "image", url)}
              />
              <ImagePreview image={item.image} title={item.name || `Association ${index + 1}`} />
            </ExpandableAdminItem>
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
            <ExpandableAdminItem
              key={item.id}
              title={item.title || `Announcement ${index + 1}`}
              meta={`${item.tag || "Notice"}${item.date ? ` · ${item.date}` : ""}`}
              isOpen={isEditorOpen("announcements", index)}
              onToggle={() => toggleEditor("announcements", index)}
              onRemove={() => removeAt("announcements", index)}
            >
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
            </ExpandableAdminItem>
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
              <span>Category</span>
              <select
                value={newsDraft.label}
                onChange={(event) =>
                  setNewsDraft((current) => ({ ...current, label: event.target.value }))
                }
              >
                {newsCategoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
            <ExpandableAdminItem
              key={item.id}
              title={item.title || `News ${index + 1}`}
              meta={`${item.label || "General"} · ${item.date || "No date"}`}
              isOpen={isEditorOpen("newsItems", index)}
              onToggle={() => toggleEditor("newsItems", index)}
              onRemove={() => removeAt("newsItems", index)}
            >
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Category</span>
                  <select
                    value={item.label}
                    onChange={(event) => updateNews(index, "label", event.target.value)}
                  >
                    {newsCategoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
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
                  <span>Preview Text</span>
                  <textarea
                    rows={3}
                    value={item.excerpt}
                    onChange={(event) => updateNews(index, "excerpt", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Full Story</span>
                  <textarea
                    rows={8}
                    value={item.content}
                    onChange={(event) => updateNews(index, "content", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Status</span>
                  <select
                    value={item.published ? "published" : "draft"}
                    onChange={(event) =>
                      updateNews(index, "published", event.target.value === "published")
                    }
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Story Link</span>
                  <input
                    value={item.slug}
                    onChange={(event) => updateNews(index, "slug", event.target.value)}
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
            </ExpandableAdminItem>
          ))}
        </div>
      </section>
    );
  }

  function renderSaintsSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Saints</div>
            <h2>Saint of the Day stories</h2>
            <p>Add saints with a short introduction and a full story for the site.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Saint</h3>
              <p className="admin-hint">Scheduled saints start displaying at 12:00 AM on the selected date.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addSaint}>
              Add Saint
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Name</span>
              <input
                value={saintDraft.name}
                onChange={(event) => setSaintDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Title</span>
              <input
                value={saintDraft.title}
                onChange={(event) => setSaintDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Feast Day</span>
              <input
                value={saintDraft.feastDay}
                onChange={(event) =>
                  setSaintDraft((current) => ({ ...current, feastDay: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Display Date</span>
              <input
                type="date"
                value={saintDraft.displayDate}
                onChange={(event) =>
                  setSaintDraft((current) => ({ ...current, displayDate: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Status</span>
              <select
                value={saintDraft.published ? "published" : "draft"}
                onChange={(event) =>
                  setSaintDraft((current) => ({
                    ...current,
                    published: event.target.value === "published"
                  }))
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="admin-field admin-field--full">
              <span>Summary</span>
              <textarea
                rows={3}
                value={saintDraft.excerpt}
                onChange={(event) =>
                  setSaintDraft((current) => ({ ...current, excerpt: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Story</span>
              <textarea
                rows={7}
                value={saintDraft.story}
                onChange={(event) =>
                  setSaintDraft((current) => ({ ...current, story: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Image URL</span>
              <input
                value={saintDraft.image ?? ""}
                onChange={(event) => setSaintDraft((current) => ({ ...current, image: event.target.value }))}
              />
            </label>
          </div>
          <AdminImageUpload
            enabled={uploadsEnabled}
            folder="saints"
            onUploaded={(url) => setSaintDraft((current) => ({ ...current, image: url }))}
          />
          <ImagePreview image={saintDraft.image} title={saintDraft.name || "Saint preview"} />
        </div>

        <div className="admin-list">
          {content.saints.length === 0 ? <SectionEmptyState label="Saints" /> : null}
          {content.saints.map((item, index) => (
            <ExpandableAdminItem
              key={item.id}
              title={item.name || `Saint ${index + 1}`}
              meta={`${item.displayDate || "No date"} · ${item.published ? "Published" : "Draft"}`}
              isOpen={isEditorOpen("saints", index)}
              onToggle={() => toggleEditor("saints", index)}
              onRemove={() => removeAt("saints", index)}
            >
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Name</span>
                  <input
                    value={item.name}
                    onChange={(event) => updateSaint(index, "name", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updateSaint(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Feast Day</span>
                  <input
                    value={item.feastDay}
                    onChange={(event) => updateSaint(index, "feastDay", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Display Date</span>
                  <input
                    type="date"
                    value={item.displayDate}
                    onChange={(event) => updateSaint(index, "displayDate", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Status</span>
                  <select
                    value={item.published ? "published" : "draft"}
                    onChange={(event) =>
                      updateSaint(index, "published", event.target.value === "published")
                    }
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
                <label className="admin-field admin-field--full">
                  <span>Summary</span>
                  <textarea
                    rows={3}
                    value={item.excerpt}
                    onChange={(event) => updateSaint(index, "excerpt", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Story</span>
                  <textarea
                    rows={7}
                    value={item.story}
                    onChange={(event) => updateSaint(index, "story", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Image URL</span>
                  <input
                    value={item.image ?? ""}
                    onChange={(event) => updateSaint(index, "image", event.target.value)}
                  />
                </label>
              </div>
              <AdminImageUpload
                enabled={uploadsEnabled}
                folder="saints"
                onUploaded={(url) => updateSaint(index, "image", url)}
              />
              <ImagePreview image={item.image} title={item.name || `Saint ${index + 1}`} />
            </ExpandableAdminItem>
          ))}
        </div>
      </section>
    );
  }

  function renderPrayersSection() {
    return (
      <section className="admin-section">
        <div className="admin-section__heading">
          <div>
            <div className="eyebrow">Prayers</div>
            <h2>Prayer write-ups</h2>
            <p>Add prayers so members can choose one from the website and pray along easily.</p>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__head">
            <div>
              <h3>Add Prayer</h3>
              <p className="admin-hint">Create a title, short note, and the full prayer text.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={addPrayer}>
              Add Prayer
            </button>
          </div>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Category</span>
              <input
                value={prayerDraft.category}
                onChange={(event) =>
                  setPrayerDraft((current) => ({ ...current, category: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              <span>Status</span>
              <select
                value={prayerDraft.published ? "published" : "draft"}
                onChange={(event) =>
                  setPrayerDraft((current) => ({
                    ...current,
                    published: event.target.value === "published"
                  }))
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="admin-field admin-field--full">
              <span>Title</span>
              <input
                value={prayerDraft.title}
                onChange={(event) =>
                  setPrayerDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Short Note</span>
              <textarea
                rows={3}
                value={prayerDraft.excerpt}
                onChange={(event) =>
                  setPrayerDraft((current) => ({ ...current, excerpt: event.target.value }))
                }
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Prayer Text</span>
              <textarea
                rows={8}
                value={prayerDraft.body}
                onChange={(event) =>
                  setPrayerDraft((current) => ({ ...current, body: event.target.value }))
                }
              />
            </label>
          </div>
        </div>

        <div className="admin-list">
          {content.prayers.length === 0 ? <SectionEmptyState label="Prayers" /> : null}
          {content.prayers.map((item, index) => (
            <ExpandableAdminItem
              key={item.id}
              title={item.title || `Prayer ${index + 1}`}
              meta={`${item.category || "Prayer"} · ${item.published ? "Published" : "Draft"}`}
              isOpen={isEditorOpen("prayers", index)}
              onToggle={() => toggleEditor("prayers", index)}
              onRemove={() => removeAt("prayers", index)}
            >
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Category</span>
                  <input
                    value={item.category}
                    onChange={(event) => updatePrayer(index, "category", event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Status</span>
                  <select
                    value={item.published ? "published" : "draft"}
                    onChange={(event) =>
                      updatePrayer(index, "published", event.target.value === "published")
                    }
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
                <label className="admin-field admin-field--full">
                  <span>Title</span>
                  <input
                    value={item.title}
                    onChange={(event) => updatePrayer(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Short Note</span>
                  <textarea
                    rows={3}
                    value={item.excerpt}
                    onChange={(event) => updatePrayer(index, "excerpt", event.target.value)}
                  />
                </label>
                <label className="admin-field admin-field--full">
                  <span>Prayer Text</span>
                  <textarea
                    rows={8}
                    value={item.body}
                    onChange={(event) => updatePrayer(index, "body", event.target.value)}
                  />
                </label>
              </div>
            </ExpandableAdminItem>
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
            <ExpandableAdminItem
              key={item.id}
              title={item.title || `Reflection ${index + 1}`}
              meta={`${item.category || "Reflection"} · ${item.author || "No author"}`}
              isOpen={isEditorOpen("reflections", index)}
              onToggle={() => toggleEditor("reflections", index)}
              onRemove={() => removeAt("reflections", index)}
            >
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
            </ExpandableAdminItem>
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
            <ExpandableAdminItem
              key={item.slug}
              title={item.name || `Pastoral Unit ${index + 1}`}
              meta={item.lead || item.shortName}
              isOpen={isEditorOpen("pastoralUnits", index)}
              onToggle={() => toggleEditor("pastoralUnits", index)}
              onRemove={() => removeAt("pastoralUnits", index)}
            >
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
            </ExpandableAdminItem>
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
            <ExpandableAdminItem
              key={item.id}
              title={item.name || `Priest ${index + 1}`}
              meta={item.title || "Priest profile"}
              isOpen={isEditorOpen("priests", index)}
              onToggle={() => toggleEditor("priests", index)}
              onRemove={() => removeAt("priests", index)}
            >
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
            </ExpandableAdminItem>
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
            <ExpandableAdminItem
              key={item.id}
              title={item.title || `Gallery Item ${index + 1}`}
              meta={`${item.period || "Gallery"} · ${item.tone}`}
              isOpen={isEditorOpen("gallery", index)}
              onToggle={() => toggleEditor("gallery", index)}
              onRemove={() => removeAt("gallery", index)}
            >
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
            </ExpandableAdminItem>
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
        : section === "associations"
          ? renderAssociationsSection()
        : section === "announcements"
          ? renderAnnouncementsSection()
          : section === "news"
            ? renderNewsSection()
            : section === "saints"
              ? renderSaintsSection()
              : section === "prayers"
                ? renderPrayersSection()
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
