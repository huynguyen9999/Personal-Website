import { AdminSubmit } from "@/components/admin-submit";
import { createQuarter, deleteQuarter, saveQuarter } from "@/app/admin/quarter-actions";
import {
  QUARTER_NOTE_MAX,
  QUARTER_YEAR_MAX,
  QUARTER_YEAR_MIN,
  quarterFields,
  suggestedNextQuarter,
  type QuarterLog,
} from "@/lib/quarters";

export function QuarterLogAdmin({ quarters }: { quarters: QuarterLog[] }) {
  const next = suggestedNextQuarter(quarters);

  return (
    <section className="book-admin" id="quarter-log" aria-labelledby="quarter-log-title">
      <header className="media-uploader__header">
        <div>
          <p className="eyebrow">NOW / MEMORY LOG</p>
          <h2 id="quarter-log-title">Lock each season to a quarter.</h2>
        </div>
        <p>
          The current Pacific quarter stays in the log even after you open a later one.
          Visitors slide through published seasons; empty fields stay empty until you write them.
        </p>
      </header>

      <form className="book-import-form quarter-open-form" action={createQuarter}>
        <label>
          Year
          <input
            name="year"
            type="number"
            min={QUARTER_YEAR_MIN}
            max={QUARTER_YEAR_MAX}
            defaultValue={next.year}
            required
          />
        </label>
        <label>
          Quarter
          <select name="quarter" defaultValue={next.quarter}>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </label>
        <button className="publish-button" type="submit">Open quarter</button>
      </form>

      {quarters.length > 0 && (
        <div className="book-admin__list">
          {quarters.map((quarter) => (
            <form className="editor-card" action={saveQuarter} id={quarter.slug} key={quarter.slug}>
              <input type="hidden" name="slug" value={quarter.slug} />
              <header>
                <div>
                  <p className="eyebrow">{quarter.slug}</p>
                  <h2>{quarter.label}</h2>
                </div>
                <p className="editor-state">
                  <span>{quarter.status}</span>
                  {quarter.updatedAt
                    ? `Updated ${new Date(quarter.updatedAt).toLocaleDateString("en-US")}`
                    : "Not saved yet"}
                </p>
              </header>
              {quarterFields.map((field) => (
                <label key={field.id}>
                  {field.label}
                  <textarea
                    name={field.id}
                    defaultValue={quarter.notes[field.id]}
                    rows={2}
                    maxLength={QUARTER_NOTE_MAX}
                  />
                </label>
              ))}
              <AdminSubmit />
              <div className="book-admin__secondary-actions">
                <button type="submit" formAction={deleteQuarter}>Delete quarter</button>
              </div>
            </form>
          ))}
        </div>
      )}
    </section>
  );
}
