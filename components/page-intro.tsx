type PageIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  position?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  image,
  position
}: PageIntroProps) {
  return (
    <section
      className={`page-intro${image ? " page-intro--photo" : ""}`}
      style={
        image
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(23, 15, 10, 0.18), rgba(23, 15, 10, 0.74)), url(${image})`,
              backgroundPosition: position ?? "center"
            }
          : undefined
      }
    >
      <div className="container page-intro__inner">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
    </section>
  );
}
